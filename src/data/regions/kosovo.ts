/**
 * kosovo.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Kosovo's visa rules by passport/nationality.
 *
 * Source: Kosovo Ministry of Foreign Affairs and Diaspora —
 *   https://ambasadat.net/visas/
 * This single page lists every visa-exempt nationality. Unlike Montenegro/
 * Serbia, and like Bosnia, there are no stable per-country subpages on this
 * site — every entry below cites the same single page for both `directUrl`
 * and `parentUrl` (same policy as BosniaSources, adopted here for the same
 * reason: only one page exists at all).
 *
 * ── Scope of the source list ────────────────────────────────────────────────
 *
 * The page is explicitly a visa-EXEMPT list — every nationality on it may
 * enter without a visa; every nationality NOT on it requires one. There is no
 * separate "visa required" enumeration to cross-reference against, so
 * `defaultRule: visa_required` (with no per-country entries) does the work
 * that Montenegro/Serbia/Bosnia's hand-written `visaRequired()` calls did —
 * there is nothing else on the source page to encode.
 *
 * ── Duration figure — confirmed list, unconfirmed per-country duration ─────
 *
 * Per explicit instruction: the list of 103 visa-exempt nationalities itself
 * is confirmed correct, but the source page does not state a per-country
 * stay-duration limit for each entry individually. The standard 90-day-in-
 * 180-day allowance (matching Schengen/Türkiye/Montenegro/Serbia/Bosnia's
 * shape) is applied uniformly across the whole list as the safe assumption,
 * not as an individually-confirmed figure per nationality — every entitled
 * entry below carries a note saying so explicitly.
 *
 * Kosovo's own member state (XK) is intentionally not included as a
 * passport-rule entry, matching every other region file this session
 * (Montenegro/Serbia/Bosnia never encode a rule for their own member
 * state's passport either).
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
import { KosovoSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

/**
 * 90 days in any 180-day rolling window — the same shape as Schengen,
 * Türkiye, Montenegro, Serbia, and Bosnia's standard allowance. Applied
 * uniformly to every entry on Kosovo's visa-exempt list (see file header —
 * the source confirms the list of exempt nationalities, not a per-country
 * duration figure).
 */
const KOSOVO_LIMIT: import('@/types').RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

const DURATION_NOTE_TEXT =
  'Kosovo\'s visa-exempt list (which nationalities may enter without a visa) is confirmed correct. The source does not state a per-country stay-duration limit — the standard 90-day-in-180-day allowance is applied uniformly to every nationality on this list as a safe assumption, not individually confirmed per country.';

// ─── Entitlement helper ─────────────────────────────────────────────────────

/**
 * Standard Kosovo entitled rule — 90 days, rolling_window(90,180), always
 * carrying the duration-not-individually-confirmed note (see file header).
 *
 * Cites KosovoSources.<CODE> via `source` — surfaced by the UI as a link on
 * the stay-rule summary (see montenegro.ts's entitled() helper for the full
 * rationale on source-link vs. note placement).
 */
function entitledRolling(source: SourceDoc): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [KOSOVO_LIMIT],
      source,
      notes: [{ text: DURATION_NOTE_TEXT, source }],
    }],
  };
}

// ─── Region definition ────────────────────────────────────────────────────────

