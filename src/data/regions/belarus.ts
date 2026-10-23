/**
 * belarus.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Belarus's visa rules by passport/nationality.
 *
 * Sources (Ministry of Foreign Affairs of the Republic of Belarus):
 *   - General (visa-required list):        BelarusSources.general
 *   - Any-border override, 38 European countries: BelarusSources.europe
 *   - Airport-only fallback (visa-free list):     BelarusSources.airport
 *   - Bilateral visa-free (general information):  BelarusSources.bilateral
 *
 * ── Five-tier structure ───────────────────────────────────────────────────────
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
 *    Mogilev, or Vitebsk, not from Russia, 30 days per visit, with no cap on
 *    the number of visits and no yearly cap: the airport page states only
 *    "up to 30 days" and that the stay "can not be extended beyond the
 *    established 30 days". (A 90-days-per-calendar-year cap was applied here
 *    until 2026-10-23, when it was dropped because no MFA page states it for
 *    this scheme; see the rule-change log.)
 *
 * 3. Reclassified visa_required (`visaRequiredConditional()`): 11 nationals
 *    the source lists under its visa-free table, but only conditional on
 *    already holding a valid multiple-entry EU/Schengen visa bearing an
 *    EU/Schengen entry stamp, plus a return ticket from one of the same six
 *    airports. Per explicit product decision, a nationality that still has
 *    to obtain another jurisdiction's visa first is not meaningfully
 *    visa-free — these are modeled as `visa_required` with a note explaining
 *    why, rather than `entitled`.
 *
 * 4. Bilateral visa-free, no stated stay (`bilateralNoStatedLimit()`): 11
 *    nationalities the MFA's general visa-free page
 *    (BelarusSources.bilateral, right-hand column) lists as visa-free for
 *    foreign nationals entering Belarus, with no duration given: Armenia,
 *    Azerbaijan, Ecuador, Georgia, Kazakhstan, Kyrgyzstan, Moldova, Russia,
 *    Tajikistan, Ukraine, Uzbekistan. The limit lives in each bilateral
 *    agreement, not on the page. As in kosovo.ts and bosnia.ts, the
 *    standard 90-days-in-any-180 rolling window is applied as an
 *    assumption, and every entry carries a note saying so. (Russia's real
 *    regime under the Union State is broader; the assumption is
 *    conservative.)
 *
 * 5. Bilateral visa-free, stated stay (`bilateral()`): 22 nationalities the
 *    same page lists with a stay, modelled from the page's own wording.
 *    Any border, so this replaces the airport tier for Nicaragua and Oman.
 *    Vietnam is also on the airport list's conditional (EU-visa) footnote,
 *    but the bilateral page makes it visa-free for 30 days outright, so it
 *    is modelled here rather than in tier 3.
 *
 * Everything not explicitly listed defaults to `visa_required` — matching
 * every other region file's convention — cited to BelarusSources.general.
 *
 * ── Other data notes ─────────────────────────────────────────────────────────
 *
 * - Land-border entry may be possible for some European/bilateral-agreement
 *   nationals per the source, but the airport list is cited exclusively
 *   because it is the stable, easily-verified subset (explicit product
 *   decision) — noted on every airport-based entitlement rather than modeled.
 * - Belarus's own member state (BY) is encoded as free_movement — a
 *   Belarusian national needs no visa to enter Belarus.
 *
 * Last verified: 2026-10-23
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  FreeMovementRule,
  RuleNote,
  PerVisitLimit,
  CalendarPeriodLimit,
  RollingWindowLimit,
  StayLimit,
} from '@/types';
import { BelarusSources } from '@/data/sources';

const FREE_MOVEMENT: FreeMovementRule = { access: 'free_movement' };

// ─── Stay limits ──────────────────────────────────────────────────────────────

const BY_PER_VISIT_30: PerVisitLimit = { type: 'per_visit', value: 30, unit: 'days' };
const BY_CALENDAR_90: CalendarPeriodLimit = { type: 'calendar_period', days: 90, periodDays: 365 };
const BY_ROLLING_90_180: RollingWindowLimit = { type: 'rolling_window', days: 90, windowDays: 180 };

// ─── Shared notes ─────────────────────────────────────────────────────────────

const AIRPORT_NOTES: RuleNote[] = [
  {
    text: 'Visa-free entry is available only through Minsk National Airport or the airports at Brest, Gomel, Grodno, Mogilev, or Vitebsk. Some nationalities may also enter by land under bilateral agreements; check the Belarus MFA website for current land-border arrangements.',
    source: BelarusSources.airport,
  },
  {
    text: 'Visa-free entry through these airports is not available to travelers arriving directly from Russia.',
    source: BelarusSources.airport,
  },
];

// ─── Rule helpers ───────────────────────────────────────────────────────────

/**
 * Airport-only entitlement — 30 days per visit, unlimited visits, no yearly
 * cap (see file header). Always the fallback (no temporalWindows), so it's selected
 * unconditionally once no earlier, temporally-gated entitlement matches.
 */
