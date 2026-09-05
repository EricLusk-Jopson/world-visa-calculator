/**
 * macedonia.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for North Macedonia's visa rules by passport/nationality.
 *
 * Source: Ministry of Foreign Affairs of North Macedonia —
 *   https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza
 * As with Bosnia/Kosovo, there are no stable per-country subpages on this site;
 * every entry below cites the same single page for both `directUrl` and
 * `parentUrl`.
 *
 * ── Scope and shape of the source data ──────────────────────────────────────
 *
 * Unlike Serbia/Bosnia (which state a per-country stay-duration figure) or
 * Kosovo (a pure visa-exempt enumeration), this source is a flat binary
 * table: every country is marked either "Visa for foreign citizens: NEEDED"
 * or "NOT NEEDED", with no duration language anywhere. `visa_required`
 * entries need no further interpretation. `entitled` entries (NOT NEEDED)
 * carry the same "duration not individually confirmed" note Kosovo uses —
 * the standard 90-day-in-180-day allowance (matching every other region
 * file in this codebase) is applied uniformly as a safe assumption, not a
 * source-confirmed figure per country.
 *
 * ── Data quirks ──────────────────────────────────────────────────────────────
 *
 * - Sudan (SD): the source's rules text for this entry literally reads
 *   "South Sudan", not "Sudan" — almost certainly a copy-paste artifact in
 *   the scrape, since South Sudan (SS) has its own separate, correctly-
 *   labeled entry immediately elsewhere in the data. Both are visa-required
 *   regardless, so the mismatch doesn't change the outcome; noted here (and
 *   as a trailing code comment below) rather than surfaced to users, per
 *   the established devnote-vs-substantive-note convention (see bosnia.ts).
 * - "Tunizi": the source's own country field for Tunisia is misspelled this
 *   way; mapped to TN (Tunisia) — there is no separate real place by that
 *   name, and every other identifying detail (region: africa, NEEDED) is
 *   consistent with Tunisia's known rule.
 * - Hong Kong (HK) and Macao (MO): true content gaps — neither has any
 *   entry anywhere in the source scrape (China itself does, as CN). Default
 *   to visa_required as the conservative assumption, matching the
 *   Taiwan/Kosovo true-gap precedent in bosnia.ts.
 *
 * North Macedonia's own member state (MK) is intentionally not included as
 * a passport-rule entry, matching every other region file in this codebase.
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
import { NorthMacedoniaSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

/**
 * 90 days in any 180-day rolling window — the same shape as every other
 * region file in this codebase. Applied uniformly to every entitled entry
 * (see file header — the source confirms NEEDED/NOT NEEDED per country, not
 * a duration figure).
 */
const MACEDONIA_LIMIT: import('@/types').RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

const DURATION_NOTE_TEXT =
  'Visa-free status is confirmed. The official source does not provide a stay-duration limit for this nationality, so the widely-reported 90 days in 180 days rule is applied.';

// ─── Rule helpers ───────────────────────────────────────────────────────────

/**
 * Standard entitled rule — 90 days, rolling_window(90,180), always carrying
 * the duration-not-individually-confirmed note (see file header).
 *
 * Cites NorthMacedoniaSources.<CODE> via `source` — surfaced by the UI as a
 * link on the stay-rule summary.
 */
function entitledRolling(source: SourceDoc): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [MACEDONIA_LIMIT],
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

