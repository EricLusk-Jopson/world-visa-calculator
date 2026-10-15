import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { AlbaniaSources } from '@/data/sources';
import { compareSnapshots } from '../contentCheck';
import { runChecks } from '../runChecks';
import { buildDiscovery, isoForName, NO_PAGE, PAGE_URL, parseLiteral, parseTablePage, punetejashtmeGovAl } from './punetejashtmeGovAl';

const TABLE = readFileSync(join(import.meta.dirname, '..', '..', 'fixtures', 'punetejashtme-gov-al', 'table.html'), 'utf-8');

/** The page with one country's entry edited in its script. */
function editEntry(html: string, slug: string, from: string, to: string): string {
  const start = html.indexOf(`'${slug}': {`);
  const end = html.indexOf('\n        },', start);
  const entry = html.slice(start, end);
  assert.ok(entry.includes(from), `${from} not in ${slug}`);
  return html.slice(0, start) + entry.replace(from, to) + html.slice(end);
}

describe('parseLiteral', () => {
  it('reads literals and picks the English side of a language choice', () => {
    const src = `{ a: 'x', "b": [1, "two", ], c: currentLanguage === 'en' ? 'WITH VISA' : 'ME VIZË', // note
      d: { e: null /* gone */ }, f: 'it\\'s' };`;
    assert.deepEqual(parseLiteral(src, 0).value, { a: 'x', b: [1, 'two'], c: 'WITH VISA', d: { e: null }, f: "it's" });
  });

  it('refuses anything that would need running', () => {
    assert.throws(() => parseLiteral(`{ a: fetch('x') }`, 0), /unsupported syntax at line 1/);
    assert.throws(() => parseLiteral(`{ a: 'x' + 'y' }`, 0), /expected "," or "}"/);
    assert.throws(() => parseLiteral(`{ a: \`x\` }`, 0), /unsupported syntax/);
  });
});

describe('parseTablePage', () => {
  it('reads the selector and every countryData entry', () => {
    const page = parseTablePage(TABLE);
    assert.equal(page.options.length, 167);
    assert.equal(Object.keys(page.data).length, 167);
    assert.deepEqual(page.options.find((o) => o.slug === 'kongo'), { slug: 'kongo', name: 'CONGO' });
    const sa = page.data['arabia-saudite'] as Record<string, Record<string, string>>;
    assert.equal(sa.visaC.kombetare, 'WITHOUT VISA');
    assert.match(sa.visaAC.aplikimVisaAC, /VISA-FREE REGIME ONLY FOR THE TOURIST SEASON 15\.04\.2026 TO 31\.12\.2026/);
  });

  it('fails without the script', () => {
    assert.throws(() => parseTablePage('<html><body><select id="country"></select></body></html>'), /no countryData script/);
  });
});

describe('name table', () => {
  it('maps every country on the 2026-10-15 page to an AlbaniaSources key', () => {
    const d = buildDiscovery(parseTablePage(TABLE));
    assert.equal(d.error, undefined);
    assert.equal(d.note, undefined);
    assert.deepEqual(Object.keys(AlbaniaSources).filter((k) => !d.fill.has(k) && !NO_PAGE.has(k)), []);
    assert.deepEqual([...d.fill.keys()].filter((k) => !(k in AlbaniaSources)), []);
  });

  it('reads the site’s spellings', () => {
    assert.equal(isoForName('R0MANIA'), 'RO');
    assert.equal(isoForName('SLLOVENIA'), 'SI');
    assert.equal(isoForName('VATICAN (HOLY SEAT)'), 'VA');
    assert.equal(isoForName('HONG KONG (CHINA)'), 'HK');
    assert.equal(isoForName('GIBRALTAR'), null);
  });
});

