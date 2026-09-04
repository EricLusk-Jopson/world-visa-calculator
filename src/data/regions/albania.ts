/**
 * albania.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Albania's visa rules by passport/nationality.
 *
 * Source: Albanian Ministry for Europe and Foreign Affairs —
 *   parent (regime overview): https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/
 *   direct (per-country table): https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/
 * Both URLs are the same for every entry below — the site does not have
 * stable per-country subpages, only these two index pages (matching the
 * Bosnia/Kosovo/North Macedonia precedent of citing one stable page site-
 * wide), but unlike those regions Albania's site itself distinguishes a
 * parent (regime overview) page from a direct (the actual per-country table)
 * page, so both fields are populated with their own distinct URL rather than
 * duplicating one URL into both fields.
 *
 * ── Scope and shape of the source data ──────────────────────────────────────
 *
 * Source data was a flat table keyed by (Albanian-language) country slug,
 * each with a `visaRequirement` of "Required" or "Visa Free" — no duration
 * language anywhere, matching North Macedonia's shape exactly. Per explicit
 * instruction: every "Visa Free" entry gets the standard 90-day-in-180-day
 * rolling-window allowance (matching every other region file in this
 * codebase), applied uniformly since the source only confirms visa-free
 * status, not a per-country duration figure.
 *
 * ── Data quirks ──────────────────────────────────────────────────────────────
 *
 * - Country names in the source are in Albanian (e.g. "SHTETET E BASHKUARA
 *   TË AMERIKËS" for the United States); slugs were used to map each entry
 *   to its ISO Alpha-2 code, cross-checked against COUNTRIES in
 *   NationalitySelector.tsx.
 * - Gibraltar ("GJIBRALTAR") has no entry in COUNTRIES — Gibraltarians have
 *   no distinct nationality code selectable in this app — so it is
 *   deliberately excluded, not mapped to any code.
 * - "Kongo" (Congo) has only one entry in the source (no separate DR Congo
 *   entry), mapped to CG (Republic of Congo) per the plain, unqualified name.
 * - Sudan (SD) is present and visa-required; there is no separate South
 *   Sudan (SS) entry in the source, so SS is a true content gap defaulting
 *   to visa_required, matching the Taiwan/Kosovo-in-Bosnia precedent.
 *
 * Albania's own member state (AL) is intentionally not included as a
 * passport-rule entry, matching every other region file in this codebase.
 *
 * Last verified: 2026-09-04
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  SourceDoc,
} from '@/types';
import { AlbaniaSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

/**
 * 90 days in any 180-day rolling window — the same shape as every other
 * region file in this codebase. Applied uniformly to every visa-free entry
 * per explicit instruction (see file header — the source confirms
 * Required/Visa Free per country, not a duration figure).
 */
const ALBANIA_LIMIT: import('@/types').RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

const DURATION_NOTE_TEXT =
  'Visa-free status is confirmed. The source does not state a stay duration for this nationality, so the standard 90 days in 180 days is assumed.';

// ─── Rule helpers ───────────────────────────────────────────────────────────

/**
 * Standard entitled rule — 90 days, rolling_window(90,180), always carrying
 * the duration-assumed note (see file header).
 *
 * Cites AlbaniaSources.<CODE> via `source` — surfaced by the UI as a link on
 * the stay-rule summary.
 */
function entitledRolling(source: SourceDoc): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [ALBANIA_LIMIT],
      source,
      notes: [{ text: DURATION_NOTE_TEXT, source }],
    }],
  };
}

/**
 * Visa-required rule citing its own source link. No note needed — unlike
 * the entitled case, "a visa is required" has no ambiguity to flag.
 */
function visaRequired(source: SourceDoc): VisaRequiredRule {
  return { access: 'visa_required', source };
}

// ─── Region definition ────────────────────────────────────────────────────────

