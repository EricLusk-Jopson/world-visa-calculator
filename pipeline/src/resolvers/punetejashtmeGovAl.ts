import * as cheerio from 'cheerio';
import { extractSnapshot } from '../contentCheck';
import type { FetchOutcome } from '../fetchPage';
import type { ContentLink, ContentSnapshot } from '../types';
import type { Discovery, Resolver } from './index';
import { isoForName as standardIsoForName, normalizeName } from './mfaGovMk';

/**
 * Albania MFA (punetejashtme.gov.al), "Visa regime for foreign citizens".
 *
 * The page is one table filled in by script: picking a country in
 * `<select id="country">` copies that country's entry from an inline
 * `const countryData = { 'slug': {...}, ... }` object into the cells. Every
 * country's rule is therefore already in the page's HTML, inside that script,
 * and there is no per-country URL.
 *
 * So each run GETs the page once, reads the selector (slug → English name)
 * and parses `countryData` as data — never runs it. The object is plain
 * literals except for `currentLanguage === 'en' ? '…' : '…'` choices, which
 * the parser resolves to the English side. Each country's entry is then
 * diffed as its own snapshot, keyed by nationality code; fetching a key
 * makes no request, it just hands over the entry read from the page.
 */

export const PAGE_URL = 'https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/';
/** Fewer countries than this means the page changed shape, not that most countries vanished. */
const MIN_EXPECTED_COUNTRIES = 120;

/** AlbaniaSources keys the table has no entry for, by design: none (AL itself has no source entry). */
export const NO_PAGE: ReadonlySet<string> = new Set();

/** The selector's English names that the standard names (mfaGovMk.ts) don't cover. */
const ALIASES: Record<string, string | null> = {
  R0MANIA: 'RO', // zero for O
  SLLOVENIA: 'SI', // the Albanian spelling
  PHILIPPINE: 'PH',
  SURINAM: 'SR',
  SALVADOR: 'SV',
  'HONG KONG (CHINA)': 'HK',
  'MACAU (CHINA)': 'MO',
  CONGO: 'CG', // one entry, the Republic of the Congo (see regions/albania.ts)
  GIBRALTAR: null, // no nationality code in this app
};
const aliasIso = new Map(Object.entries(ALIASES).map(([name, iso]) => [normalizeName(name), iso]));

/** `undefined`: not recognized. `null`: known, no nationality code in this app. */
export function isoForName(name: string): string | null | undefined {
  const key = normalizeName(name);
  return aliasIso.has(key) ? aliasIso.get(key) : standardIsoForName(name);
}

// ─── countryData: a parser for JavaScript literals, no evaluation ───────────

export type Value = string | number | boolean | null | Value[] | { [key: string]: Value };

/**
 * Parses the object literal at `start` in `src`: objects, arrays, strings,
 * numbers, comments, trailing commas, and `currentLanguage === 'en' ? A : B`
 * (taken as A). Anything else — a function call, a variable, `+` — throws
 * with its position, so a change in how the page is written fails loudly.
 */
