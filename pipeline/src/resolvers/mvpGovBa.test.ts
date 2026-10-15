import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { BosniaSources } from '@/data/sources';
import { compareSnapshots } from '../contentCheck';
import { runChecks } from '../runChecks';
import { buildDiscovery, INDEX_URL, isoForName, mvpGovBa, NO_PAGE, parseSubpages, slugDate, type Subpage } from './mvpGovBa';

const FIXTURES = join(import.meta.dirname, '..', '..', 'fixtures', 'mvp-gov-ba');
const SUBPAGES: Subpage[] = JSON.parse(readFileSync(join(FIXTURES, 'subpages-2026-10-15.json'), 'utf-8'));
const CANADA = readFileSync(join(FIXTURES, 'subpage-canada.json'));

/**
 * An index page shaped like the real one: the country selector's props sit in
 * the RSC payload, escaped the way Next.js escapes it and split mid-string
 * across several `self.__next_f.push` chunks.
 */
function indexHtml(subpages: Subpage[]): string {
  const payload =
    '21:I[64862,["static/chunks/app/page.js"],"SubpageSelect"]\n' +
    `6:["$","$L21",null,{"subpages":${JSON.stringify(subpages)},"domain":"https://www.mvp.gov.ba","locale":"en","initialLabel":"Vize"}]\n` +
    '13:{"metadata":[],"subpages":[]}\n';
  const chunks: string[] = [];
  for (let i = 0; i < payload.length; i += 2_000) chunks.push(payload.slice(i, i + 2_000));
  const scripts = chunks.map((c, i) => {
    const literal = JSON.stringify(c).replace(/</g, '\\u003c');
    return `<script>self.__next_f.push([1,${i % 2 ? ' ' : ''}${literal}])</script>`;
  });
  return `<!DOCTYPE html><html><body><main><h1>Vize</h1></main><script>(self.__next_f = self.__next_f || []).push([0])</script>${scripts.join('')}</body></html>`;
}

describe('parseSubpages', () => {
  it('reads the country selector from the chunked RSC payload', () => {
    const parsed = parseSubpages(indexHtml(SUBPAGES));
    assert.equal(parsed.length, 194);
    assert.deepEqual(parsed.find((s) => s.title === 'Canada'), {
      title: 'Canada',
      slug: 'org_cmd57sdlc000nn43u2rk8pgsd_639142770283664500',
    });
    assert.ok(parsed.some((s) => s.title === 'Šri Lanka'));
  });

  it('finds nothing on a page without the selector', () => {
    assert.deepEqual(parseSubpages('<html><body>Maintenance</body></html>'), []);
  });
});

describe('name table', () => {
  it('maps every country on the 2026-10-15 index', () => {
    const missing = SUBPAGES.filter((s) => isoForName(s.title) === undefined).map((s) => s.title);
    assert.deepEqual(missing, []);
  });

  it('finds a page for every BosniaSources key except those with none by design', () => {
    const { fill } = buildDiscovery(SUBPAGES);
    const missing = Object.keys(BosniaSources).filter((k) => !fill.has(k) && !NO_PAGE.has(k));
    assert.deepEqual(missing, []);
    assert.equal(new Set(fill.values()).size, fill.size, 'two codes resolved to one page');
  });

  it('tolerates spacing and Unicode normalization differences', () => {
    assert.equal(isoForName('  Burkina  Fasó '), 'BF');
    assert.equal(isoForName('Šri Lanka'), 'LK'); // decomposed Š
  });
});

describe('slugDate', () => {
  it('decodes the trailing .NET ticks', () => {
    assert.equal(slugDate('org_cmd57sdlc000nn43u2rk8pgsd_638883477779561428'), '2025-07-17'); // Algeria
    assert.equal(slugDate('org_cmd57sdlc000nn43u2rk8pgsd_639142770283664500'), '2026-05-13'); // Canada
    assert.equal(slugDate('not-a-slug'), undefined);
  });
});

describe('extract', () => {
  it('diffs the page text and links, not the layout fields', () => {
    const snap = mvpGovBa.extract(CANADA, 'application/json', 'https://www.mvp.gov.ba/api/subpage/x');
    assert.match(snap.text, /^Canada\n/);
    assert.match(snap.text, /Citizens of the Canada are exempted from the visa requirement/);
    assert.ok(snap.links.some((l) => l.href.endsWith('asset-639142755799574492.pdf')));
    assert.doesNotMatch(snap.text, /Subpage_Plain|assetUrl|page_cmd8ah8ot/);
  });
});

