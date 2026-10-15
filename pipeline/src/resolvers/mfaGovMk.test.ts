import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, before, describe, it } from 'node:test';
import { NorthMacedoniaSources } from '@/data/sources';
import { runChecks } from '../runChecks';
import { buildFill, isoForName, mfaGovMk, mfaGovMkOptions, NO_PAGE, PAGE_URL, parseRegionPage, withoutContactBlock } from './mfaGovMk';

const FIXTURES = join(import.meta.dirname, '..', '..', 'fixtures', 'mfa-gov-mk');
const AFRICA = readFileSync(join(FIXTURES, 'region-africa.html'), 'utf-8');
const BENIN = readFileSync(join(FIXTURES, 'update-benin.json'));

/** Every country button on the Africa page of 2026-10-15, as the site spells them. */
const AFRICA_NAMES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon',
  'Central African Republic', 'Chad', 'Comoros', 'Congo', "Côte D 'Ivoire", 'Djibouti', 'DR of the Congo',
  'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea',
  'Guinea Bissau', 'Guyana', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali',
  'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
  'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
  'Sudan', 'Togo', 'Tunizi', 'Uganda', 'United Republic of Tanzania', 'Zambia', 'Zimbabwe',
];

before(() => {
  mfaGovMkOptions.callSpacingMs = 0;
});

describe('parseRegionPage', () => {
  it('reads the consular-services component, not the other Livewire components', () => {
    const page = parseRegionPage(AFRICA);
    assert.equal(page.csrf, 'dmmSVG9pNKO4sjwseyjIqkRaWyQYG5ctcTg8Fjgv');
    assert.equal(JSON.parse(page.snapshot ?? '{}').memo.name, 'public.hardcoded-modules.consular-services');
    assert.deepEqual(page.regions, ['africa', 'asia', 'australia_and_oceania', 'europe', 'north_america', 'south_america']);
    assert.deepEqual(page.countries.map((c) => [c.record, c.name]), [
      [49, 'Algeria'], [51, 'Benin'], [53, "Côte D 'Ivoire"], [599, 'Tunizi'], [567, 'Zimbabwe'],
    ]);
  });
});

describe('name matching', () => {
  it("maps every country on the Africa page, the site's spellings included", () => {
    assert.deepEqual(AFRICA_NAMES.filter((n) => !isoForName(n)), []);
    assert.equal(isoForName("Côte D 'Ivoire"), 'CI');
    assert.equal(isoForName('DR of the Congo'), 'CD');
    assert.equal(isoForName('Congo'), 'CG');
    assert.equal(isoForName('Tunizi'), 'TN');
  });

  it('maps the standard English name of every NorthMacedoniaSources key', () => {
    const display = new Intl.DisplayNames(['en'], { type: 'region' });
    const wrong = Object.keys(NorthMacedoniaSources).filter((k) => isoForName(display.of(k)!) !== k);
    assert.deepEqual(wrong, []);
  });

  it('maps the names the 2026-10-15 run could not place', () => {
    assert.deepEqual(
      ['Micronesia - Federated States of', 'Bosnia and Hercegovina', 'Kingdom of the Netherlands', 'USA', 'Venezuela, Bolivarian Republic of'].map(isoForName),
      ['FM', 'BA', 'NL', 'US', 'VE'],
    );
  });

  it('notes names it cannot place instead of dropping them silently', () => {
    const { fill, note } = buildFill([
      { region: 'africa', record: 51, name: 'Benin' },
      { region: 'asia', record: 9999, name: 'Atlantis' },
    ]);
    assert.equal(fill.get('BJ'), 'africa/51');
    assert.match(note ?? '', /Atlantis \(asia\)/);
  });
});

describe('extract', () => {
  it("keeps the rule panel from the update response's re-rendered HTML", () => {
    const snap = mfaGovMk.extract(BENIN, 'application/json', `${PAGE_URL}#africa/51`);
    assert.equal(snap.text, 'Benin\nVisa for foreign citizens:\nNeeded');
  });
});

describe('withoutContactBlock', () => {
  it('drops the embassy contacts but keeps the rule, its footnotes and any notes', () => {
    const text = [
      'India', 'Visa for foreign citizens:', 'Needed',
      '*Holders of diplomatic passports do not require a visa for short stays.',
      'Competent DM/CP of the Republic of North Macedonia',
      'Phone: ++ 91 (11) 4614 2603', 'Address: B-1/1 GROUND FLOOR, VASANT VIHAR, NEW DELHI', 'Е-mail: delhi@mfa.gov.mk',
      'Ambassador: Slobodan Uzunov', 'Notes:', 'Visa on arrival is not available.',
    ].join('\n');
    const snap = withoutContactBlock({
      url: 'x', contentType: 'application/json', updatedAt: null, text,
      links: [{ text: 'delhi@mfa.gov.mk', href: 'mailto:delhi@mfa.gov.mk' }, { text: 'eVisa', href: 'https://example.org/evisa' }],
    });
    assert.equal(
      snap.text,
      'India\nVisa for foreign citizens:\nNeeded\n*Holders of diplomatic passports do not require a visa for short stays.\nNotes:\nVisa on arrival is not available.',
    );
    assert.deepEqual(snap.links.map((l) => l.href), ['https://example.org/evisa']);
  });
});

