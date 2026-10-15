import { extractHtml, extractSnapshot } from '../contentCheck';
import type { FetchOutcome } from '../fetchPage';
import type { ContentLink, ContentSnapshot } from '../types';
import type { Discovery, Resolver } from './index';

/**
 * Bosnia and Herzegovina MFA (www.mvp.gov.ba), a Next.js App Router site.
 *
 * The /en/vize index has a country selector; picking a country loads
 * /api/subpage/{slug}, whose JSON `content` field is that country's visa
 * page. The slugs aren't derivable: they're server-assigned and end in a
 * .NET timestamp (`org_<org id>_<ticks>`), and a country's slug changes when
 * its page is republished (Canada's dates to 2026-05-13, the day its FIFA
 * visa PDF was uploaded). So every run reads the slug list from the index's
 * RSC payload (`self.__next_f.push(...)` chunks, where the selector's props
 * hold `"subpages":[{"title":…,"slug":…}]`) and maps each country name to a
 * nationality code. The selector's DOM options aren't server-rendered.
 */

export const INDEX_URL = 'https://www.mvp.gov.ba/en/vize';
const PUBLIC_PAGE_BASE = 'https://www.mvp.gov.ba/en/';

/** Fewer countries than this means the page changed shape, not that ~190 countries vanished. */
const MIN_EXPECTED_SUBPAGES = 150;

export type Subpage = { title: string; slug: string };

/**
 * The index's country names → ISO 3166 alpha-2 codes (the BosniaSources
 * keys). Names are the site's own spellings ("Jemen", "New Zeland",
 * "Slovak"). `null`: a page with no nationality in this app. A name missing
 * from this table is reported, as is a BosniaSources key with no page.
 */
export const NAME_TO_ISO: Record<string, string | null> = {
  'Afghanistan': 'AF',
  'Albania': 'AL',
  'Algeria': 'DZ',
  'Andorra': 'AD',
  'Angola': 'AO',
  'Antigua and Barbuda': 'AG',
  'Argentina': 'AR',
  'Armenia': 'AM',
  'Australia': 'AU',
  'Austria': 'AT',
  'Azerbaijan': 'AZ',
  'Bahamas': 'BS',
  'Bahrain': 'BH',
  'Bangladesh': 'BD',
  'Barbados': 'BB',
  'Belarus': 'BY',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Benin': 'BJ',
  'Bhutan': 'BT',
  'Bolivia': 'BO',
  'Botswana': 'BW',
  'Brazil': 'BR',
  'Brunei Darussalam': 'BN',
  'Bulgaria': 'BG',
  'Burkina Fasó': 'BF',
  'Burundi': 'BI',
  'Cambodia': 'KH',
  'Cameroon': 'CM',
  'Canada': 'CA',
  'Cape Verde': 'CV',
  'Central African Republic': 'CF',
  'Chad': 'TD',
  'Chile': 'CL',
  'China': 'CN',
  'Colombia': 'CO',
  'Comoros': 'KM',
  'Congo': 'CG',
  'Congo DR': 'CD',
  'Costa Rica': 'CR',
  'Croatia': 'HR',
  'Cuba': 'CU',
  'Cyprus': 'CY',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Djibouti': 'DJ',
  'Dominica': 'DM',
  'Dominikanska Republika': 'DO',
  'East Timor': 'TL',
  'Ecuador': 'EC',
  'Egypt': 'EG',
  'Equatorial Guinea': 'GQ',
  'Eritrea': 'ER',
  'Estonia': 'EE',
  'Ethiopia': 'ET',
  'Fiji': 'FJ',
  'Finland': 'FI',
  'France': 'FR',
  'Gabon': 'GA',
  'Gambia': 'GM',
  'Georgia': 'GE',
  'Germany': 'DE',
  'Ghana': 'GH',
  'Gibraltar': null,
  'Greece': 'GR',
  'Grenada': 'GD',
  'Guatemala': 'GT',
  'Guinea': 'GN',
  'Guinea-Bissau': 'GW',
  'Guyana': 'GY',
  'Haiti': 'HT',
  'Holy See Vatican': 'VA',
  'Honduras': 'HN',
  'Hungary': 'HU',
  'Iceland': 'IS',
  'India': 'IN',
  'Indonesia': 'ID',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Ivory Coast': 'CI',
  'Jamaica': 'JM',
  'Japan': 'JP',
  'Jemen': 'YE',
  'Jordan': 'JO',
  'Kazakhstan': 'KZ',
  'Kenya': 'KE',
  'Kiribati': 'KI',
  'Korea': 'KR',
  'Korea DPR': 'KP',
  'Kuwait': 'KW',
  'Kyrgyzstan': 'KG',
  'Laos': 'LA',
  'Latvia': 'LV',
  'Lebanon': 'LB',
  'Lesotho': 'LS',
  'Liberia': 'LR',
  'Libya': 'LY',
  'Liechtenstein': 'LI',
  'Lithuania': 'LT',
  'Luxembourg': 'LU',
  'Madagascar': 'MG',
  'Malawi': 'MW',
  'Malaysia': 'MY',
  'Maldives': 'MV',
  'Mali': 'ML',
  'Malta': 'MT',
  'Marshall Islands': 'MH',
  'Mauritania': 'MR',
  'Mauritius': 'MU',
  'Mexico': 'MX',
  'Micronesia': 'FM',
  'Moldova': 'MD',
  'Monaco': 'MC',
  'Mongolia': 'MN',
  'Montenegro': 'ME',
  'Morocco': 'MA',
  'Mozambique': 'MZ',
  'Myanmar': 'MM',
  'Namibia': 'NA',
  'Nauru': 'NR',
  'Nepal': 'NP',
  'Netherlands': 'NL',
  'New Zeland': 'NZ',
  'Nicaragua': 'NI',
  'Niger': 'NE',
  'Nigeria': 'NG',
  'North Macedonia': 'MK',
  'Norway': 'NO',
  'Oman': 'OM',
  'Pakistan': 'PK',
  'Palau': 'PW',
  'Palestine': 'PS',
  'Panama': 'PA',
  'Papua New Guinea': 'PG',
  'Paraguay': 'PY',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Qatar': 'QA',
  'Romania': 'RO',
  'Russian Federation': 'RU',
  'Rwanda': 'RW',
  'Saint Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC',
  'Salvador': 'SV',
  'Samoa': 'WS',
  'San Marino': 'SM',
  'Sao Tome and Principe': 'ST',
  'Saudi Arabia': 'SA',
  'Senegal': 'SN',
  'Serbia': 'RS',
  'Seychelles': 'SC',
  'Sierra Leone': 'SL',
  'Singapore': 'SG',
  'Slovak': 'SK',
  'Slovenia': 'SI',
  'Solomon Islands': 'SB',
  'Somalia': 'SO',
  'South Africa': 'ZA',
  'Spain': 'ES',
  'Sudan': 'SD',
  'Suriname': 'SR',
  'Swaziland': 'SZ',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Syria': 'SY',
  'Šri Lanka': 'LK',
  'Tajikistan': 'TJ',
  'Tanzania': 'TZ',
  'Thailand': 'TH',
  'Togo': 'TG',
  'Tonga': 'TO',
  'Trinidad and Tobago': 'TT',
  'Tunisia': 'TN',
  'Turkmenistan': 'TM',
  'Tuvalu': 'TV',
  'Türkiye': 'TR',
  'UK': 'GB',
  'Uganda': 'UG',
  'Ukraine': 'UA',
  'United Arab Emirates': 'AE',
  'United States of America': 'US',
  'Uruguay': 'UY',
  'Uzbekistan': 'UZ',
  'Vanuatu': 'VU',
  'Venezuela': 'VE',
  'Vietnam': 'VN',
  'Zambia': 'ZM',
  'Zimbabwe': 'ZW',
};