describe('discovery', () => {
  it('flags names missing from the table without failing', () => {
    const d = buildDiscovery([...SUBPAGES, { title: 'Atlantis', slug: 'org_x_639300000000000000' }]);
    assert.equal(d.error, undefined);
    assert.match(d.note ?? '', /Atlantis/);
    assert.match(d.listing.text, /Atlantis → not in the name table/);
  });

  it('reports a republished page as a changed slug and date in the list', () => {
    const before = buildDiscovery(SUBPAGES).listing;
    const republished = SUBPAGES.map((s) =>
      s.title === 'Saudi Arabia' ? { ...s, slug: 'org_cmd57sdlc000nn43u2rk8pgsd_639300000000000000' } : s,
    );
    const result = compareSnapshots(before, buildDiscovery(republished).listing);
    assert.equal(result.status, 'both-changed');
    assert.match(result.textDiffPreview ?? '', /- Saudi Arabia → SA · page dated 2026-10-13\n\+ Saudi Arabia → SA · page dated 2026-11-11/);
    assert.deepEqual(result.linkChanges?.map((c) => [c.kind, c.text]), [['target-changed', 'Saudi Arabia']]);
  });

  it('falls back to the previous list when the index fails', async () => {
    const previous = buildDiscovery(SUBPAGES).listing;
    const d = await mvpGovBa.discover(async () => ({ status: 'blocked', httpStatus: 403, error: 'HTTP 403' }), previous);
    assert.match(d.error ?? '', /HTTP 403/);
    assert.equal(d.fill.get('CA'), 'org_cmd57sdlc000nn43u2rk8pgsd_639142770283664500');
    assert.match(d.note ?? '', /previous run/);
  });

  it('treats a short list as a changed page, not as countries removed', async () => {
    const html = indexHtml(SUBPAGES.slice(0, 10));
    const d = await mvpGovBa.discover(async () => ({ status: 'live', body: Buffer.from(html), contentType: 'text/html' }), null);
    assert.match(d.error ?? '', /found 10 countries/);
    assert.equal(d.fill.size, 0);
  });
});

describe('runChecks with the mvp.gov.ba resolver', () => {
  const realFetch = globalThis.fetch;
  let dir: string | undefined;
  afterEach(() => {
    globalThis.fetch = realFetch;
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  /** Serves the index and subpage API from in-memory data; counts requests. */
  function serve(subpages: Subpage[], pages: Record<string, string>) {
    const requested: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      requested.push(url);
      const json = (body: string) => new Response(body, { headers: { 'content-type': 'application/json' } });
      if (url === INDEX_URL) return new Response(indexHtml(subpages), { headers: { 'content-type': 'text/html' } });
      const slug = /\/api\/subpage\/([^?]+)/.exec(url)?.[1];
      if (slug && pages[slug]) return json(pages[slug]);
      return new Response('not found', { status: 404 });
    }) as typeof fetch;
    return requested;
  }

  it('diffs a republished page against its previous content', async () => {
    dir = mkdtempSync(join(tmpdir(), 'mvp-'));
    const regions = { Bosnia: { CA: BosniaSources.CA, SA: BosniaSources.SA, TW: BosniaSources.TW } };
    const canadaSlug = 'org_cmd57sdlc000nn43u2rk8pgsd_639142770283664500';
    const saOld = 'org_cmd57sdlc000nn43u2rk8pgsd_639274788685078781';
    const saNew = 'org_cmd57sdlc000nn43u2rk8pgsd_639300000000000000';
    const page = (title: string, rule: string) => JSON.stringify({ title, content: `<p>${rule}</p>`, attachedFiles: [] });

    serve(SUBPAGES, { [canadaSlug]: CANADA.toString(), [saOld]: page('Saudi Arabia', 'Visa required.') });
    const [first] = await runChecks(regions, { snapshotDir: dir, recheckDelayMs: 0 });
    const status = (r: typeof first, suffix: string) => r.ruleChecks.find((c) => c.url.includes(suffix))?.status;
    assert.equal(status(first, saOld), 'first-run');
    assert.equal(status(first, '#subpages'), 'first-run');
    assert.ok(!first.ruleChecks.some((c) => c.keys.includes('TW') && c.status === 'fetch-error'), 'TW has no page by design');
    assert.equal(first.linkHealth.find((l) => l.url.includes(canadaSlug))?.status, 'live');

    const republished = SUBPAGES.map((s) => (s.title === 'Saudi Arabia' ? { ...s, slug: saNew } : s));
    serve(republished, { [canadaSlug]: CANADA.toString(), [saNew]: page('Saudi Arabia', 'Visa-free for 30 days.') });
    const [second] = await runChecks(regions, { snapshotDir: dir, recheckDelayMs: 0 });
    const sa = second.ruleChecks.find((c) => c.url.includes(saNew));
    assert.equal(sa?.status, 'text-changed');
    assert.match(sa?.textDiffPreview ?? '', /- Visa required\.\n\+ Visa-free for 30 days\./);
    assert.equal(status(second, canadaSlug), 'unchanged');
    assert.equal(status(second, '#subpages'), 'both-changed');
  });

  it('reports a key with no page when the country drops off the index', async () => {
    dir = mkdtempSync(join(tmpdir(), 'mvp-'));
    serve(SUBPAGES.filter((s) => s.title !== 'Canada'), {});
    const [report] = await runChecks({ Bosnia: { CA: BosniaSources.CA } }, { snapshotDir: dir, recheckDelayMs: 0 });
    const ca = report.ruleChecks.find((c) => c.url === `${INDEX_URL}#CA`);
    assert.equal(ca?.status, 'fetch-error');
    assert.match(ca?.error ?? '', /No page for CA/);
  });
});