export const NORTH_MACEDONIA: RegionDefinition = {
  code: 'north-macedonia',
  name: 'North Macedonia',
  memberStates: ['MK'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-04',
  sourceUrl: 'https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza',
  defaultRule: VISA_REQUIRED,
  passportRules: {

    'AD': entitledRolling(NorthMacedoniaSources.AD), // Andorra
    'AE': entitledRolling(NorthMacedoniaSources.AE), // United Arab Emirates
    'AF': visaRequired(NorthMacedoniaSources.AF), // Afghanistan
    'AG': entitledRolling(NorthMacedoniaSources.AG), // Antigua and Barbuda
    'AL': entitledRolling(NorthMacedoniaSources.AL), // Albania
    'AM': visaRequired(NorthMacedoniaSources.AM), // Armenia
    'AO': visaRequired(NorthMacedoniaSources.AO), // Angola
    'AR': entitledRolling(NorthMacedoniaSources.AR), // Argentina
    'AT': entitledRolling(NorthMacedoniaSources.AT), // Austria
    'AU': entitledRolling(NorthMacedoniaSources.AU), // Australia
    'AZ': visaRequired(NorthMacedoniaSources.AZ), // Azerbaijan
    'BA': entitledRolling(NorthMacedoniaSources.BA), // Bosnia and Hercegovina
    'BB': entitledRolling(NorthMacedoniaSources.BB), // Barbados
    'BD': visaRequired(NorthMacedoniaSources.BD), // Bangladesh
    'BE': entitledRolling(NorthMacedoniaSources.BE), // Belgium
    'BF': visaRequired(NorthMacedoniaSources.BF), // Burkina Faso
    'BG': entitledRolling(NorthMacedoniaSources.BG), // Bulgaria
    'BH': visaRequired(NorthMacedoniaSources.BH), // Bahrain
    'BI': visaRequired(NorthMacedoniaSources.BI), // Burundi
    'BJ': visaRequired(NorthMacedoniaSources.BJ), // Benin
    'BN': entitledRolling(NorthMacedoniaSources.BN), // Brunei Darussalam
    'BO': visaRequired(NorthMacedoniaSources.BO), // Bolivia
    'BR': entitledRolling(NorthMacedoniaSources.BR), // Brazil
    'BS': entitledRolling(NorthMacedoniaSources.BS), // Bahamas
    'BT': visaRequired(NorthMacedoniaSources.BT), // Bhutan
    'BW': visaRequired(NorthMacedoniaSources.BW), // Botswana
    'BY': visaRequired(NorthMacedoniaSources.BY), // Belarus
    'BZ': visaRequired(NorthMacedoniaSources.BZ), // Belize
    'CA': entitledRolling(NorthMacedoniaSources.CA), // Canada
    'CD': visaRequired(NorthMacedoniaSources.CD), // DR of the Congo
    'CF': visaRequired(NorthMacedoniaSources.CF), // Central African Republic
    'CG': visaRequired(NorthMacedoniaSources.CG), // Congo
    'CH': entitledRolling(NorthMacedoniaSources.CH), // Switzerland
    'CI': visaRequired(NorthMacedoniaSources.CI), // Côte D'Ivoire
    'CL': entitledRolling(NorthMacedoniaSources.CL), // Chile
    'CM': visaRequired(NorthMacedoniaSources.CM), // Cameroon
    'CN': visaRequired(NorthMacedoniaSources.CN), // China
    'CO': entitledRolling(NorthMacedoniaSources.CO), // Colombia
    'CR': entitledRolling(NorthMacedoniaSources.CR), // Costa Rica
    'CU': visaRequired(NorthMacedoniaSources.CU), // Cuba
    'CV': visaRequired(NorthMacedoniaSources.CV), // Cabo Verde
    'CY': entitledRolling(NorthMacedoniaSources.CY), // Cyprus
    'CZ': entitledRolling(NorthMacedoniaSources.CZ), // Czechia
    'DE': entitledRolling(NorthMacedoniaSources.DE), // Germany
    'DJ': visaRequired(NorthMacedoniaSources.DJ), // Djibouti
    'DK': entitledRolling(NorthMacedoniaSources.DK), // Denmark
    'DM': visaRequired(NorthMacedoniaSources.DM), // Dominica
    'DO': visaRequired(NorthMacedoniaSources.DO), // Dominican Republic
    'DZ': visaRequired(NorthMacedoniaSources.DZ), // Algeria
    'EC': visaRequired(NorthMacedoniaSources.EC), // Ecuador
    'EE': entitledRolling(NorthMacedoniaSources.EE), // Estonia
    'EG': visaRequired(NorthMacedoniaSources.EG), // Egypt
    'ER': visaRequired(NorthMacedoniaSources.ER), // Eritrea
    'ES': entitledRolling(NorthMacedoniaSources.ES), // Spain
    'ET': visaRequired(NorthMacedoniaSources.ET), // Ethiopia
    'FI': entitledRolling(NorthMacedoniaSources.FI), // Finland
    'FJ': visaRequired(NorthMacedoniaSources.FJ), // Fiji
    'FM': visaRequired(NorthMacedoniaSources.FM), // Micronesia - Federated States of
    'FR': entitledRolling(NorthMacedoniaSources.FR), // France
    'GA': visaRequired(NorthMacedoniaSources.GA), // Gabon
    'GB': entitledRolling(NorthMacedoniaSources.GB), // United Kingdom
    'GD': visaRequired(NorthMacedoniaSources.GD), // Grenada
    'GE': entitledRolling(NorthMacedoniaSources.GE), // Georgia
    'GH': visaRequired(NorthMacedoniaSources.GH), // Ghana
    'GM': visaRequired(NorthMacedoniaSources.GM), // Gambia
    'GN': visaRequired(NorthMacedoniaSources.GN), // Guinea
    'GQ': visaRequired(NorthMacedoniaSources.GQ), // Equatorial Guinea
    'GR': entitledRolling(NorthMacedoniaSources.GR), // Greece
    'GT': entitledRolling(NorthMacedoniaSources.GT), // Guatemala
    'GW': visaRequired(NorthMacedoniaSources.GW), // Guinea Bissau
    'GY': visaRequired(NorthMacedoniaSources.GY), // Guyana
    'HK': visaRequired(NorthMacedoniaSources.HK), // Hong Kong (SAR) — absent from the source scrape entirely (true content gap); defaults to visa_required as the conservative assumption
    'HN': entitledRolling(NorthMacedoniaSources.HN), // Honduras
    'HR': entitledRolling(NorthMacedoniaSources.HR), // Croatia
    'HT': visaRequired(NorthMacedoniaSources.HT), // Haiti
    'HU': entitledRolling(NorthMacedoniaSources.HU), // Hungary
    'ID': visaRequired(NorthMacedoniaSources.ID), // Indonesia
    'IE': entitledRolling(NorthMacedoniaSources.IE), // Ireland
    'IL': entitledRolling(NorthMacedoniaSources.IL), // Israel
    'IN': visaRequired(NorthMacedoniaSources.IN), // India
    'IQ': visaRequired(NorthMacedoniaSources.IQ), // Iraq
    'IR': visaRequired(NorthMacedoniaSources.IR), // Iran
    'IS': entitledRolling(NorthMacedoniaSources.IS), // Iceland
    'IT': entitledRolling(NorthMacedoniaSources.IT), // Italy
    'JM': visaRequired(NorthMacedoniaSources.JM), // Jamaica
    'JO': visaRequired(NorthMacedoniaSources.JO), // Jordan
    'JP': entitledRolling(NorthMacedoniaSources.JP), // Japan
    'KE': visaRequired(NorthMacedoniaSources.KE), // Kenya
    'KG': visaRequired(NorthMacedoniaSources.KG), // Kyrgyzstan
    'KH': visaRequired(NorthMacedoniaSources.KH), // Cambodia
    'KI': visaRequired(NorthMacedoniaSources.KI), // Kiribati
    'KM': visaRequired(NorthMacedoniaSources.KM), // Comoros
    'KN': entitledRolling(NorthMacedoniaSources.KN), // Saint Kitts and Nevis
    'KP': visaRequired(NorthMacedoniaSources.KP), // North Korea
    'KR': entitledRolling(NorthMacedoniaSources.KR), // Republic of Korea
    'KW': visaRequired(NorthMacedoniaSources.KW), // Kuwait
    'KZ': visaRequired(NorthMacedoniaSources.KZ), // Kazakhstan
    'LA': visaRequired(NorthMacedoniaSources.LA), // Lao People’s Democratic Republic
    'LB': visaRequired(NorthMacedoniaSources.LB), // Lebanon
    'LC': visaRequired(NorthMacedoniaSources.LC), // Saint Lucia
    'LI': entitledRolling(NorthMacedoniaSources.LI), // Liechtenstein
    'LK': visaRequired(NorthMacedoniaSources.LK), // Sri Lanka
    'LR': visaRequired(NorthMacedoniaSources.LR), // Liberia
    'LS': visaRequired(NorthMacedoniaSources.LS), // Lesotho
    'LT': entitledRolling(NorthMacedoniaSources.LT), // Lithuania
    'LU': entitledRolling(NorthMacedoniaSources.LU), // Luxembourg
    'LV': entitledRolling(NorthMacedoniaSources.LV), // Latvia
    'LY': visaRequired(NorthMacedoniaSources.LY), // Libya
    'MA': visaRequired(NorthMacedoniaSources.MA), // Morocco
    'MC': entitledRolling(NorthMacedoniaSources.MC), // Monaco
    'MD': entitledRolling(NorthMacedoniaSources.MD), // Moldova
    'ME': entitledRolling(NorthMacedoniaSources.ME), // Montenegro
    'MG': visaRequired(NorthMacedoniaSources.MG), // Madagascar
    'MH': visaRequired(NorthMacedoniaSources.MH), // Marshall Islands
    'ML': visaRequired(NorthMacedoniaSources.ML), // Mali
    'MM': visaRequired(NorthMacedoniaSources.MM), // Myanmar
    'MN': visaRequired(NorthMacedoniaSources.MN), // Mongolia
    'MO': visaRequired(NorthMacedoniaSources.MO), // Macao (SAR) — absent from the source scrape entirely (true content gap); defaults to visa_required as the conservative assumption
    'MR': visaRequired(NorthMacedoniaSources.MR), // Mauritania
    'MT': entitledRolling(NorthMacedoniaSources.MT), // Malta
    'MU': entitledRolling(NorthMacedoniaSources.MU), // Mauritius
    'MV': visaRequired(NorthMacedoniaSources.MV), // Maldives
    'MW': visaRequired(NorthMacedoniaSources.MW), // Malawi
    'MX': entitledRolling(NorthMacedoniaSources.MX), // Mexico
    'MY': entitledRolling(NorthMacedoniaSources.MY), // Malaysia
    'MZ': visaRequired(NorthMacedoniaSources.MZ), // Mozambique
    'NA': visaRequired(NorthMacedoniaSources.NA), // Namibia
    'NE': visaRequired(NorthMacedoniaSources.NE), // Niger
    'NG': visaRequired(NorthMacedoniaSources.NG), // Nigeria
    'NI': entitledRolling(NorthMacedoniaSources.NI), // Nicaragua
    'NL': entitledRolling(NorthMacedoniaSources.NL), // Netherlands
    'NO': entitledRolling(NorthMacedoniaSources.NO), // Norway
    'NP': visaRequired(NorthMacedoniaSources.NP), // Nepal
    'NR': visaRequired(NorthMacedoniaSources.NR), // Nauru
    'NZ': entitledRolling(NorthMacedoniaSources.NZ), // New Zealand
    'OM': visaRequired(NorthMacedoniaSources.OM), // Oman
    'PA': entitledRolling(NorthMacedoniaSources.PA), // Panama
    'PE': entitledRolling(NorthMacedoniaSources.PE), // Peru
    'PG': visaRequired(NorthMacedoniaSources.PG), // Papua New Guinea
    'PH': visaRequired(NorthMacedoniaSources.PH), // Philippines
    'PK': visaRequired(NorthMacedoniaSources.PK), // Pakistan
    'PL': entitledRolling(NorthMacedoniaSources.PL), // Poland
    'PT': entitledRolling(NorthMacedoniaSources.PT), // Portugal
    'PW': visaRequired(NorthMacedoniaSources.PW), // Palau
    'PY': entitledRolling(NorthMacedoniaSources.PY), // Paraguay
    'QA': visaRequired(NorthMacedoniaSources.QA), // Qatar
    'RO': entitledRolling(NorthMacedoniaSources.RO), // Romania
    'RS': entitledRolling(NorthMacedoniaSources.RS), // Serbia
    'RU': visaRequired(NorthMacedoniaSources.RU), // Russia
    'RW': visaRequired(NorthMacedoniaSources.RW), // Rwanda
    'SA': visaRequired(NorthMacedoniaSources.SA), // Saudi Arabia
    'SB': visaRequired(NorthMacedoniaSources.SB), // Solomon Islands
    'SC': entitledRolling(NorthMacedoniaSources.SC), // Seychelles
    'SD': visaRequired(NorthMacedoniaSources.SD), // Sudan — source's rules text for this entry reads "South Sudan" (SS's own text), a likely copy-paste artifact; the country field and NEEDED verdict are for Sudan itself
    'SE': entitledRolling(NorthMacedoniaSources.SE), // Sweden
    'SG': entitledRolling(NorthMacedoniaSources.SG), // Singapore
    'SI': entitledRolling(NorthMacedoniaSources.SI), // Slovenia
    'SK': entitledRolling(NorthMacedoniaSources.SK), // Slovakia
    'SL': visaRequired(NorthMacedoniaSources.SL), // Sierra Leone
    'SM': entitledRolling(NorthMacedoniaSources.SM), // San Marino
    'SN': visaRequired(NorthMacedoniaSources.SN), // Senegal
    'SO': visaRequired(NorthMacedoniaSources.SO), // Somalia
    'SR': visaRequired(NorthMacedoniaSources.SR), // Suriname
    'SS': visaRequired(NorthMacedoniaSources.SS), // South Sudan
    'ST': visaRequired(NorthMacedoniaSources.ST), // Sao Tome and Principe
    'SV': entitledRolling(NorthMacedoniaSources.SV), // El Salvador
    'SY': visaRequired(NorthMacedoniaSources.SY), // Syrian Arab Republic
    'SZ': visaRequired(NorthMacedoniaSources.SZ), // Eswatini
    'TD': visaRequired(NorthMacedoniaSources.TD), // Chad
    'TG': visaRequired(NorthMacedoniaSources.TG), // Togo
    'TH': visaRequired(NorthMacedoniaSources.TH), // Thailand
    'TJ': visaRequired(NorthMacedoniaSources.TJ), // Tajikistan
    'TL': visaRequired(NorthMacedoniaSources.TL), // Timor-Leste
    'TM': visaRequired(NorthMacedoniaSources.TM), // Turkmenistan
    'TN': visaRequired(NorthMacedoniaSources.TN), // Tunizi
    'TO': visaRequired(NorthMacedoniaSources.TO), // Tonga
    'TR': entitledRolling(NorthMacedoniaSources.TR), // Turkey
    'TT': visaRequired(NorthMacedoniaSources.TT), // Trinidad and Tobago
    'TV': visaRequired(NorthMacedoniaSources.TV), // Tuvalu
    'TW': entitledRolling(NorthMacedoniaSources.TW), // Taiwan
    'TZ': visaRequired(NorthMacedoniaSources.TZ), // United Republic of Tanzania
    'UA': entitledRolling(NorthMacedoniaSources.UA), // Ukraine
    'UG': visaRequired(NorthMacedoniaSources.UG), // Uganda
    'US': entitledRolling(NorthMacedoniaSources.US), // USA
    'UY': entitledRolling(NorthMacedoniaSources.UY), // Uruguay
    'UZ': visaRequired(NorthMacedoniaSources.UZ), // Uzbekistan
    'VA': entitledRolling(NorthMacedoniaSources.VA), // Vatican City
    'VC': visaRequired(NorthMacedoniaSources.VC), // Saint Vincent and the Grenadines
    'VE': entitledRolling(NorthMacedoniaSources.VE), // Venezuela, Bolivarian Republic of
    'VN': visaRequired(NorthMacedoniaSources.VN), // Vietnam
    'VU': visaRequired(NorthMacedoniaSources.VU), // Vanuatu
    'WS': visaRequired(NorthMacedoniaSources.WS), // Samoa
    'XK': entitledRolling(NorthMacedoniaSources.XK), // Kosovo
    'YE': visaRequired(NorthMacedoniaSources.YE), // Yemen
    'ZA': visaRequired(NorthMacedoniaSources.ZA), // South Africa
    'ZM': visaRequired(NorthMacedoniaSources.ZM), // Zambia
    'ZW': visaRequired(NorthMacedoniaSources.ZW), // Zimbabwe

  },
};

/**
 * Returns the North Macedonia passport rule for a given ISO Alpha-2
 * passport code. Falls through to the default rule (visa_required) for any
 * code not present above (including HK/MO's explicit true-content-gap
 * entries — see file header) and for unknown/null codes.
 */
export function getMacedoniaRule(passportCode: string | null): PassportRule {
  if (!passportCode) return NORTH_MACEDONIA.defaultRule;
  return NORTH_MACEDONIA.passportRules[passportCode] ?? NORTH_MACEDONIA.defaultRule;
}