describe('extract', () => {
  const snapshotOf = (slug: string, html = TABLE) => {
    const page = parseTablePage(html);
    const name = page.options.find((o) => o.slug === slug)?.name;
    const body = Buffer.from(JSON.stringify({ slug, name, entry: page.data[slug] }));
    return punetejashtmeGovAl.extract(body, 'application/json', `${PAGE_URL}#${slug}`);
  };

  it('writes the entry as labelled lines in table order, without the flag', () => {
    const snap = snapshotOf('arabia-saudite');
    const lines = snap.text.split('\n');
    assert.equal(lines[0], 'SAUDI ARABIA');
    assert.equal(lines[3], 'A/C (short-stay) visa, national passport: WITHOUT VISA');
    assert.ok(lines.includes('A/C visa application: https://e-visa.al/ VISA-FREE REGIME ONLY FOR THE TOURIST SEASON 15.04.2026 TO 31.12.2026'));
    assert.ok(lines.includes('Where to apply: EMBASSY OF ALBANIA IN RIAD'));
    assert.doesNotMatch(snap.text, /wp-content|ARABIA SAUDITE|<a /);
    assert.ok(snap.links.some((l) => l.href === 'https://punetejashtme.gov.al/info-per-te-huajt/'));
  });

  it('reports a rule change as a changed line', () => {
    const before = snapshotOf('afghanistan');
    const after = snapshotOf('afghanistan', editEntry(TABLE, 'afghanistan', "kombetare: currentLanguage === 'en' ? 'WITH VISA'", "kombetare: currentLanguage === 'en' ? 'WITHOUT VISA'"));
    const result = compareSnapshots(before, after);
    assert.equal(result.status, 'text-changed');
    assert.match(result.textDiffPreview ?? '', /- A\/C \(short-stay\) visa, national passport: WITH VISA\n\+ A\/C \(short-stay\) visa, national passport: WITHOUT VISA/);
  });
});

describe('runChecks with the punetejashtme.gov.al resolver', () => {
  const realFetch = globalThis.fetch;
  let dir: string | undefined;
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  function serve(html: string | null) {
    const requested: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      requested.push(url);
      if (html !== null && url === PAGE_URL) return new Response(html, { headers: { 'content-type': 'text/html' } });
      return new Response('denied', { status: 403 });
    }) as typeof fetch;
    return requested;
  }

  it('diffs each country from one page fetch, keyed by nationality code', async () => {
    dir = mkdtempSync(join(tmpdir(), 'al-'));
    const regions = { Albania: { CN: AlbaniaSources.CN, SA: AlbaniaSources.SA } };
    serve(TABLE);
    const [first] = await runChecks(regions, { snapshotDir: dir, recheckDelayMs: 0 });
    const row = (r: typeof first, suffix: string) => r.ruleChecks.find((c) => c.url === `${PAGE_URL}${suffix}`);
    assert.equal(row(first, '#kina')?.status, 'first-run');
    assert.equal(row(first, '#countries')?.status, 'first-run');
    assert.equal(first.linkHealth.find((l) => l.url === PAGE_URL)?.status, 'live');

    const edited = editEntry(TABLE, 'kina', "applyLocation: currentLanguage === 'en' ? '", "applyLocation: currentLanguage === 'en' ? 'NEW: ");
    const requested = serve(edited);
    const [second] = await runChecks(regions, { snapshotDir: dir, recheckDelayMs: 0 });
    assert.equal(row(second, '#kina')?.status, 'text-changed');
    assert.equal(row(second, '#arabia-saudite')?.status, 'unchanged');
    assert.equal(row(second, '#countries')?.status, 'unchanged');
    assert.ok(requested.every((u) => u === PAGE_URL || u === 'https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/'), requested.join(', '));
  });

  it('reports a failed page once, not once per country', async () => {
    dir = mkdtempSync(join(tmpdir(), 'al-'));
    serve(null);
    const [report] = await runChecks({ Albania: { CN: AlbaniaSources.CN, SA: AlbaniaSources.SA } }, { snapshotDir: dir, recheckDelayMs: 0 });
    const rows = report.ruleChecks.filter((c) => c.url.startsWith(`${PAGE_URL}#`));
    assert.deepEqual(rows.map((c) => [c.url, c.status]), [[`${PAGE_URL}#countries`, 'fetch-error']]);
    assert.match(rows[0].error ?? '', /HTTP 403/);
  });
});