function airportEntitlement(extraNotes: RuleNote[] = []) {
  return {
    limits: [BY_PER_VISIT_30] as [PerVisitLimit],
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
 *
 * The source caps this scheme at 90 days per calendar year in total ("The
 * total duration of visa-free stays must not exceed 90 days within a
 * calendar year"), so BY_CALENDAR_90 is stacked on the per-visit limit. The
 * airport-only fallback has no such cap.
 *
 * The European-override stacked limit uses the same `calendar_period` +
 * `per_visit` shape `turkiye.ts` uses for its Belarusian nationals;
 * `assessStay()` anchors the budget to 1 January–31 December of the entry
 * year and applies the more restrictive of the two. (Known gap in the
 * shared calculator: `destinationStatus.ts`'s region-level `per_visit`
 * branch ignores an accompanying `calendar_period` limit, so the header
 * "days remaining" chip shows only the per-visit cap. The per-trip panel
 * is unaffected.)
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
        limits: [{ type: 'per_visit', value: days, unit: 'days' }, BY_CALENDAR_90],
        source: BelarusSources.europe,
        notes: [
          {
            text: `Visa-free entry through any Belarusian border crossing point (not limited to the airports used by other nationalities), usable multiple times, for stays of up to ${days} days each, through 31 December 2026. This does not raise the combined 90-day-per-calendar-year cap on total time spent in Belarus.`,
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

/**
 * Visa-free under a bilateral agreement, with no stay stated by the MFA.
 * The 90/180 rolling window is an assumption (see file header, tier 4).
 */
function bilateralNoStatedLimit(): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [BY_ROLLING_90_180],
      source: BelarusSources.bilateral,
      notes: [{
        text: 'Visa-free under a bilateral agreement with Belarus, through any border crossing point. The Belarus MFA states no maximum stay for this nationality: the 90 days in any 180-day period shown here is an assumption, not a figure from the source. Check the agreement or with the Belarusian authorities before a long stay.',
        source: BelarusSources.bilateral,
      }],
    }],
  };
}

/**
 * Visa-free under a bilateral agreement, with the stay the MFA states.
 * `stay` is the page's wording for the note; `limits` encode it.
 */
function bilateral(stay: string, limits: [StayLimit, ...StayLimit[]]): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits,
      source: BelarusSources.bilateral,
      notes: [{
        text: `Visa-free under a bilateral agreement with Belarus, through any border crossing point: ${stay}.`,
        source: BelarusSources.bilateral,
      }],
    }],
  };
}

