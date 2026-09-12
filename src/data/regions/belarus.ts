/**
 * belarus.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Belarus's visa rules by passport/nationality.
 *
 * Sources (Ministry of Foreign Affairs of the Republic of Belarus):
 *   - General (visa-required list):        BelarusSources.general
 *   - Any-border override, 38 European countries: BelarusSources.europe
 *   - Airport-only fallback (visa-free list):     BelarusSources.airport
 *
 * ── Three-tier structure ──────────────────────────────────────────────────────
 *
 * 1. European any-border override (38 countries, `europeOverride()`): visa-free
 *    through ANY border crossing point (not just airports), usable multiple
 *    times, for up to 30 days per visit (90 for Poland, Latvia, Lithuania).
 *    The source states this can be used repeatedly "up to and including
 *    31 December 2026" — modeled as a `TemporalWindow` with `validUntil:
 *    '2026-12-31'` and no `validFrom` (in effect since before this data was
 *    written; see TemporalWindow's own doc comment on why an unstated start
 *    is never backfilled with today's date). This is the FIRST region file in
 *    this codebase where a temporal-window entitlement is followed by a
 *    second, still-genuinely-entitled (not visa_required) fallback entitlement
 *    — every prior use of `temporalWindows` (Bosnia/Montenegro) either has no
 *    fallback at all (falls through to visa_required outside the window) or
 *    is the only entitlement on the rule. `selectEntitlement()` already
 *    supports this correctly (it walks `entitlements` in order and returns
 *    the first match; a temporal entry that doesn't match the trip's date is
 *    skipped, not treated as terminal), confirmed by direct reading of
 *    `stayCalculator.ts` — this file is simply the first to exercise it live.
 *    Ordering matters: the temporal entitlement MUST be listed before the
 *    unconditional one in `entitlements`, or the unconditional entry would
 *    short-circuit the loop and the override would never be selected.
 *
 * 2. Airport-only fallback (`airportOnly()`): the always-available baseline
 *    for every genuinely visa-free nationality — visa-free only through
 *    Minsk National Airport or the airports at Brest, Gomel, Grodno,
 *    Mogilev, or Vitebsk, not from Russia, 30 days per visit, with NO cap on
 *    the number of visits but a combined cap of 90 days inside Belarus per
 *    CALENDAR year (not a rolling window). This reuses the exact
 *    `calendar_period` + `per_visit` stacked-limit shape Turkiye's own file
 *    already uses for ITS Belarusian nationals (`turkiye.ts`'s `'BY'` entry,
 *    `TR_PER_VISIT_30` + `TR_CALENDAR_90`) — confirmed via direct reading
 *    that `assessCalendarPeriod()`/`assessStay()` in `stayCalculator.ts`
 *    already correctly anchor the budget window to Jan 1–Dec 31 of the
 *    entry date's year and take the more restrictive of the two stacked
 *    limits, so no new evaluation logic is needed here — Belarus-as-a-
 *    destination is simply the mirror-image reuse of an already-proven shape.
 *    (Known pre-existing gap, not introduced here: `destinationStatus.ts`'s
 *    region-level `per_visit` branch only reads the `PerVisitLimit` and
 *    ignores an accompanying `calendar_period` limit, so the header/slider
 *    "days remaining" chip for a traveler tracking Belarus as their active
 *    destination will reflect only the 30-day-per-visit cap, not the
 *    90-day/year ceiling. The per-trip Eligibility & Duration panel
 *    (`tripEligibility.ts`) is unaffected — it calls `resolveStayLimits`/
 *    `assessStay` generically and already handles this correctly. The same
 *    gap already exists today for Belarusian nationals tracking Türkiye, so
 *    this is a pre-existing characteristic of the shared calculator, not a
 *    defect introduced by adding this region.)
 *
 * 3. Reclassified visa_required (`visaRequiredConditional()`): 12 nationals
 *    the source lists under its visa-free table, but only conditional on
 *    already holding a valid multiple-entry EU/Schengen visa bearing an
 *    EU/Schengen entry stamp, plus a return ticket from one of the same six
 *    airports. Per explicit product decision, a nationality that still has
 *    to obtain another jurisdiction's visa first is not meaningfully
 *    visa-free — these are modeled as `visa_required` with a note explaining
 *    why, rather than `entitled`.
 *
 * Everything not explicitly listed defaults to `visa_required` — matching
 * every other region file's convention — cited to BelarusSources.general.
 *
 * ── Other data notes ─────────────────────────────────────────────────────────
 *
 * - Latvia's entry includes "non-citizens of Latvia"; Estonia's includes
 *   "stateless persons permanently residing in Estonia" — both source
 *   footnotes, carried as an extra note on those two entries.
 * - Land-border entry may be possible for some European/bilateral-agreement
 *   nationals per the source, but the airport list is cited exclusively
 *   because it is the stable, easily-verified subset (explicit product
 *   decision) — noted on every airport-based entitlement rather than modeled.
 * - Belarus's own member state (BY) is intentionally not included as a
 *   passport-rule entry, matching every other region file in this codebase.
 *
 * Last verified: 2026-09-12
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  RuleNote,
  PerVisitLimit,
  CalendarPeriodLimit,
} from '@/types';
import { BelarusSources } from '@/data/sources';

// ─── Stay limits ──────────────────────────────────────────────────────────────

const BY_PER_VISIT_30: PerVisitLimit = { type: 'per_visit', value: 30, unit: 'days' };
const BY_CALENDAR_90: CalendarPeriodLimit = { type: 'calendar_period', days: 90, periodDays: 365 };

// ─── Shared notes ─────────────────────────────────────────────────────────────

const AIRPORT_NOTES: RuleNote[] = [
  {
    text: 'Visa-free entry is available only through Minsk National Airport or the airports at Brest, Gomel, Grodno, Mogilev, or Vitebsk. Some nationalities may also enter by land under bilateral agreements not modeled here — the airport list is cited because it is the more stable, easily verified subset; check the Belarus MFA website for current land-border arrangements.',
    source: BelarusSources.airport,
  },
  {
    text: 'Visa-free entry through these airports is not available to travelers arriving directly from Russia.',
    source: BelarusSources.airport,
  },
];

const LV_NON_CITIZEN_NOTE: RuleNote = {
  text: 'Includes persons with the status of non-citizen of Latvia.',
  source: BelarusSources.europe,
};

const EE_STATELESS_NOTE: RuleNote = {
  text: 'Includes stateless persons permanently residing in Estonia.',
  source: BelarusSources.europe,
};

// ─── Rule helpers ───────────────────────────────────────────────────────────

/**
 * Airport-only entitlement — 30 days per visit, unlimited visits, but no
 * more than 90 total days inside Belarus per calendar year (see file
 * header). Always the fallback (no temporalWindows), so it's selected
 * unconditionally once no earlier, temporally-gated entitlement matches.
 */
