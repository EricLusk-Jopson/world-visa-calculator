import * as cheerio from 'cheerio';
import { extractHtml, extractSnapshot } from '../contentCheck';
import { BROWSER_USER_AGENT, createLimiter, type FetchOutcome } from '../fetchPage';
import type { ContentLink, ContentSnapshot } from '../types';
import type { Discovery, Resolver } from './index';

/**
 * North Macedonia MFA (mfa.gov.mk), a Laravel Livewire site.
 *
 * "Do you need a visa?" lists countries by region (?region=africa, …). Each
 * country button is `wire:click="changeHardcodedRecord(<id>)"`; clicking it
 * POSTs that call to /livewire/update with the component's signed snapshot
 * and the page's CSRF token, and the JSON response carries the re-rendered
 * component HTML (`effects.html`), whose right-hand panel is the country's
 * rule ("Visa for foreign citizens: Needed"). There is no per-country URL.
 *
 * So each run GETs every region page (keeping the session cookies), reads the
 * component snapshot, CSRF token and country buttons, maps country names to
 * nationality codes, then makes each country's call itself, one at a time.
 * A region's original snapshot is reused for all its calls: it's signed by
 * the server and stateless, so each call renders from the same start.
 */

export const PAGE_URL = 'https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza';
const UPDATE_URL = 'https://mfa.gov.mk/livewire/update';
const COMPONENT_NAME = 'public.hardcoded-modules.consular-services';
const CALL = 'changeHardcodedRecord';
const DEFAULT_REGIONS = ['africa', 'asia', 'australia_and_oceania', 'europe', 'north_america', 'south_america'];
/** Pause between calls; the site's nginx is small (the old Playwright scraper used 400 ms). Tests set it to 0. */
export const mfaGovMkOptions = { callSpacingMs: 400 };
/** Fewer countries than this means the page changed shape, not that most countries vanished. */
const MIN_EXPECTED_COUNTRIES = 150;

/** NorthMacedoniaSources keys the site has no button for (see regions/macedonia.ts). */
export const NO_PAGE = new Set(['HK', 'MO']);

export type CountryButton = { region: string; record: number; name: string };

export type RegionPage = {
  csrf?: string;
  snapshot?: string;
  regions: string[];
  countries: { record: number; name: string }[];
};

/** Reads the consular-services component off one region page. */
export function parseRegionPage(html: string): RegionPage {
  const $ = cheerio.load(html);
  const csrf = $('meta[name="csrf-token"]').attr('content') ?? $('script[data-csrf]').attr('data-csrf');
  const component = $('*')
    .filter((_, el) => {
      const raw = (el as { attribs?: Record<string, string> }).attribs?.['wire:snapshot'];
      if (!raw) return false;
      try {
        return JSON.parse(raw)?.memo?.name === COMPONENT_NAME;
      } catch {
        return false;
      }
    })
    .first();
  const attr = (el: unknown, name: string) => (el as { attribs?: Record<string, string> }).attribs?.[name] ?? '';
  const regions: string[] = [];
  const countries: { record: number; name: string }[] = [];
  component.find('*').each((_, el) => {
    const click = attr(el, 'wire:click');
    const region = /^changeRegion\('([\w-]+)'\)$/.exec(click)?.[1];
    if (region) regions.push(region);
    const record = new RegExp(`^${CALL}\\((\\d+)\\)$`).exec(click)?.[1];
    if (record) countries.push({ record: Number(record), name: $(el).text().replace(/\s+/g, ' ').trim() });
  });
  return { csrf, snapshot: component.attr('wire:snapshot'), regions, countries };
}

/** Lowercase letters and digits only, accents and punctuation dropped, so "Côte D 'Ivoire" ≈ "Côte d’Ivoire". */
export function normalizeName(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/&/g, 'and')
    .replace(/\bst\.?\s/g, 'saint ')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * The site's own spellings that the standard English names don't cover.
 * Everything else is matched against Intl's English country names.
 */
const ALIASES: Record<string, string | null> = {
  Tunizi: 'TN', // the site's misspelling of Tunisia
  'DR of the Congo': 'CD',
  Congo: 'CG',
  'Cabo Verde': 'CV',
  'Côte D\'Ivoire': 'CI',
  "Cote d'Ivoire": 'CI',
  'Ivory Coast': 'CI',
  'United Republic of Tanzania': 'TZ',
  'Republic of Korea': 'KR',
  'Korea, Republic of': 'KR',
  'Korea DPR': 'KP',
  "Democratic People's Republic of Korea": 'KP',
  'Russian Federation': 'RU',
  'United States of America': 'US',
  'Holy See': 'VA',
  Vatican: 'VA',
  'Czech Republic': 'CZ',
  Turkey: 'TR',
  Palestine: 'PS',
  'East Timor': 'TL',
  'Brunei Darussalam': 'BN',
  'Lao PDR': 'LA',
  "Lao People's Democratic Republic": 'LA',
  'Viet Nam': 'VN',
  'Syrian Arab Republic': 'SY',
  'Republic of Moldova': 'MD',
  Swaziland: 'SZ',
  Burma: 'MM',
  'Federated States of Micronesia': 'FM',
  'Saint Vincent and the Grenadines': 'VC',
  'Sao Tome and Principe': 'ST',
  // Seen on the 2026-10-15 run:
  'Micronesia - Federated States of': 'FM',
  'Bosnia and Hercegovina': 'BA',
  'Kingdom of the Netherlands': 'NL',
  USA: 'US',
  'Venezuela, Bolivarian Republic of': 'VE',
};