const perVisit = (days: number): PerVisitLimit => ({ type: 'per_visit', value: days, unit: 'days' });

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
  lastVerified: '2026-10-23',
  lastChanged: '2026-10-23',
  sourceUrl: BelarusSources.general.parent.url,
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── Belarusian citizens ─────────────────────────────────────────────────
    'BY': FREE_MOVEMENT,

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
    'EE': europeOverride(30), // Estonia
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
    'LV': europeOverride(90), // Latvia
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
    'NZ': airportOnly(), // New Zealand
    'PA': airportOnly(), // Panama
    'PE': airportOnly(), // Peru
    'SA': airportOnly(), // Saudi Arabia
    'SC': airportOnly(), // Seychelles
    'SG': airportOnly(), // Singapore
    'SV': airportOnly(), // El Salvador
    'UY': airportOnly(), // Uruguay
    'VC': airportOnly(), // Saint Vincent and the Grenadines
    'VU': airportOnly(), // Vanuatu

    // ── Bilateral visa-free, no stated stay (90/180 assumed) ─────────────────
    // Source: BelarusSources.bilateral, right-hand column. See header, tier 4.
    'AM': bilateralNoStatedLimit(), // Armenia
    'AZ': bilateralNoStatedLimit(), // Azerbaijan
    'EC': bilateralNoStatedLimit(), // Ecuador
    'GE': bilateralNoStatedLimit(), // Georgia
    'KG': bilateralNoStatedLimit(), // Kyrgyzstan
    'KZ': bilateralNoStatedLimit(), // Kazakhstan
    'MD': bilateralNoStatedLimit(), // Moldova
    'RU': bilateralNoStatedLimit(), // Russia
    'TJ': bilateralNoStatedLimit(), // Tajikistan
    'UA': bilateralNoStatedLimit(), // Ukraine
    'UZ': bilateralNoStatedLimit(), // Uzbekistan

    // ── Bilateral visa-free, stated stay ────────────────────────────────────
    // Source: BelarusSources.bilateral, right-hand column. See header, tier 5.
    'AL': bilateral('up to 30 days from the date of entry, and up to 90 days within the calendar year', [perVisit(30), BY_CALENDAR_90]), // Albania
    'AR': bilateral('up to 90 consecutive days from the date of first entry, within the calendar year', [BY_CALENDAR_90]), // Argentina
    'BR': bilateral('up to 90 days', [perVisit(90)]), // Brazil
    'CO': bilateral('up to 90 days', [perVisit(90)]), // Colombia
    'MN': bilateral('up to 90 days', [perVisit(90)]), // Mongolia
    'NI': bilateral('up to 90 days', [perVisit(90)]), // Nicaragua
    'VE': bilateral('up to 90 days', [perVisit(90)]), // Venezuela
    'IL': bilateral('up to 90 days in each period of 180 days', [BY_ROLLING_90_180]), // Israel
    'AE': bilateral('up to 90 days from the date of entry', [perVisit(90)]), // United Arab Emirates
    'CN': bilateral('30 days per visit, but no longer than 90 days within one calendar year', [perVisit(30), BY_CALENDAR_90]), // China
    'MO': bilateral('up to 30 days per visit, but no longer than 90 days within one calendar year', [perVisit(30), BY_CALENDAR_90]), // Macao
    'HK': bilateral('up to 30 days in each period of stay', [perVisit(30)]), // Hong Kong
    'CU': bilateral('up to 30 days', [perVisit(30)]), // Cuba
    'LA': bilateral('up to 30 days', [perVisit(30)]), // Laos
    'ME': bilateral('up to 30 days', [perVisit(30)]), // Montenegro
    'MM': bilateral('up to 30 days', [perVisit(30)]), // Myanmar
    'OM': bilateral('up to 30 days', [perVisit(30)]), // Oman
    'QA': bilateral('up to 30 days', [perVisit(30)]), // Qatar
    'KN': bilateral('up to 30 days', [perVisit(30)]), // Saint Kitts and Nevis
    'RS': bilateral('up to 30 days', [perVisit(30)]), // Serbia
    'TR': bilateral('up to 30 days', [perVisit(30)]), // Türkiye
    'VN': bilateral('up to 30 days', [perVisit(30)]), // Vietnam

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