export function parseLiteral(src: string, start: number): { value: Value; end: number } {
  let i = start;
  const fail = (what: string): never => {
    const line = src.slice(0, i).split('\n').length;
    throw new Error(`${what} at line ${line} of the countryData script: ${JSON.stringify(src.slice(i, i + 60))}`);
  };
  const skip = () => {
    for (;;) {
      if (/\s/.test(src[i] ?? '')) i++;
      else if (src.startsWith('//', i)) i = src.indexOf('\n', i) === -1 ? src.length : src.indexOf('\n', i);
      else if (src.startsWith('/*', i)) {
        const close = src.indexOf('*/', i + 2);
        if (close === -1) fail('unclosed comment');
        i = close + 2;
      } else return;
    }
  };
  const ident = () => {
    const m = /^[A-Za-z_$][\w$]*/.exec(src.slice(i, i + 100));
    return m?.[0];
  };
  const string = (): string => {
    const quote = src[i++];
    let out = '';
    while (i < src.length && src[i] !== quote) {
      if (src[i] === '\n') fail('line break in string');
      if (src[i] !== '\\') {
        out += src[i++];
        continue;
      }
      const c = src[++i];
      i++;
      if (c === 'n') out += '\n';
      else if (c === 't') out += '\t';
      else if (c === 'u') {
        out += String.fromCharCode(parseInt(src.slice(i, i + 4), 16));
        i += 4;
      } else if (c === '\n') continue;
      else out += c;
    }
    if (src[i] !== quote) fail('unclosed string');
    i++;
    return out;
  };
  const value = (): Value => {
    skip();
    const c = src[i];
    if (c === '{') {
      i++;
      const obj: Record<string, Value> = {};
      for (;;) {
        skip();
        if (src[i] === '}') {
          i++;
          return obj;
        }
        let key: string | undefined;
        if (src[i] === "'" || src[i] === '"') key = string();
        else {
          key = ident();
          if (!key) fail('expected a property name');
          i += key!.length;
        }
        skip();
        if (src[i] !== ':') fail('expected ":"');
        i++;
        obj[key!] = value();
        skip();
        if (src[i] === ',') i++;
        else if (src[i] !== '}') fail('expected "," or "}"');
      }
    }
    if (c === '[') {
      i++;
      const arr: Value[] = [];
      for (;;) {
        skip();
        if (src[i] === ']') {
          i++;
          return arr;
        }
        arr.push(value());
        skip();
        if (src[i] === ',') i++;
        else if (src[i] !== ']') fail('expected "," or "]"');
      }
    }
    if (c === "'" || c === '"') return string();
    const num = /^-?\d+(\.\d+)?/.exec(src.slice(i, i + 30));
    if (num) {
      i += num[0].length;
      return Number(num[0]);
    }
    const lang = /^currentLanguage\s*===?\s*(['"])(\w+)\1\s*\?/.exec(src.slice(i, i + 60));
    if (lang) {
      i += lang[0].length;
      const english = value();
      skip();
      if (src[i] !== ':') fail('expected ":" in a currentLanguage choice');
      i++;
      const other = value();
      return lang[2] === 'en' ? english : other;
    }
    const word = ident();
    if (word === 'true' || word === 'false' || word === 'null') {
      i += word.length;
      return word === 'true' ? true : word === 'false' ? false : null;
    }
    return fail('unsupported syntax');
  };
  const parsed = value();
  return { value: parsed, end: i };
}

const MARKER = /\bconst\s+countryData\s*=\s*/;

export type CountryOption = { slug: string; name: string };
export type TablePage = { options: CountryOption[]; data: Record<string, Value> };

/** The selector's countries and the parsed countryData. Throws when either can't be read. */
export function parseTablePage(html: string): TablePage {
  const $ = cheerio.load(html);
  const options = $('select#country option[value]')
    .toArray()
    .map((el) => ({ slug: $(el).attr('value')!.trim(), name: $(el).text().replace(/\s+/g, ' ').trim() }))
    .filter((o) => o.slug !== '');
  const script = $('script')
    .toArray()
    .map((el) => $(el).text())
    .find((text) => MARKER.test(text));
  if (script === undefined) throw new Error('no countryData script on the page');
  const at = MARKER.exec(script)!;
  const { value } = parseLiteral(script, at.index + at[0].length);
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('countryData is not an object');
  return { options, data: value };
}

// ─── Discovery ──────────────────────────────────────────────────────────────

type Country = { slug: string; name: string; iso: string | null | undefined };

/** Every country in countryData, named by the selector (or its Albanian name when the selector has no option for it). */
function countriesOf(page: TablePage): Country[] {
  const names = new Map(page.options.map((o) => [o.slug, o.name]));
  return Object.entries(page.data).map(([slug, entry]) => {
    const name = names.get(slug);
    const albanian = (entry as Record<string, Value>)?.countryName;
    return { slug, name: name ?? `${String(albanian ?? slug)} (not in the selector)`, iso: name === undefined ? undefined : isoForName(name) };
  });
}

function listingSnapshot(countries: Country[]): ContentSnapshot {
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const text = sorted
    .map((c) => `${c.name} → ${c.iso ?? (c.iso === null ? 'no nationality code' : 'not recognized')} · ${c.slug}`)
    .join('\n');
  const links: ContentLink[] = sorted.map((c) => ({ text: c.name, href: `${PAGE_URL}#${c.slug}` }));
  return { url: PAGE_URL, contentType: 'application/json', updatedAt: null, text, links };
}

/** Nationality code → slug, the listing, and notes on anything that didn't map cleanly. */
export function buildDiscovery(page: TablePage): Omit<Discovery, 'fetch'> {
  const countries = countriesOf(page);
  const fill = new Map<string, string>();
  const unknown: string[] = [];
  const duplicate: string[] = [];
  for (const c of countries) {
    if (c.iso === undefined) unknown.push(`${c.name} (${c.slug})`);
    else if (c.iso === null) continue;
    else if (fill.has(c.iso)) duplicate.push(`${c.name} (${c.iso})`);
    else fill.set(c.iso, c.slug);
  }
  const inData = new Set(Object.keys(page.data));
  const optionOnly = page.options.filter((o) => !inData.has(o.slug)).map((o) => `${o.name} (${o.slug})`);
  const notes: string[] = [];
  if (unknown.length > 0) notes.push(`Not recognized as a country (add to ALIASES in pipeline/src/resolvers/punetejashtmeGovAl.ts): ${unknown.join(', ')}`);
  if (duplicate.length > 0) notes.push(`More than one entry for: ${duplicate.join(', ')}; the first is used`);
  if (optionOnly.length > 0) notes.push(`In the selector but missing from countryData: ${optionOnly.join(', ')}`);
  let error: string | undefined;
  if (countries.length < MIN_EXPECTED_COUNTRIES) {
    error = `found ${countries.length} countries in countryData (expected ${MIN_EXPECTED_COUNTRIES}+); the page may have changed shape`;
  }
  return {
    fill: error ? new Map() : fill,
    noPage: NO_PAGE,
    listing: listingSnapshot(error ? [] : countries),
    indexUrl: PAGE_URL,
    error: error && `Could not read the country table: ${error}`,
    note: notes.length > 0 ? notes.join('. ') : undefined,
  };
}

async function discover(fetch: (url: string) => Promise<FetchOutcome>): Promise<Discovery> {
  const failed = (error: string): Discovery => ({
    fill: new Map(),
    noPage: NO_PAGE,
    listing: listingSnapshot([]),
    indexUrl: PAGE_URL,
    error: `Could not read the country table: ${error}`,
  });
  const outcome = await fetch(PAGE_URL);
  if (!outcome.body) return failed(outcome.error ?? (outcome.httpStatus ? `HTTP ${outcome.httpStatus}` : 'no response body'));
  let page: TablePage;
  try {
    page = parseTablePage(outcome.body.toString('utf-8'));
  } catch (err) {
    return failed((err as Error).message);
  }
  const discovery = buildDiscovery(page);
  const names = new Map(page.options.map((o) => [o.slug, o.name]));
  return {
    ...discovery,
    // The entry was already read from the page; hand it over without another request.
    fetch: async (slug) => ({
      status: 'live',
      httpStatus: outcome.httpStatus,
      finalUrl: `${PAGE_URL}#${slug}`,
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify({ slug, name: names.get(slug) ?? slug, entry: page.data[slug] })),
    }),
  };
}

// ─── One country's entry as text ────────────────────────────────────────────

/** Table labels for the entry's fields, in the page's row order. Unlisted fields are still diffed, under their own names. */
const LABELS: Record<string, string> = {
  'visaC.diplomatike': 'A/C (short-stay) visa, diplomatic passport',
  'visaC.sherbimi': 'A/C (short-stay) visa, service passport',
  'visaC.kombetare': 'A/C (short-stay) visa, national passport',
  visaCFees: 'A/C visa fees',
  'visaD.diplomatike': 'D (long-stay) visa, diplomatic passport',
  'visaD.sherbimi': 'D (long-stay) visa, service passport',
  'visaD.kombetare': 'D (long-stay) visa, national passport',
  'visaD.fees': 'D visa fee',
  'visaAC.aplikimVisaAC': 'A/C visa application',
  'visaAC.nen6vjec': 'A/C visa, children',
  'visaAC.tarifa6': 'A/C visa, children’s fee',
  'visaDapp.aplikimVisaD': 'D visa / residence permit application',
  'visaDapp.deri12': 'D visa, children',
  'visaDapp.tarifa7': 'D visa, children’s fee',
  applyLocation: 'Where to apply',
  info: 'Additional information',
};
/** Not rule content: the flag image, and the Albanian name (the selector's English one heads the snapshot). */
const IGNORED = new Set(['flag', 'countryName']);

/** An HTML cell value as one line of text, plus its links. */
function htmlText(html: string, links: ContentLink[]): string {
  const $ = cheerio.load(`<div>${html}</div>`, null, false);
  $('a[href]').each((_, a) => {
    try {
      links.push({ text: $(a).text().replace(/\s+/g, ' ').trim(), href: new URL($(a).attr('href')!, PAGE_URL).href });
    } catch {
      // unparseable href
    }
  });
  $('br').replaceWith(' ');
  return $.root().text().replace(/\s+/g, ' ').trim();
}

/** Arrays of `{type, fee}` or `{amount}` read as "SINGLE ENTRY €45 · DOUBLE ENTRY €45". */
function inline(value: Value, links: ContentLink[]): string {
  if (Array.isArray(value)) return value.map((v) => inline(v, links)).filter(Boolean).join(' · ');
  if (value && typeof value === 'object') return Object.values(value).map((v) => inline(v, links)).filter(Boolean).join(' ');
  return htmlText(String(value ?? ''), links);
}

function lines(value: Value, path: string, links: ContentLink[], out: string[]) {
  if (value && typeof value === 'object' && !Array.isArray(value) && !LABELS[path]) {
    for (const [k, v] of Object.entries(value)) {
      if (!IGNORED.has(k)) lines(v, path ? `${path}.${k}` : k, links, out);
    }
    return;
  }
  out.push(`${LABELS[path] ?? path}: ${inline(value, links) || '(empty)'}`);
}

/** One country's entry as labelled lines, in the page's order. */
function extract(body: Buffer, contentType: string, url: string): ContentSnapshot {
  let parsed: { name?: string; entry?: Value } | undefined;
  try {
    parsed = JSON.parse(body.toString('utf-8'));
  } catch {
    // not ours
  }
  if (!parsed?.entry || typeof parsed.entry !== 'object') return extractSnapshot(body, contentType, url);
  const links: ContentLink[] = [];
  const fields: string[] = [];
  lines(parsed.entry, '', links, fields);
  const order = Object.keys(LABELS).map((p) => `${LABELS[p]}:`);
  const rank = (line: string) => {
    const at = order.findIndex((label) => line.startsWith(label));
    return at === -1 ? order.length : at;
  };
  // Array.prototype.sort is stable, so unlabelled fields keep their order at the end.
  const out = [parsed.name ?? '', ...fields.sort((a, b) => rank(a) - rank(b))];
  return { url, contentType, updatedAt: null, text: out.join('\n'), links };
}

export const punetejashtmeGovAl: Resolver = {
  listingId: `${PAGE_URL}#countries`,
  discover,
  snapshotId: (key) => `${PAGE_URL}#${key}`,
  extract,
};
