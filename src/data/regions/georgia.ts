/**
 * georgia.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Georgia's visa rules by passport/nationality.
 *
 * Sources:
 *   parent (overview): https://geoconsul.gov.ge/en/entering-georgia
 *   direct (per-country durations): https://geoconsul.gov.ge/en/entering-georgia-visa
 *   Both live in @/data/sources — GeorgiaSources.visaList.
 *
 * Per explicit instruction, two further references are cited here as plain
 * comments rather than as SourceDoc citations:
 *   - https://matsne.gov.ge/en/document/view/2867361?publication=0 — "On
 *     Approval of the List of Countries Whose Citizens May Enter Georgia
 *     without a Visa" (the underlying legislation).
 *   - https://www.geoconsul.gov.ge/en/HtmlPage/html/View?id=25 — the
 *     consulate's own list of citizens and stateless persons permanently
 *     residing in the listed countries who may enter, stay in, or transit
 *     Georgia without a visa.
 *
 * Base/default rule is visa_required.
 *
 * ── Scope and shape of the source data ──────────────────────────────────────
 *
 * Unlike most region files in this codebase, visa-free status here is NOT a
 * single tier — the source gives a per-country maximum stay duration. Per
 * explicit instruction, "Full 1 (one) year" and "Full 2 (two) years" are
 * modeled as a flat per-visit day count (365 / 730 days respectively), not
 * as a calendar-anchored `unit: 'years'` PerVisitLimit — the source's own
 * wording is a fixed day-equivalent duration, not "the same calendar date
 * next year."
 *
 * Four duration tiers appear in the source, beyond the dominant one/two-year
 * figures:
 *   - Chile and North Macedonia: "90 days in any 180 day period" — modeled
 *     as the standard rolling_window(90, 180), same shape used throughout
 *     this codebase for that exact language.
 *   - Iran: "45 days" — modeled as per_visit(45 days).
 *   - Uruguay: "90 days" (not qualified as a rolling window in the source
 *     text, unlike Chile/North Macedonia) — modeled as a plain
 *     per_visit(90 days).
 *
 * ── Data quirks ──────────────────────────────────────────────────────────────
 *
 * - The pasted source table visibly garbled the North Macedonia/Russia rows
 *   (the two countries' duration values were out of order relative to their
 *   names). Confirmed with the user: North Macedonia gets "90 days in any
 *   180 day period"; Russia gets "Full 1 (one) year".
 * - ~28 entries in the source carry an unexplained trailing asterisk (e.g.
 *   "Austria*", "United Kingdom of Great Britain and Northern Ireland*").
 *   Confirmed with the user that this is cosmetic and carries no
 *   substantive meaning for this data model — every asterisked entry is
 *   treated identically to its un-asterisked "Full 1 (one) year" peers, no
 *   note or condition attached.
 * - Five "territory" rows in the source table have no ISO Alpha-2 code
 *   distinct from their parent country in COUNTRIES (NationalitySelector.tsx)
 *   and are therefore excluded outright, matching the Albania/Gibraltar
 *   precedent:
 *     - British dependent territories (Jersey, Guernsey, Isle of Man)
 *     - British overseas territories (Bermuda, Cayman Islands, British
 *       Virgin Islands, Falkland Islands, Turks and Caicos Islands,
 *       Gibraltar)
 *     - Denmark territories (Faroe Islands, Greenland)
 *     - French Republic territories (French Polynesia, New Caledonia)
 *     - Netherlands territories (Aruba, Netherlands Antilles)
 *   (Denmark, France, and the Netherlands themselves are still included
 *   under their own DK/FR/NL codes with the standard one-year duration.)
 * - "Holy See (Vatican city)" maps to VA (Vatican City) in COUNTRIES.
 * - "South Korea" maps to KR ("Korea (South)" in COUNTRIES).
 * - "United Kingdom of Great Britain and Northern Ireland" and "United
 *   States of America" map to GB and US respectively.
 *
 * Georgia's own member state (GE) is intentionally not included as a
 * passport-rule entry, matching every other region file in this codebase.
 *
 * Last verified: 2026-09-13
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  PerVisitLimit,
  RollingWindowLimit,
} from '@/types';
import { GeorgiaSources } from '@/data/sources';

// ─── Region-level stay limits ─────────────────────────────────────────────────

const FULL_YEAR: PerVisitLimit = { type: 'per_visit', value: 365, unit: 'days' };
const FULL_TWO_YEARS: PerVisitLimit = { type: 'per_visit', value: 730, unit: 'days' };
const ROLLING_90_180: RollingWindowLimit = { type: 'rolling_window', days: 90, windowDays: 180 };

// ─── Rule helpers ───────────────────────────────────────────────────────────

/** Standard "Full 1 (one) year" entry — the dominant tier in the source table. */
function entitledFull1(): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [FULL_YEAR],
      source: GeorgiaSources.visaList,
    }],
  };
}

/** "Full 2 (two) years" — Ukraine only. */
function entitledFull2(): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [FULL_TWO_YEARS],
      source: GeorgiaSources.visaList,
    }],
  };
}

/** "90 days in any 180 day period" — Chile and North Macedonia. */
function entitledRolling(): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [ROLLING_90_180],
      source: GeorgiaSources.visaList,
    }],
  };
}

/** A plain per-visit day count not otherwise covered above — Iran (45), Uruguay (90). */
function entitledPerVisit(days: number): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [{ type: 'per_visit', value: days, unit: 'days' }],
      source: GeorgiaSources.visaList,
    }],
  };
}

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required', source: GeorgiaSources.visaList };