/** BosniaSources keys the site has no page for (see regions/bosnia.ts). */
export const NO_PAGE = new Set(['TW', 'XK']);

function normalizeName(name: string): string {
  return name.normalize('NFC').replace(/\s+/g, ' ').trim().toLowerCase();
}

const ISO_BY_NAME = new Map(Object.entries(NAME_TO_ISO).map(([name, iso]) => [normalizeName(name), iso]));

/** `undefined`: the name isn't in the table. `null`: known, no nationality code. */
export function isoForName(name: string): string | null | undefined {
  return ISO_BY_NAME.get(normalizeName(name));
}

/** The page's creation date, from the slug's trailing .NET ticks. */
export function slugDate(slug: string): string | undefined {
  const m = /_(\d{15,})$/.exec(slug);
  if (!m) return undefined;
  const UNIX_EPOCH_TICKS = 621_355_968_000_000_000n;
  const ms = (BigInt(m[1]) - UNIX_EPOCH_TICKS) / 10_000n;
  const date = new Date(Number(ms));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

/** Concatenates the page's RSC payload: the string argument of every `self.__next_f.push([1, "…"])`. */
function rscPayload(html: string): string {
  const PUSH = /self\.__next_f\.push\(\[1,\s*("(?:[^"\\]|\\.)*")\]\)/g;
  let payload = '';
  for (const m of html.matchAll(PUSH)) {
    try {
      payload += JSON.parse(m[1]) as string;
    } catch {
      // not a plain string chunk; skip
    }
  }
  return payload;
}

/** Parses the JSON array or object starting at `start`, matching brackets outside strings. */
function readJsonAt(text: string, start: number): unknown {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else if (ch === '"') {
      inString = true;
    } else if (ch === '[' || ch === '{') {
      depth++;
    } else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}

function isSubpage(v: unknown): v is Subpage {
  const o = v as Subpage;
  return typeof o?.title === 'string' && typeof o?.slug === 'string' && /^org_\w+_\d+$/.test(o.slug);
}

/** The country selector's `subpages` list from the index page's HTML (the longest one, if several). */
export function parseSubpages(html: string): Subpage[] {
  const payload = rscPayload(html);
  let best: Subpage[] = [];
  for (const m of payload.matchAll(/"subpages":\[/g)) {
    const parsed = readJsonAt(payload, m.index + m[0].length - 1);
    if (Array.isArray(parsed)) {
      const list = parsed.filter(isSubpage);
      if (list.length > best.length) best = list;
    }
  }
  return best;
}

/** The previous run's list, rebuilt from its listing snapshot (anchor text = name, href ends in the slug). */
function subpagesFromListing(listing: ContentSnapshot | null): Subpage[] {
  return (listing?.links ?? [])
    .map((l) => ({ title: l.text, slug: l.href.slice(l.href.lastIndexOf('/') + 1) }))
    .filter(isSubpage);
}

function listingSnapshot(subpages: Subpage[]): ContentSnapshot {
  const sorted = [...subpages].sort((a, b) => a.title.localeCompare(b.title, 'en'));
  const text = sorted
    .map((s) => {
      const iso = isoForName(s.title);
      const code = iso ?? (iso === null ? 'no nationality code' : 'not in the name table');
      return `${s.title} → ${code} · page dated ${slugDate(s.slug) ?? 'unknown'}`;
    })
    .join('\n');
  const links: ContentLink[] = sorted.map((s) => ({ text: s.title, href: PUBLIC_PAGE_BASE + s.slug }));
  return { url: INDEX_URL, contentType: 'application/json', updatedAt: null, text, links };
}

export function buildDiscovery(subpages: Subpage[], error?: string): Discovery {
  const fill = new Map<string, string>();
  const unknown: string[] = [];
  const duplicate: string[] = [];
  for (const s of subpages) {
    const iso = isoForName(s.title);
    if (iso === undefined) unknown.push(s.title);
    else if (iso === null) continue;
    else if (fill.has(iso)) duplicate.push(`${s.title} (${iso})`);
    else fill.set(iso, s.slug);
  }
  const notes: string[] = [];
  if (unknown.length > 0) notes.push(`Not in the name table (pipeline/src/resolvers/mvpGovBa.ts): ${unknown.join(', ')}`);
  if (duplicate.length > 0) notes.push(`More than one page for: ${duplicate.join(', ')}; the first is used`);
  return {
    fill,
    noPage: NO_PAGE,
    listing: listingSnapshot(subpages),
    indexUrl: INDEX_URL,
    error,
    note: notes.length > 0 ? notes.join('. ') : undefined,
  };
}

async function discover(
  fetch: (url: string) => Promise<FetchOutcome>,
  previousListing: ContentSnapshot | null,
): Promise<Discovery> {
  const outcome = await fetch(INDEX_URL);
  let error: string | undefined;
  let subpages: Subpage[] = [];
  if (!outcome.body) {
    error = outcome.error ?? (outcome.httpStatus ? `HTTP ${outcome.httpStatus}` : 'no response body');
  } else {
    subpages = parseSubpages(outcome.body.toString('utf-8'));
    if (subpages.length < MIN_EXPECTED_SUBPAGES) {
      error = `found ${subpages.length} countries in the index's country selector (expected ${MIN_EXPECTED_SUBPAGES}+); the page may have changed shape`;
    }
  }
  if (!error) return buildDiscovery(subpages);

  // Fall back to last run's slugs: most pages keep theirs between runs.
  const cached = subpagesFromListing(previousListing);
  const discovery = buildDiscovery(cached, `Could not read the country list: ${error}`);
  return {
    ...discovery,
    note: [cached.length > 0 ? `Used the ${cached.length} pages from the previous run's list` : 'No previous list to fall back on', discovery.note]
      .filter(Boolean)
      .join('. '),
  };
}

/**
 * The subpage API's JSON: the page `title`, its `content` as HTML, and any
 * `attachedFiles`. Layout fields (ids, `assetUrl`, menus) are dropped so they
 * don't show up as changes.
 */
function extract(body: Buffer, contentType: string, url: string): ContentSnapshot {
  let data: { title?: unknown; content?: unknown; attachedFiles?: unknown };
  try {
    data = JSON.parse(body.toString('utf-8'));
  } catch {
    return extractSnapshot(body, contentType, url);
  }
  if (typeof data?.content !== 'string') return extractSnapshot(body, contentType, url);
  const title = typeof data.title === 'string' ? data.title : '';
  const snapshot = extractHtml(`<h1>${escapeHtml(title)}</h1>${data.content}`, contentType, url);
  const files = Array.isArray(data.attachedFiles) ? data.attachedFiles : [];
  for (const f of files as Record<string, unknown>[]) {
    const href = [f?.url, f?.fileUrl, f?.path].find((v) => typeof v === 'string') as string | undefined;
    const text = [f?.name, f?.title, f?.fileName].find((v) => typeof v === 'string') as string | undefined;
    if (href) snapshot.links.push({ text: text ?? href, href });
  }
  return snapshot;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const mvpGovBa: Resolver = {
  listingId: `${INDEX_URL}#subpages`,
  discover,
  snapshotId: (key) => `https://www.mvp.gov.ba/api/subpage/#${key}`,
  extract,
};