describe('runChecks with the mfa.gov.mk resolver', () => {
  const realFetch = globalThis.fetch;
  let dir: string | undefined;
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  const REGIONS = ['africa', 'asia', 'australia_and_oceania', 'europe', 'north_america', 'south_america'];
  const display = new Intl.DisplayNames(['en'], { type: 'region' });
  // Every NorthMacedoniaSources key that has a page, spread over the six regions.
  const countries = Object.keys(NorthMacedoniaSources)
    .filter((k) => !NO_PAGE.has(k))
    .map((iso, i) => ({ iso, record: 1000 + i, name: display.of(iso)!, region: REGIONS[i % REGIONS.length] }));

  function regionPage(region: string): string {
    const snapshot = JSON.stringify({ data: { region }, memo: { name: 'public.hardcoded-modules.consular-services' }, checksum: region });
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    const buttons = countries
      .filter((c) => c.region === region)
      .map((c) => `<div wire:click="changeHardcodedRecord(${c.record})"><div>${esc(c.name)}</div></div>`)
      .join('');
    const regionButtons = REGIONS.map((r) => `<div wire:click="changeRegion('${r}')">${r}</div>`).join('');
    return `<html><head><meta name="csrf-token" content="tok"></head><body><div wire:snapshot="${esc(snapshot)}">${regionButtons}${buttons}</div></body></html>`;
  }

  /** Serves the region pages and /livewire/update, checking each call carries the session and that region's snapshot. */
  function serve(rules: (iso: string) => string, status = 200) {
    const calls: number[] = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith(`${PAGE_URL}?region=`)) {
        return new Response(regionPage(url.split('=')[1]), { headers: { 'set-cookie': 'foreign_session=abc; path=/', 'content-type': 'text/html' } });
      }
      if (url === 'https://mfa.gov.mk/livewire/update') {
        if (status !== 200) return new Response('', { status });
        const headers = new Headers(init?.headers);
        assert.match(headers.get('cookie') ?? '', /foreign_session=abc/);
        const body = JSON.parse(String(init?.body));
        assert.equal(body._token, 'tok');
        const record = body.components[0].calls[0].params[0];
        const c = countries.find((x) => x.record === record)!;
        assert.equal(JSON.parse(body.components[0].snapshot).data.region, c.region);
        calls.push(record);
        const html = `<div><div class="w-full"><div><div class="p-5 md:p-8"><p>${c.name}</p><p>Visa for foreign citizens:</p><p>${rules(c.iso)}</p></div></div></div></div>`;
        return new Response(JSON.stringify({ components: [{ snapshot: '{}', effects: { html } }] }), { headers: { 'content-type': 'application/json' } });
      }
      return new Response('not found', { status: 404 });
    }) as typeof fetch;
    return calls;
  }

  it('diffs each country rule and the country list from run to run', async () => {
    dir = mkdtempSync(join(tmpdir(), 'mk-'));
    const regions = { NorthMacedonia: NorthMacedoniaSources };
    const calls = serve(() => 'Needed');
    const [first] = await runChecks(regions, { snapshotDir: dir, recheckDelayMs: 0 });
    assert.equal(calls.length, countries.length);
    const byKey = (r: typeof first, key: string) => r.ruleChecks.find((c) => c.keys.length === 1 && c.keys[0] === key && c.link === 'direct.alternate');
    assert.equal(byKey(first, 'BJ')?.status, 'first-run');
    assert.equal(first.ruleChecks.find((c) => c.url === `${PAGE_URL}#countries`)?.status, 'first-run');
    assert.ok(!first.ruleChecks.some((c) => c.status === 'fetch-error'), JSON.stringify(first.ruleChecks.filter((c) => c.status === 'fetch-error')));

    serve((iso) => (iso === 'BJ' ? 'Not needed' : 'Needed'));
    const [second] = await runChecks(regions, { snapshotDir: dir, recheckDelayMs: 0 });
    assert.equal(byKey(second, 'BJ')?.status, 'text-changed');
    assert.match(byKey(second, 'BJ')?.textDiffPreview ?? '', /- Needed\n\+ Not needed/);
    assert.equal(byKey(second, 'CA')?.status, 'unchanged');
    assert.equal(second.ruleChecks.find((c) => c.url === `${PAGE_URL}#countries`)?.status, 'unchanged');
  });

  it('reports a rejected session on each call', async () => {
    dir = mkdtempSync(join(tmpdir(), 'mk-'));
    serve(() => 'Needed', 419);
    const [report] = await runChecks({ NorthMacedonia: { BJ: NorthMacedoniaSources.BJ } }, { snapshotDir: dir, recheckDelayMs: 0 });
    const health = report.linkHealth.find((l) => l.url.startsWith(`${PAGE_URL}#`));
    assert.equal(health?.status, 'broken');
    assert.match(health?.error ?? '', /HTTP 419/);
  });
});