/** Codes Intl still names but that are retired or not countries ("Dahomey" → Benin, "UK", "EU"), skipped so they can't shadow the current code. */
const NOT_COUNTRY_CODES = new Set(['AN', 'BU', 'CS', 'DD', 'DY', 'EU', 'EZ', 'FX', 'HV', 'NH', 'NT', 'QO', 'RH', 'SU', 'TP', 'UK', 'UN', 'VD', 'XA', 'XB', 'YD', 'YU', 'ZR']);

let isoByName: Map<string, string | null> | undefined;

/** `undefined`: not recognized. `null`: known, no nationality code in this app. */
export function isoForName(name: string): string | null | undefined {
  if (!isoByName) {
    isoByName = new Map();
    const display = new Intl.DisplayNames(['en'], { type: 'region' });
    for (let a = 65; a <= 90; a++) {
      for (let b = 65; b <= 90; b++) {
        const code = String.fromCharCode(a, b);
        if (NOT_COUNTRY_CODES.has(code)) continue;
        const english = display.of(code);
        if (english && english !== code && !isoByName.has(normalizeName(english))) isoByName.set(normalizeName(english), code);
      }
    }
    for (const [alias, iso] of Object.entries(ALIASES)) isoByName.set(normalizeName(alias), iso);
  }
  return isoByName.get(normalizeName(name));
}