// ─── Region definition ────────────────────────────────────────────────────────

export const GEORGIA: RegionDefinition = {
  code: 'georgia',
  name: 'Georgia',
  memberStates: ['GE'],
  rule: {
    type: 'per_visit',
    allowanceDays: 365,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-13',
  sourceUrl: GeorgiaSources.visaList.parentUrl,
  defaultRule: VISA_REQUIRED,
  passportRules: {

    'AD': entitledFull1(), // Andorra
    'AE': entitledFull1(), // United Arab Emirates
    'AG': entitledFull1(), // Antigua and Barbuda
    'AL': entitledFull1(), // Albania
    'AM': entitledFull1(), // Armenia
    'AR': entitledFull1(), // Argentina
    'AT': entitledFull1(), // Austria
    'AU': entitledFull1(), // Australia
    'AZ': entitledFull1(), // Azerbaijan
    'BA': entitledFull1(), // Bosnia and Herzegovina
    'BB': entitledFull1(), // Barbados
    'BE': entitledFull1(), // Belgium
    'BG': entitledFull1(), // Bulgaria
    'BH': entitledFull1(), // Bahrain
    'BN': entitledFull1(), // Brunei
    'BR': entitledFull1(), // Brazil
    'BS': entitledFull1(), // Bahamas
    'BW': entitledFull1(), // Botswana
    'BY': entitledFull1(), // Belarus
    'BZ': entitledFull1(), // Belize
    'CA': entitledFull1(), // Canada
    'CH': entitledFull1(), // Switzerland
    'CL': entitledRolling(), // Chile
    'CO': entitledFull1(), // Colombia
    'CR': entitledFull1(), // Costa Rica
    'CY': entitledFull1(), // Cyprus
    'CZ': entitledFull1(), // Czech Republic
    'DE': entitledFull1(), // Germany
    'DK': entitledFull1(), // Denmark
    'DM': entitledFull1(), // Dominica
    'EC': entitledFull1(), // Ecuador
    'EE': entitledFull1(), // Estonia
    'ES': entitledFull1(), // Spain
    'FI': entitledFull1(), // Finland
    'FR': entitledFull1(), // France
    'GB': entitledFull1(), // United Kingdom of Great Britain and Northern Ireland
    'GR': entitledFull1(), // Greece
    'HN': entitledFull1(), // Honduras
    'HR': entitledFull1(), // Croatia
    'HU': entitledFull1(), // Hungary
    'IE': entitledFull1(), // Ireland
    'IL': entitledFull1(), // Israel
    'IR': entitledPerVisit(45), // Iran
    'IS': entitledFull1(), // Iceland
    'IT': entitledFull1(), // Italy
    'JO': entitledFull1(), // Jordan
    'JP': entitledFull1(), // Japan
    'KG': entitledFull1(), // Kyrgyzstan
    'KR': entitledFull1(), // South Korea
    'KW': entitledFull1(), // Kuwait
    'KZ': entitledFull1(), // Kazakhstan
    'LB': entitledFull1(), // Lebanon
    'LI': entitledFull1(), // Liechtenstein
    'LT': entitledFull1(), // Lithuania
    'LU': entitledFull1(), // Luxembourg
    'LV': entitledFull1(), // Latvia
    'MC': entitledFull1(), // Monaco
    'MD': entitledFull1(), // Moldova
    'ME': entitledFull1(), // Montenegro
    'MK': entitledRolling(), // North Macedonia
    'MT': entitledFull1(), // Malta
    'MU': entitledFull1(), // Mauritius
    'MX': entitledFull1(), // Mexico
    'MY': entitledFull1(), // Malaysia
    'NL': entitledFull1(), // Netherlands
    'NO': entitledFull1(), // Norway
    'NZ': entitledFull1(), // New Zealand
    'OM': entitledFull1(), // Oman
    'PA': entitledFull1(), // Panama
    'PL': entitledFull1(), // Poland
    'PT': entitledFull1(), // Portugal
    'QA': entitledFull1(), // Qatar
    'RO': entitledFull1(), // Romania
    'RS': entitledFull1(), // Serbia
    'RU': entitledFull1(), // Russia
    'SA': entitledFull1(), // Saudi Arabia
    'SC': entitledFull1(), // Seychelles
    'SE': entitledFull1(), // Sweden
    'SG': entitledFull1(), // Singapore
    'SI': entitledFull1(), // Slovenia
    'SK': entitledFull1(), // Slovakia
    'SM': entitledFull1(), // San Marino
    'SV': entitledFull1(), // El Salvador
    'TH': entitledFull1(), // Thailand
    'TJ': entitledFull1(), // Tajikistan
    'TM': entitledFull1(), // Turkmenistan
    'TR': entitledFull1(), // Turkey
    'UA': entitledFull2(), // Ukraine
    'US': entitledFull1(), // United States of America
    'UY': entitledPerVisit(90), // Uruguay
    'UZ': entitledFull1(), // Uzbekistan
    'VA': entitledFull1(), // Holy See (Vatican City)
    'VC': entitledFull1(), // Saint Vincent and the Grenadines
    'ZA': entitledFull1(), // South Africa

  },
};

/**
 * Returns the Georgia passport rule for a given ISO Alpha-2 passport code.
 * Falls through to the default rule (visa_required) for any code not
 * present above and for unknown/null codes.
 */
export function getGeorgiaRule(passportCode: string | null): PassportRule {
  if (!passportCode) return GEORGIA.defaultRule;
  return GEORGIA.passportRules[passportCode] ?? GEORGIA.defaultRule;
}