export const ALBANIA: RegionDefinition = {
  code: 'albania',
  name: 'Albania',
  memberStates: ['AL'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-04',
  sourceUrl: 'https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/',
  defaultRule: VISA_REQUIRED,
  passportRules: {

    'AD': entitledRolling(AlbaniaSources.AD), // Andorra
    'AE': entitledRolling(AlbaniaSources.AE), // United Arab Emirates
    'AF': visaRequired(AlbaniaSources.AF), // Afghanistan
    'AG': entitledRolling(AlbaniaSources.AG), // Antigua and Barbuda
    'AM': entitledRolling(AlbaniaSources.AM), // Armenia
    'AO': visaRequired(AlbaniaSources.AO), // Angola
    'AR': entitledRolling(AlbaniaSources.AR), // Argentina
    'AT': entitledRolling(AlbaniaSources.AT), // Austria
    'AU': entitledRolling(AlbaniaSources.AU), // Australia
    'AZ': entitledRolling(AlbaniaSources.AZ), // Azerbaijan
    'BA': entitledRolling(AlbaniaSources.BA), // Bosnia and Herzegovina
    'BB': entitledRolling(AlbaniaSources.BB), // Barbados
    'BD': visaRequired(AlbaniaSources.BD), // Bangladesh
    'BE': entitledRolling(AlbaniaSources.BE), // Belgium
    'BF': visaRequired(AlbaniaSources.BF), // Burkina Faso
    'BG': entitledRolling(AlbaniaSources.BG), // Bulgaria
    'BH': visaRequired(AlbaniaSources.BH), // Bahrain
    'BJ': visaRequired(AlbaniaSources.BJ), // Benin
    'BN': entitledRolling(AlbaniaSources.BN), // Brunei
    'BO': visaRequired(AlbaniaSources.BO), // Bolivia
    'BR': entitledRolling(AlbaniaSources.BR), // Brazil
    'BS': entitledRolling(AlbaniaSources.BS), // Bahamas
    'BW': visaRequired(AlbaniaSources.BW), // Botswana
    'BY': visaRequired(AlbaniaSources.BY), // Belarus
    'BZ': visaRequired(AlbaniaSources.BZ), // Belize
    'CA': entitledRolling(AlbaniaSources.CA), // Canada
    'CG': visaRequired(AlbaniaSources.CG), // Congo
    'CH': entitledRolling(AlbaniaSources.CH), // Switzerland
    'CI': visaRequired(AlbaniaSources.CI), // Cote d'Ivoire
    'CL': entitledRolling(AlbaniaSources.CL), // Chile
    'CM': visaRequired(AlbaniaSources.CM), // Cameroon
    'CN': entitledRolling(AlbaniaSources.CN), // China
    'CO': entitledRolling(AlbaniaSources.CO), // Colombia
    'CR': entitledRolling(AlbaniaSources.CR), // Costa Rica
    'CU': visaRequired(AlbaniaSources.CU), // Cuba
    'CY': entitledRolling(AlbaniaSources.CY), // Cyprus
    'CZ': entitledRolling(AlbaniaSources.CZ), // Czech Republic
    'DE': entitledRolling(AlbaniaSources.DE), // Germany
    'DK': entitledRolling(AlbaniaSources.DK), // Denmark
    'DO': visaRequired(AlbaniaSources.DO), // Dominican Republic
    'DZ': visaRequired(AlbaniaSources.DZ), // Algeria
    'EC': visaRequired(AlbaniaSources.EC), // Ecuador
    'EE': entitledRolling(AlbaniaSources.EE), // Estonia
    'EG': visaRequired(AlbaniaSources.EG), // Egypt
    'ER': visaRequired(AlbaniaSources.ER), // Eritrea
    'ES': entitledRolling(AlbaniaSources.ES), // Spain
    'ET': visaRequired(AlbaniaSources.ET), // Ethiopia
    'FI': entitledRolling(AlbaniaSources.FI), // Finland
    'FJ': visaRequired(AlbaniaSources.FJ), // Fiji
    'FR': entitledRolling(AlbaniaSources.FR), // France
    'GA': visaRequired(AlbaniaSources.GA), // Gabon
    'GB': entitledRolling(AlbaniaSources.GB), // United Kingdom
    'GE': entitledRolling(AlbaniaSources.GE), // Georgia
    'GH': visaRequired(AlbaniaSources.GH), // Ghana
    'GN': visaRequired(AlbaniaSources.GN), // Guinea
    'GR': entitledRolling(AlbaniaSources.GR), // Greece
    'GT': entitledRolling(AlbaniaSources.GT), // Guatemala
    'GY': visaRequired(AlbaniaSources.GY), // Guyana
    'HK': entitledRolling(AlbaniaSources.HK), // Hong Kong (SAR)
    'HN': entitledRolling(AlbaniaSources.HN), // Honduras
    'HR': entitledRolling(AlbaniaSources.HR), // Croatia
    'HT': visaRequired(AlbaniaSources.HT), // Haiti
    'HU': entitledRolling(AlbaniaSources.HU), // Hungary
    'ID': visaRequired(AlbaniaSources.ID), // Indonesia
    'IE': entitledRolling(AlbaniaSources.IE), // Ireland
    'IL': entitledRolling(AlbaniaSources.IL), // Israel
    'IN': visaRequired(AlbaniaSources.IN), // India
    'IQ': visaRequired(AlbaniaSources.IQ), // Iraq
    'IR': visaRequired(AlbaniaSources.IR), // Iran
    'IS': entitledRolling(AlbaniaSources.IS), // Iceland
    'IT': entitledRolling(AlbaniaSources.IT), // Italy
    'JM': visaRequired(AlbaniaSources.JM), // Jamaica
    'JO': visaRequired(AlbaniaSources.JO), // Jordan
    'JP': entitledRolling(AlbaniaSources.JP), // Japan
    'KE': visaRequired(AlbaniaSources.KE), // Kenya
    'KG': visaRequired(AlbaniaSources.KG), // Kyrgyzstan
    'KH': visaRequired(AlbaniaSources.KH), // Cambodia
    'KN': entitledRolling(AlbaniaSources.KN), // Saint Kitts and Nevis
    'KP': visaRequired(AlbaniaSources.KP), // Korea (North)
    'KR': entitledRolling(AlbaniaSources.KR), // Korea (South)
    'KW': entitledRolling(AlbaniaSources.KW), // Kuwait
    'KZ': entitledRolling(AlbaniaSources.KZ), // Kazakhstan
    'LB': visaRequired(AlbaniaSources.LB), // Lebanon
    'LI': entitledRolling(AlbaniaSources.LI), // Liechtenstein
    'LK': visaRequired(AlbaniaSources.LK), // Sri Lanka
    'LR': visaRequired(AlbaniaSources.LR), // Liberia
    'LS': visaRequired(AlbaniaSources.LS), // Lesotho
    'LT': entitledRolling(AlbaniaSources.LT), // Lithuania
    'LU': entitledRolling(AlbaniaSources.LU), // Luxembourg
    'LV': entitledRolling(AlbaniaSources.LV), // Latvia
    'LY': visaRequired(AlbaniaSources.LY), // Libya
    'MA': visaRequired(AlbaniaSources.MA), // Morocco
    'MC': entitledRolling(AlbaniaSources.MC), // Monaco
    'MD': entitledRolling(AlbaniaSources.MD), // Moldova
    'ME': entitledRolling(AlbaniaSources.ME), // Montenegro
    'MG': visaRequired(AlbaniaSources.MG), // Madagascar
    'MK': entitledRolling(AlbaniaSources.MK), // North Macedonia
    'ML': visaRequired(AlbaniaSources.ML), // Mali
    'MN': visaRequired(AlbaniaSources.MN), // Mongolia
    'MO': entitledRolling(AlbaniaSources.MO), // Macao (SAR)
    'MR': visaRequired(AlbaniaSources.MR), // Mauritania
    'MT': entitledRolling(AlbaniaSources.MT), // Malta
    'MU': entitledRolling(AlbaniaSources.MU), // Mauritius
    'MV': visaRequired(AlbaniaSources.MV), // Maldives
    'MW': visaRequired(AlbaniaSources.MW), // Malawi
    'MX': entitledRolling(AlbaniaSources.MX), // Mexico
    'MY': entitledRolling(AlbaniaSources.MY), // Malaysia
    'MZ': visaRequired(AlbaniaSources.MZ), // Mozambique
    'NA': visaRequired(AlbaniaSources.NA), // Namibia
    'NG': visaRequired(AlbaniaSources.NG), // Nigeria
    'NI': entitledRolling(AlbaniaSources.NI), // Nicaragua
    'NL': entitledRolling(AlbaniaSources.NL), // Netherlands
    'NO': entitledRolling(AlbaniaSources.NO), // Norway
    'NP': visaRequired(AlbaniaSources.NP), // Nepal
    'NZ': entitledRolling(AlbaniaSources.NZ), // New Zealand
    'OM': visaRequired(AlbaniaSources.OM), // Oman
    'PA': entitledRolling(AlbaniaSources.PA), // Panama
    'PE': entitledRolling(AlbaniaSources.PE), // Peru
    'PH': visaRequired(AlbaniaSources.PH), // Philippines
    'PK': visaRequired(AlbaniaSources.PK), // Pakistan
    'PL': entitledRolling(AlbaniaSources.PL), // Poland
    'PS': visaRequired(AlbaniaSources.PS), // Palestine
    'PT': entitledRolling(AlbaniaSources.PT), // Portugal
    'PY': entitledRolling(AlbaniaSources.PY), // Paraguay
    'QA': entitledRolling(AlbaniaSources.QA), // Qatar
    'RO': entitledRolling(AlbaniaSources.RO), // Romania
    'RS': entitledRolling(AlbaniaSources.RS), // Serbia
    'RU': visaRequired(AlbaniaSources.RU), // Russia
    'RW': visaRequired(AlbaniaSources.RW), // Rwanda
    'SA': entitledRolling(AlbaniaSources.SA), // Saudi Arabia
    'SC': entitledRolling(AlbaniaSources.SC), // Seychelles
    'SD': visaRequired(AlbaniaSources.SD), // Sudan
    'SE': entitledRolling(AlbaniaSources.SE), // Sweden
    'SG': entitledRolling(AlbaniaSources.SG), // Singapore
    'SI': entitledRolling(AlbaniaSources.SI), // Slovenia
    'SK': entitledRolling(AlbaniaSources.SK), // Slovakia
    'SL': visaRequired(AlbaniaSources.SL), // Sierra Leone
    'SM': entitledRolling(AlbaniaSources.SM), // San Marino
    'SN': visaRequired(AlbaniaSources.SN), // Senegal
    'SO': visaRequired(AlbaniaSources.SO), // Somalia
    'SR': visaRequired(AlbaniaSources.SR), // Suriname
    'ST': visaRequired(AlbaniaSources.ST), // Sao Tome and Principe
    'SV': entitledRolling(AlbaniaSources.SV), // El Salvador
    'SY': visaRequired(AlbaniaSources.SY), // Syria
    'TG': visaRequired(AlbaniaSources.TG), // Togo
    'TH': visaRequired(AlbaniaSources.TH), // Thailand
    'TJ': visaRequired(AlbaniaSources.TJ), // Tajikistan
    'TM': visaRequired(AlbaniaSources.TM), // Turkmenistan
    'TN': visaRequired(AlbaniaSources.TN), // Tunisia
    'TR': entitledRolling(AlbaniaSources.TR), // Turkey
    'TT': entitledRolling(AlbaniaSources.TT), // Trinidad and Tobago
    'TW': entitledRolling(AlbaniaSources.TW), // Taiwan
    'TZ': visaRequired(AlbaniaSources.TZ), // Tanzania
    'UA': entitledRolling(AlbaniaSources.UA), // Ukraine
    'UG': visaRequired(AlbaniaSources.UG), // Uganda
    'US': entitledRolling(AlbaniaSources.US), // United States
    'UY': entitledRolling(AlbaniaSources.UY), // Uruguay
    'UZ': visaRequired(AlbaniaSources.UZ), // Uzbekistan
    'VA': entitledRolling(AlbaniaSources.VA), // Vatican City
    'VE': entitledRolling(AlbaniaSources.VE), // Venezuela
    'VN': visaRequired(AlbaniaSources.VN), // Vietnam
    'XK': entitledRolling(AlbaniaSources.XK), // Kosovo
    'YE': visaRequired(AlbaniaSources.YE), // Yemen
    'ZA': visaRequired(AlbaniaSources.ZA), // South Africa
    'ZM': visaRequired(AlbaniaSources.ZM), // Zambia
    'ZW': visaRequired(AlbaniaSources.ZW), // Zimbabwe

  },
};

/**
 * Returns the Albania passport rule for a given ISO Alpha-2 passport code.
 * Falls through to the default rule (visa_required) for any code not
 * present above and for unknown/null codes.
 */
export function getAlbaniaRule(passportCode: string | null): PassportRule {
  if (!passportCode) return ALBANIA.defaultRule;
  return ALBANIA.passportRules[passportCode] ?? ALBANIA.defaultRule;
}