/** A cookie jar just big enough for one Laravel session. */
class Cookies {
  private jar = new Map<string, string>([['laravel_cookie_consent', '1']]);
  take(res: Response) {
    for (const line of res.headers.getSetCookie?.() ?? []) {
      const [pair] = line.split(';');
      const eq = pair.indexOf('=');
      if (eq > 0) this.jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }
  header(): string {
    return [...this.jar].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

const regionUrl = (region: string) => `${PAGE_URL}?region=${region}`;

function listingSnapshot(buttons: CountryButton[]): ContentSnapshot {
  const sorted = [...buttons].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const text = sorted
    .map((c) => {
      const iso = isoForName(c.name);
      const code = iso ?? (iso === null ? 'no nationality code' : 'not recognized');
      return `${c.name} → ${code} · ${c.region}`;
    })
    .join('\n');
  const links: ContentLink[] = sorted.map((c) => ({ text: c.name, href: `${PAGE_URL}#${c.region}/${c.record}` }));
  return { url: PAGE_URL, contentType: 'application/json', updatedAt: null, text, links };
}

/** Countries → `{key}` values (`<region>/<record id>`), plus notes on names that didn't map cleanly. */
export function buildFill(buttons: CountryButton[]): { fill: Map<string, string>; note?: string } {
  const fill = new Map<string, string>();
  const unknown: string[] = [];
  const duplicate: string[] = [];
  for (const c of buttons) {
    const iso = isoForName(c.name);
    if (iso === undefined) unknown.push(`${c.name} (${c.region})`);
    else if (iso === null) continue;
    else if (fill.has(iso)) duplicate.push(`${c.name} (${iso})`);
    else fill.set(iso, `${c.region}/${c.record}`);
  }
  const notes: string[] = [];
  if (unknown.length > 0) notes.push(`Not recognized as a country (add to ALIASES in pipeline/src/resolvers/mfaGovMk.ts): ${unknown.join(', ')}`);
  if (duplicate.length > 0) notes.push(`More than one button for: ${duplicate.join(', ')}; the first is used`);
  return { fill, note: notes.length > 0 ? notes.join('. ') : undefined };
}

async function discover(): Promise<Discovery> {
  const cookies = new Cookies();
  const pages = new Map<string, RegionPage>();
  const get = async (region: string) => {
    const res = await fetch(regionUrl(region), {
      headers: { 'User-Agent': BROWSER_USER_AGENT, Accept: 'text/html', 'Accept-Language': 'en', Cookie: cookies.header() },
      signal: AbortSignal.timeout(30_000),
    });
    cookies.take(res);
    if (!res.ok) throw new Error(`${regionUrl(region)}: HTTP ${res.status}`);
    return parseRegionPage(await res.text());
  };

  let error: string | undefined;
  try {
    const first = await get(DEFAULT_REGIONS[0]);
    pages.set(DEFAULT_REGIONS[0], first);
    const regions = first.regions.length > 0 ? first.regions : DEFAULT_REGIONS;
    for (const region of regions.filter((r) => !pages.has(r))) pages.set(region, await get(region));
  } catch (err) {
    error = (err as Error).message;
  }

  const buttons = [...pages].flatMap(([region, page]) => page.countries.map((c) => ({ region, ...c })));
  const missingState = [...pages].filter(([, p]) => !p.snapshot || !p.csrf).map(([r]) => r);
  if (!error && missingState.length > 0) error = `no Livewire snapshot or CSRF token on: ${missingState.join(', ')}`;
  if (!error && buttons.length < MIN_EXPECTED_COUNTRIES) {
    error = `found ${buttons.length} country buttons (expected ${MIN_EXPECTED_COUNTRIES}+); the page may have changed shape`;
  }
  if (error) {
    return { fill: new Map(), noPage: NO_PAGE, listing: listingSnapshot([]), indexUrl: PAGE_URL, error: `Could not read the country buttons: ${error}` };
  }

  const { fill, note } = buildFill(buttons);
  const limit = createLimiter(1);
  const call = (value: string) =>
    limit(async (): Promise<FetchOutcome> => {
      const [region, record] = value.split('/');
      const page = pages.get(region)!;
      try {
        const res = await fetch(UPDATE_URL, {
          method: 'POST',
          headers: {
            'User-Agent': BROWSER_USER_AGENT,
            'Content-Type': 'application/json',
            Accept: '*/*',
            'X-Livewire': '',
            Origin: 'https://mfa.gov.mk',
            Referer: regionUrl(region),
            Cookie: cookies.header(),
          },
          body: JSON.stringify({
            _token: page.csrf,
            components: [{ snapshot: page.snapshot, updates: {}, calls: [{ path: '', method: CALL, params: [Number(record)] }] }],
          }),
          signal: AbortSignal.timeout(30_000),
        });
        cookies.take(res);
        const contentType = res.headers.get('content-type') ?? '';
        if (!res.ok) {
          await res.body?.cancel();
          // 419 is Laravel's "page expired": the session or CSRF token was rejected.
          const error = res.status === 419 ? 'HTTP 419: session or CSRF token rejected' : undefined;
          return { status: 'broken', httpStatus: res.status, finalUrl: UPDATE_URL, contentType, error };
        }
        return { status: 'live', httpStatus: res.status, finalUrl: UPDATE_URL, contentType, body: Buffer.from(await res.arrayBuffer()) };
      } catch (err) {
        return { status: 'broken', error: (err as Error).message };
      } finally {
        await new Promise((r) => setTimeout(r, mfaGovMkOptions.callSpacingMs));
      }
    });

  return { fill, noPage: NO_PAGE, listing: listingSnapshot(buttons), indexUrl: PAGE_URL, note, fetch: call };
}

const CONTACT_HEADING = /^Competent DM\/CP of the Republic of North Macedonia/i;

/**
 * Drops the panel's embassy contact block ("Competent DM/CP of the Republic
 * of North Macedonia", then phone, address, e-mail, opening hours and the
 * head of mission) so a new ambassador or phone number isn't reported as a
 * rule change. A "Notes:" section after it is kept.
 */
export function withoutContactBlock(snapshot: ContentSnapshot): ContentSnapshot {
  const kept: string[] = [];
  let inContacts = false;
  for (const line of snapshot.text.split('\n')) {
    if (CONTACT_HEADING.test(line)) inContacts = true;
    else if (/^Notes:?/i.test(line)) inContacts = false;
    if (!inContacts) kept.push(line);
  }
  const links = snapshot.links.filter((l) => !/^(mailto|tel):/i.test(l.href));
  return { ...snapshot, text: kept.join('\n'), links };
}

/** The right-hand panel of the re-rendered component: the country's name and its visa rule. */
function extract(body: Buffer, contentType: string, url: string): ContentSnapshot {
  let html: unknown;
  try {
    html = JSON.parse(body.toString('utf-8'))?.components?.[0]?.effects?.html;
  } catch {
    // not JSON
  }
  if (typeof html !== 'string') return extractSnapshot(body, contentType, url);
  const $ = cheerio.load(html);
  const panel = $('div.p-5').first().parent();
  if (panel.length === 0) return { url, contentType, updatedAt: null, text: '', links: [] };
  const snapshot = extractHtml(panel.html() ?? '', contentType, url);
  return withoutContactBlock(snapshot.text ? snapshot : { ...snapshot, text: panel.text().replace(/\s+/g, ' ').trim() });
}

export const mfaGovMk: Resolver = {
  listingId: `${PAGE_URL}#countries`,
  discover,
  snapshotId: (key) => `${PAGE_URL}#${key}`,
  extract,
};