function airportEntitlement(extraNotes: RuleNote[] = []) {
  return {
    limits: [BY_PER_VISIT_30, BY_CALENDAR_90] as [PerVisitLimit, CalendarPeriodLimit],
    source: BelarusSources.airport,
    notes: [...AIRPORT_NOTES, ...extraNotes],
  };
}

function airportOnly(extraNotes: RuleNote[] = []): EntitledRule {
  return { access: 'entitled', entitlements: [airportEntitlement(extraNotes)] };
}

/**
 * European any-border override — visa-free through any border crossing
 * point, `days` per visit (30 or 90), usable multiple times, through
 * 2026-12-31. Falls back to the airport-only rule automatically once the
 * window lapses (see file header for why this ordering is load-bearing).
 */
function europeOverride(days: 30 | 90, extraNotes: RuleNote[] = []): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [
      {
        temporalWindows: [{
          validUntil: '2026-12-31',
          description: 'Visa-free entry through any border crossing point',
          source: BelarusSources.europe,
        }],
        limits: [{ type: 'per_visit', value: days, unit: 'days' }],
        source: BelarusSources.europe,
        notes: [
          {
            text: `Visa-free entry through any Belarusian border crossing point (not limited to the airports used by other nationalities), usable multiple times, for stays of up to ${days} days each, through 31 December 2026.`,
            source: BelarusSources.europe,
          },
          ...extraNotes,
        ],
      },
      airportEntitlement(),
    ],
  };
}

/**
 * The source lists this nationality as visa-free, but only when the
 * traveler already holds another jurisdiction's visa — per explicit product
 * decision, that's not meaningfully visa-free, so this is visa_required
 * with an explanatory note (see file header).
 */
function visaRequiredConditional(): VisaRequiredRule {
  return {
    access: 'visa_required',
    source: BelarusSources.airport,
    notes: [{
      text: 'The source lists this nationality among visa-free travelers, but only when the traveler already holds a valid multiple-entry visa for an EU or Schengen Area member state (bearing an EU/Schengen entry stamp) and a return ticket from Minsk National Airport or the airports at Brest, Vitebsk, Gomel, Grodno, or Mogilev. Since entry is contingent on holding another jurisdiction\'s visa, this is treated as visa-required rather than visa-free.',
      source: BelarusSources.airport,
    }],
  };
}

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required', source: BelarusSources.general };

// ─── Region definition ────────────────────────────────────────────────────────