export const KOSOVO: RegionDefinition = {
  code: 'kosovo',
  name: 'Kosovo',
  memberStates: ['XK'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-04',
  sourceUrl: 'https://ambasadat.net/visas/',
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── Entitled — 90 days in any 180-day rolling window (confirmed list, ────────
    // duration figure applied uniformly per the file header) ─────────────────────
    'AD': entitledRolling(KosovoSources.AD), // Andorra
    'AE': entitledRolling(KosovoSources.AE), // United Arab Emirates
    'AG': entitledRolling(KosovoSources.AG), // Antigua and Barbuda
    'AL': entitledRolling(KosovoSources.AL), // Albania
    'AR': entitledRolling(KosovoSources.AR), // Argentina
    'AT': entitledRolling(KosovoSources.AT), // Austria
    'AU': entitledRolling(KosovoSources.AU), // Australia
    'BB': entitledRolling(KosovoSources.BB), // Barbados
    'BE': entitledRolling(KosovoSources.BE), // Belgium
    'BG': entitledRolling(KosovoSources.BG), // Bulgaria
    'BH': entitledRolling(KosovoSources.BH), // Bahrain
    'BN': entitledRolling(KosovoSources.BN), // Brunei
    'BR': entitledRolling(KosovoSources.BR), // Brazil
    'BS': entitledRolling(KosovoSources.BS), // Bahamas
    'BW': entitledRolling(KosovoSources.BW), // Botswana
    'BZ': entitledRolling(KosovoSources.BZ), // Belize
    'CA': entitledRolling(KosovoSources.CA), // Canada
    'CH': entitledRolling(KosovoSources.CH), // Switzerland
    'CL': entitledRolling(KosovoSources.CL), // Chile
    'CO': entitledRolling(KosovoSources.CO), // Colombia
    'CR': entitledRolling(KosovoSources.CR), // Costa Rica
    'CY': entitledRolling(KosovoSources.CY), // Cyprus
    'CZ': entitledRolling(KosovoSources.CZ), // Czech Republic
    'DE': entitledRolling(KosovoSources.DE), // Germany
    'DK': entitledRolling(KosovoSources.DK), // Denmark
    'DM': entitledRolling(KosovoSources.DM), // Dominica
    'EE': entitledRolling(KosovoSources.EE), // Estonia
    'ES': entitledRolling(KosovoSources.ES), // Spain
    'FI': entitledRolling(KosovoSources.FI), // Finland
    'FJ': entitledRolling(KosovoSources.FJ), // Fiji
    'FM': entitledRolling(KosovoSources.FM), // Micronesia
    'FR': entitledRolling(KosovoSources.FR), // France
    'GB': entitledRolling(KosovoSources.GB), // United Kingdom
    'GD': entitledRolling(KosovoSources.GD), // Grenada
    'GR': entitledRolling(KosovoSources.GR), // Greece
    'GT': entitledRolling(KosovoSources.GT), // Guatemala
    'GY': entitledRolling(KosovoSources.GY), // Guyana
    'HN': entitledRolling(KosovoSources.HN), // Honduras
    'HR': entitledRolling(KosovoSources.HR), // Croatia
    'HU': entitledRolling(KosovoSources.HU), // Hungary
    'IE': entitledRolling(KosovoSources.IE), // Ireland
    'IL': entitledRolling(KosovoSources.IL), // Israel
    'IS': entitledRolling(KosovoSources.IS), // Iceland
    'IT': entitledRolling(KosovoSources.IT), // Italy
    'JO': entitledRolling(KosovoSources.JO), // Jordan
    'JP': entitledRolling(KosovoSources.JP), // Japan
    'KI': entitledRolling(KosovoSources.KI), // Kiribati
    'KN': entitledRolling(KosovoSources.KN), // Saint Kitts and Nevis
    'KR': entitledRolling(KosovoSources.KR), // Korea (South)
    'KW': entitledRolling(KosovoSources.KW), // Kuwait
    'LC': entitledRolling(KosovoSources.LC), // Saint Lucia
    'LI': entitledRolling(KosovoSources.LI), // Liechtenstein
    'LS': entitledRolling(KosovoSources.LS), // Lesotho
    'LT': entitledRolling(KosovoSources.LT), // Lithuania
    'LU': entitledRolling(KosovoSources.LU), // Luxembourg
    'LV': entitledRolling(KosovoSources.LV), // Latvia
    'MC': entitledRolling(KosovoSources.MC), // Monaco
    'ME': entitledRolling(KosovoSources.ME), // Montenegro
    'MH': entitledRolling(KosovoSources.MH), // Marshall Islands
    'MK': entitledRolling(KosovoSources.MK), // North Macedonia
    'MT': entitledRolling(KosovoSources.MT), // Malta
    'MU': entitledRolling(KosovoSources.MU), // Mauritius
    'MV': entitledRolling(KosovoSources.MV), // Maldives
    'MW': entitledRolling(KosovoSources.MW), // Malawi
    'MX': entitledRolling(KosovoSources.MX), // Mexico
    'MY': entitledRolling(KosovoSources.MY), // Malaysia
    'NA': entitledRolling(KosovoSources.NA), // Namibia
    'NI': entitledRolling(KosovoSources.NI), // Nicaragua
    'NL': entitledRolling(KosovoSources.NL), // Netherlands
    'NO': entitledRolling(KosovoSources.NO), // Norway
    'NR': entitledRolling(KosovoSources.NR), // Nauru
    'NZ': entitledRolling(KosovoSources.NZ), // New Zealand
    'OM': entitledRolling(KosovoSources.OM), // Oman
    'PA': entitledRolling(KosovoSources.PA), // Panama
    'PG': entitledRolling(KosovoSources.PG), // Papua New Guinea
    'PL': entitledRolling(KosovoSources.PL), // Poland
    'PT': entitledRolling(KosovoSources.PT), // Portugal
    'PW': entitledRolling(KosovoSources.PW), // Palau
    'PY': entitledRolling(KosovoSources.PY), // Paraguay
    'QA': entitledRolling(KosovoSources.QA), // Qatar
    'RO': entitledRolling(KosovoSources.RO), // Romania
    'RS': entitledRolling(KosovoSources.RS), // Serbia
    'SA': entitledRolling(KosovoSources.SA), // Saudi Arabia
    'SB': entitledRolling(KosovoSources.SB), // Solomon Islands
    'SC': entitledRolling(KosovoSources.SC), // Seychelles
    'SE': entitledRolling(KosovoSources.SE), // Sweden
    'SK': entitledRolling(KosovoSources.SK), // Slovakia
    'SM': entitledRolling(KosovoSources.SM), // San Marino
    'ST': entitledRolling(KosovoSources.ST), // Sao Tome and Principe
    'SV': entitledRolling(KosovoSources.SV), // El Salvador
    'SZ': entitledRolling(KosovoSources.SZ), // Eswatini
    'TL': entitledRolling(KosovoSources.TL), // Timor-Leste
    'TO': entitledRolling(KosovoSources.TO), // Tonga
    'TR': entitledRolling(KosovoSources.TR), // Turkey
    'TT': entitledRolling(KosovoSources.TT), // Trinidad and Tobago
    'TV': entitledRolling(KosovoSources.TV), // Tuvalu
    'US': entitledRolling(KosovoSources.US), // United States
    'UY': entitledRolling(KosovoSources.UY), // Uruguay
    'VA': entitledRolling(KosovoSources.VA), // Vatican City
    'VC': entitledRolling(KosovoSources.VC), // Saint Vincent and the Grenadines
    'VE': entitledRolling(KosovoSources.VE), // Venezuela
    'VU': entitledRolling(KosovoSources.VU), // Vanuatu
    'WS': entitledRolling(KosovoSources.WS), // Samoa

  },
};

/**
 * Returns the Kosovo passport rule for a given ISO Alpha-2 passport code.
 * Every nationality not on Kosovo's visa-exempt list (or an unknown/null
 * code) falls through to the default rule (visa_required) — the source page
 * only ever enumerates exemptions, never visa-required nationalities.
 */
export function getKosovoRule(passportCode: string | null): PassportRule {
  if (!passportCode) return KOSOVO.defaultRule;
  return KOSOVO.passportRules[passportCode] ?? KOSOVO.defaultRule;
}
