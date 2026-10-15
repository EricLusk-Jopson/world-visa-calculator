/**
 * kosovo.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Kosovo's visa rules by passport/nationality.
 *
 * Source: Kosovo Ministry of Foreign Affairs and Diaspora —
 *   https://ambasadat.net/visas/
 * This single page lists every visa-exempt nationality. Unlike Montenegro/
 * Serbia, there are no per-country subpages on this site, so every entry
 * below cites the one shared KosovoSources.visaExempt entry.
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
 * Kosovo's own member state (XK) is encoded as free_movement — a Kosovan
 * national needs no visa to enter Kosovo, and prior region files that fell
 * through to defaultRule (visa_required) for their own passport were wrong.
 *
 * Last verified: 2026-09-04
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  FreeMovementRule,
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
const FREE_MOVEMENT: FreeMovementRule = { access: 'free_movement' };

const DURATION_NOTE_TEXT =
  'Visa-free status is confirmed. The official source does not provide a stay-duration limit for this nationality, so the widely-reported 90 days in 180 days rule is applied.';

// ─── Entitlement helper ─────────────────────────────────────────────────────

/**
 * Standard Kosovo entitled rule — 90 days, rolling_window(90,180), always
 * carrying the duration-not-individually-confirmed note (see file header).
 *
 * Cites KosovoSources.visaExempt via `source` — surfaced by the UI as a link
 * on the stay-rule summary (see montenegro.ts's entitled() helper for the
 * full rationale on source-link vs. note placement).
 */
function entitledRolling(): EntitledRule {
  const source = KosovoSources.visaExempt;
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

    // ── Kosovan citizens ────────────────────────────────────────────────────
    'XK': FREE_MOVEMENT,

    // ── Entitled — 90 days in any 180-day rolling window (confirmed list, ────────
    // duration figure applied uniformly per the file header) ─────────────────────
    'AD': entitledRolling(), // Andorra
    'AE': entitledRolling(), // United Arab Emirates
    'AG': entitledRolling(), // Antigua and Barbuda
    'AL': entitledRolling(), // Albania
    'AR': entitledRolling(), // Argentina
    'AT': entitledRolling(), // Austria
    'AU': entitledRolling(), // Australia
    'BB': entitledRolling(), // Barbados
    'BE': entitledRolling(), // Belgium
    'BG': entitledRolling(), // Bulgaria
    'BH': entitledRolling(), // Bahrain
    'BN': entitledRolling(), // Brunei
    'BR': entitledRolling(), // Brazil
    'BS': entitledRolling(), // Bahamas
    'BW': entitledRolling(), // Botswana
    'BZ': entitledRolling(), // Belize
    'CA': entitledRolling(), // Canada
    'CH': entitledRolling(), // Switzerland
    'CL': entitledRolling(), // Chile
    'CO': entitledRolling(), // Colombia
    'CR': entitledRolling(), // Costa Rica
    'CY': entitledRolling(), // Cyprus
    'CZ': entitledRolling(), // Czech Republic
    'DE': entitledRolling(), // Germany
    'DK': entitledRolling(), // Denmark
    'DM': entitledRolling(), // Dominica
    'EE': entitledRolling(), // Estonia
    'ES': entitledRolling(), // Spain
    'FI': entitledRolling(), // Finland
    'FJ': entitledRolling(), // Fiji
    'FM': entitledRolling(), // Micronesia
    'FR': entitledRolling(), // France
    'GB': entitledRolling(), // United Kingdom
    'GD': entitledRolling(), // Grenada
    'GR': entitledRolling(), // Greece
    'GT': entitledRolling(), // Guatemala
    'GY': entitledRolling(), // Guyana
    'HN': entitledRolling(), // Honduras
    'HR': entitledRolling(), // Croatia
    'HU': entitledRolling(), // Hungary
    'IE': entitledRolling(), // Ireland
    'IL': entitledRolling(), // Israel
    'IS': entitledRolling(), // Iceland
    'IT': entitledRolling(), // Italy
    'JO': entitledRolling(), // Jordan
    'JP': entitledRolling(), // Japan
    'KI': entitledRolling(), // Kiribati
    'KN': entitledRolling(), // Saint Kitts and Nevis
    'KR': entitledRolling(), // Korea (South)
    'KW': entitledRolling(), // Kuwait
    'LC': entitledRolling(), // Saint Lucia
    'LI': entitledRolling(), // Liechtenstein
    'LS': entitledRolling(), // Lesotho
    'LT': entitledRolling(), // Lithuania
    'LU': entitledRolling(), // Luxembourg
    'LV': entitledRolling(), // Latvia
    'MC': entitledRolling(), // Monaco
    'ME': entitledRolling(), // Montenegro
    'MH': entitledRolling(), // Marshall Islands
    'MK': entitledRolling(), // North Macedonia
    'MT': entitledRolling(), // Malta
    'MU': entitledRolling(), // Mauritius
    'MV': entitledRolling(), // Maldives
    'MW': entitledRolling(), // Malawi
    'MX': entitledRolling(), // Mexico
    'MY': entitledRolling(), // Malaysia
    'NA': entitledRolling(), // Namibia
    'NI': entitledRolling(), // Nicaragua
    'NL': entitledRolling(), // Netherlands
    'NO': entitledRolling(), // Norway
    'NR': entitledRolling(), // Nauru
    'NZ': entitledRolling(), // New Zealand
    'OM': entitledRolling(), // Oman
    'PA': entitledRolling(), // Panama
    'PG': entitledRolling(), // Papua New Guinea
    'PL': entitledRolling(), // Poland
    'PT': entitledRolling(), // Portugal
    'PW': entitledRolling(), // Palau
    'PY': entitledRolling(), // Paraguay
    'QA': entitledRolling(), // Qatar
    'RO': entitledRolling(), // Romania
    'RS': entitledRolling(), // Serbia
    'SA': entitledRolling(), // Saudi Arabia
    'SB': entitledRolling(), // Solomon Islands
    'SC': entitledRolling(), // Seychelles
    'SE': entitledRolling(), // Sweden
    'SK': entitledRolling(), // Slovakia
    'SM': entitledRolling(), // San Marino
    'ST': entitledRolling(), // Sao Tome and Principe
    'SV': entitledRolling(), // El Salvador
    'SZ': entitledRolling(), // Eswatini
    'TL': entitledRolling(), // Timor-Leste
    'TO': entitledRolling(), // Tonga
    'TR': entitledRolling(), // Turkey
    'TT': entitledRolling(), // Trinidad and Tobago
    'TV': entitledRolling(), // Tuvalu
    'US': entitledRolling(), // United States
    'UY': entitledRolling(), // Uruguay
    'VA': entitledRolling(), // Vatican City
    'VC': entitledRolling(), // Saint Vincent and the Grenadines
    'VE': entitledRolling(), // Venezuela
    'VU': entitledRolling(), // Vanuatu
    'WS': entitledRolling(), // Samoa

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