export const BELARUS: RegionDefinition = {
  code: 'belarus',
  name: 'Belarus',
  memberStates: ['BY'],
  rule: {
    type: 'per_visit',
    allowanceDays: 30,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-12',
  sourceUrl: BelarusSources.general.parentUrl,
  defaultRule: VISA_REQUIRED,
  passportRules: {


    // ── European any-border override — temporal window through 2026-12-31 ────
    // (falls back automatically to the airport-only rule below once the window
    // lapses — see europeOverride() and the file header)

    'AD': europeOverride(30), // Andorra
    'AT': europeOverride(30), // Austria
    'BA': europeOverride(30), // Bosnia and Herzegovina
    'BE': europeOverride(30), // Belgium
    'BG': europeOverride(30), // Bulgaria
    'CH': europeOverride(30), // Switzerland
    'CY': europeOverride(30), // Cyprus
    'CZ': europeOverride(30), // Czechia
    'DE': europeOverride(30), // Germany
    'DK': europeOverride(30), // Denmark
    'EE': europeOverride(30, [EE_STATELESS_NOTE]), // Estonia
    'ES': europeOverride(30), // Spain
    'FI': europeOverride(30), // Finland
    'FR': europeOverride(30), // France
    'GB': europeOverride(30), // United Kingdom
    'GR': europeOverride(30), // Greece
    'HR': europeOverride(30), // Croatia
    'HU': europeOverride(30), // Hungary
    'IE': europeOverride(30), // Ireland
    'IS': europeOverride(30), // Iceland
    'IT': europeOverride(30), // Italy
    'LI': europeOverride(30), // Liechtenstein
    'LT': europeOverride(90), // Lithuania
    'LU': europeOverride(30), // Luxembourg
    'LV': europeOverride(90, [LV_NON_CITIZEN_NOTE]), // Latvia
    'MC': europeOverride(30), // Monaco
    'MK': europeOverride(30), // North Macedonia
    'MT': europeOverride(30), // Malta
    'NL': europeOverride(30), // Netherlands
    'NO': europeOverride(30), // Norway
    'PL': europeOverride(90), // Poland
    'PT': europeOverride(30), // Portugal
    'RO': europeOverride(30), // Romania
    'SE': europeOverride(30), // Sweden
    'SI': europeOverride(30), // Slovenia
    'SK': europeOverride(30), // Slovakia
    'SM': europeOverride(30), // San Marino
    'VA': europeOverride(30), // Vatican City

    // ── Airport-only, no European override (visa-free forever, subject to review) ─

    'AG': airportOnly(), // Antigua and Barbuda
    'AU': airportOnly(), // Australia
    'BB': airportOnly(), // Barbados
    'BH': airportOnly(), // Bahrain
    'CA': airportOnly(), // Canada
    'CL': airportOnly(), // Chile
    'DM': airportOnly(), // Dominica
    'FM': airportOnly(), // Micronesia
    'ID': airportOnly(), // Indonesia
    'JP': airportOnly(), // Japan
    'KR': airportOnly(), // Korea (South)
    'KW': airportOnly(), // Kuwait
    'MX': airportOnly(), // Mexico
    'MY': airportOnly(), // Malaysia
    'NI': airportOnly(), // Nicaragua
    'NZ': airportOnly(), // New Zealand
    'OM': airportOnly(), // Oman
    'PA': airportOnly(), // Panama
    'PE': airportOnly(), // Peru
    'SA': airportOnly(), // Saudi Arabia
    'SC': airportOnly(), // Seychelles
    'SG': airportOnly(), // Singapore
    'SV': airportOnly(), // El Salvador
    'UY': airportOnly(), // Uruguay
    'VC': airportOnly(), // Saint Vincent and the Grenadines
    'VU': airportOnly(), // Vanuatu

    // ── Reclassified visa_required — source lists these as visa-free, but only ───
    // when the traveler already holds another jurisdiction's visa (see file header) ─

    'EG': visaRequiredConditional(), // Egypt
    'GM': visaRequiredConditional(), // Gambia
    'HT': visaRequiredConditional(), // Haiti
    'IN': visaRequiredConditional(), // India
    'IR': visaRequiredConditional(), // Iran
    'JO': visaRequiredConditional(), // Jordan
    'LB': visaRequiredConditional(), // Lebanon
    'NA': visaRequiredConditional(), // Namibia
    'PK': visaRequiredConditional(), // Pakistan
    'VN': visaRequiredConditional(), // Vietnam
    'WS': visaRequiredConditional(), // Samoa
    'ZA': visaRequiredConditional(), // South Africa

  },
};

/**
 * Returns the Belarus passport rule for a given ISO Alpha-2 passport code.
 * Falls through to the default rule (visa_required) for any code not
 * present above and for unknown/null codes.
 */
export function getBelarusRule(passportCode: string | null): PassportRule {
  if (!passportCode) return BELARUS.defaultRule;
  return BELARUS.passportRules[passportCode] ?? BELARUS.defaultRule;
}
