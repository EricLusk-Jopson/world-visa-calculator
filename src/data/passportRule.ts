/**
 * passportRule.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Abstract data structures for visa entitlement rules across all destinations.
 *
 * ── Design philosophy ────────────────────────────────────────────────────────
 *
 * All entry entitlements seen across Schengen, UK, Ireland, and Türkiye reduce
 * to three orthogonal concerns:
 *
 *   1. STAY LIMITS — what numerical constraint governs length of stay?
 *      Multiple limits may stack simultaneously (e.g. Belarus: 30 days per
 *      entry AND 90 days per calendar year). The effective allowance is the
 *      minimum across all active limits.
 *
 *   2. CONDITIONS — what preconditions must the traveller satisfy for an
 *      entitlement to apply? Evaluated per-entitlement; the first entitlement
 *      whose conditions all pass is the one that applies.
 *
 *   3. PRE-TRAVEL AUTHORISATION — must the traveller obtain something before
 *      arriving (ETA, e-Visa, ETIAS)? Orthogonal to the stay limit: the auth
 *      grants the right to board/arrive; the limit governs how long they may
 *      stay once admitted.
 *
 * ── Relationship to RegionRule ────────────────────────────────────────────────
 *
 * RegionRule (in regionRule.ts) describes the stay calculation model at the
 * destination level — rolling_window, per_visit, or officer_discretion.
 * PassportRule describes what a specific nationality is entitled to within
 * that destination. The two are complementary:
 *
 *   RegionRule  = "how does this destination calculate stays?"
 *   PassportRule = "what is this passport holder entitled to?"
 *
 * Most passportRules align with the RegionRule. Exceptions are encoded in the
 * passport rule's StayEntitlement (e.g. Indonesia nationals in Türkiye have a
 * per-entry limit stacked on top of the region's rolling window).
 *
 * ── Access model ─────────────────────────────────────────────────────────────
 *
 * Every PassportRule is one of three access types:
 *
 *   free_movement — unconditional unlimited stay. EU treaty rights, CTA, etc.
 *   visa_required — no automatic entitlement; embassy or officer decides.
 *   entitled      — has one or more conditional StayEntitlements.
 *
 * 'entitled' replaces the former visa_free category and makes conditions
 * explicit rather than encoding them as notes.
 *
 * ── Condition evaluation ─────────────────────────────────────────────────────
 *
 * EntitledRule.entitlements is an ordered list. Evaluation is:
 *
 *   for each entitlement (in order):
 *     if entitlement.conditions is absent → match (unconditional)
 *     if ALL conditions in the array pass → match
 *   if no entitlement matched → visa_required (implicit fallback)
 *
 * Conditions within a single entitlement are AND'd.
 * Multiple entitlements represent OR'd cases (e.g. under-15 OR over-65).
 * Unconditional entitlements should be placed last; they are the fallback
 * for all travellers not caught by a prior conditional entitlement.
 *
 * ── Stacking stay limits ─────────────────────────────────────────────────────
 *
 * StayEntitlement.limits is an array. ALL limits apply simultaneously.
 * The effective remaining allowance at any moment is the minimum across all.
 *
 * Patterns seen in the data:
 *   [rolling_window(90, 180)]                      Schengen, Türkiye standard
 *   [per_visit(180)]                               UK
 *   [per_visit(90)]                                Ireland
 *   [fixed_window_from_entry(90, 180)]             Türkiye: Albania, Jordan, etc.
 *   [per_visit(30), rolling_window(90, 180)]       Indonesia / Türkiye
 *   [per_visit(30), calendar_period(90, 365)]      Belarus / Türkiye
 *
 * Last updated: 2026-05-27
 */

import type { SourceDoc } from '@/types';

// ─── Shared ───────────────────────────────────────────────────────────────────

export type RuleNote = {
  text: string;
  /** Optional — default/descriptive notes may not cite a specific document. */
  source?: SourceDoc;
};

// ─── Stay limits ─────────────────────────────────────────────────────────────

/**
 * Per-visit limit.
 * The clock resets on each departure and re-entry. Each visit is assessed
 * independently. Repeated visits may attract officer scrutiny at some
 * destinations even when each individual visit is within the limit.
 *
 * Examples: UK (180 days), Ireland (90 days), Türkiye e-visa (30 or 90 days)
 */
export type PerVisitLimit = {
  readonly type: 'per_visit';
  days: number;
};

/**
 * Rolling window limit.
 * At any moment, the total days spent in the destination during the past
 * `windowDays` days must not exceed `days`. Past visits count until they
 * age out of the window.
 *
 * Examples: Schengen (90/180), Türkiye standard (90/180)
 */
export type RollingWindowLimit = {
  readonly type: 'rolling_window';
  days: number;
  windowDays: number;
};

/**
 * Fixed window from first entry.
 * The allowance is measured from the date of first entry into the destination
 * within a given trip, not as a continuously rolling window. The window
 * resets on re-entry (each new entry starts a fresh period).
 *
 * Calculator interpretation: the total days across all entries since the
 * most recent fresh entry must not exceed `days`, AND the elapsed time
 * since that first entry must not exceed `windowDays`.
 *
 * Examples: Türkiye — Albania, Estonia, Jordan, Kosovo, Lebanon, Montenegro,
 *           Paraguay, Qatar, Serbia (90 days within 6 months from first entry)
 */
export type FixedWindowFromEntryLimit = {
  readonly type: 'fixed_window_from_entry';
  days: number;
  windowDays: number; // typically 180 (≈ 6 months)
};

/**
 * Calendar period limit.
 * The total days within a fixed calendar period (typically 1 year) must
 * not exceed `days`. Unlike rolling_window, the window is not continuous —
 * it resets at the start of each calendar year (or other period).
 *
 * Example: Türkiye — Belarus (30 days per entry, max 90 days per calendar year)
 */
export type CalendarPeriodLimit = {
  readonly type: 'calendar_period';
  days: number;
  periodDays: number; // typically 365
};

/** Union of all stay limit types. */
export type StayLimit =
  | PerVisitLimit
  | RollingWindowLimit
  | FixedWindowFromEntryLimit
  | CalendarPeriodLimit;

// ─── Pre-travel authorisation ─────────────────────────────────────────────────

/**
 * A pre-travel electronic authorisation that must be obtained before arrival.
 * Distinct from a visa: it does not grant entry but is a precondition for
 * boarding a carrier or presenting at the border.
 *
 * The authorisation grants the right to travel to the destination; the
 * StayEntitlement's limits govern how long the traveller may stay once admitted.
 */
export type PreTravelAuth = {
  /**
   * Canonical type identifier.
   *
   *   ETA              UK Electronic Travel Authorisation (£20, 2 years, multi-entry)
   *   ETIAS            EU/Schengen travel authorisation (€7, 3 years, not yet launched)
   *   e_visa           Türkiye e-Visa, unconditional (paid, per-trip, tourism/commerce)
   *   e_visa_conditional  Türkiye e-Visa, requires existing Schengen/US/UK/IE visa or RP
   *   BIVS             Ireland British-Irish Visa Scheme (requires UK visa endorsed BIVS)
   *   SSVWP            Ireland Short Stay Visa Waiver Programme (requires UK short-stay visa)
   */
  type: 'ETA' | 'ETIAS' | 'e_visa' | 'e_visa_conditional' | 'BIVS' | 'SSVWP';
  /** Human-readable display name. */
  name: string;
  /** Application URL. */
  applicationUrl: string;
  /** Approximate cost in the destination's or issuing country's currency. */
  cost?: { amount: number; currency: string };
  /**
   * How long the authorisation itself is valid (not the stay duration).
   * null = trip-specific (e.g. Türkiye e-Visa is issued for a specific trip).
   */
  authValidityDays: number | null;
  /** Whether the authorisation allows multiple entries within its validity. */
  multiEntry: boolean;
  notes?: RuleNote[];
};

// ─── Conditions ───────────────────────────────────────────────────────────────

/**
 * Traveller holds a valid, unexpired visa or residence permit for one of
 * the listed destinations.
 *
 * Examples:
 *   Türkiye conditional e-Visa: holds Schengen/US/UK/IE visa or RP
 *   Ireland SSVWP: holds UK short-stay visa
 *   Ireland BIVS: holds UK visa endorsed 'BIVS'
 */
export type HoldsVisaForCondition = {
  readonly type: 'holds_visa_for';
  /**
   * ISO Alpha-2 country codes OR the special value 'schengen_member' to
   * represent any Schengen Area member state.
   */
  destinations: Array<string | 'schengen_member'>;
  /** Human-readable description, used in UI and notes. */
  description: string;
};

/**
 * Traveller is within a specific age range (inclusive bounds).
 * Both min and max are optional; omit to leave one end unbounded.
 *
 * Examples:
 *   Algeria / Türkiye: under-15 and over-65 visa-free; 15–35 visa required
 *   Egypt / Türkiye: under-15 and over-45 unconditional e-Visa; 15–45 conditional
 */
export type AgeRangeCondition = {
  readonly type: 'age_range';
  min?: number; // inclusive
  max?: number; // inclusive
  /** Human-readable description for UI display. */
  description: string;
};

/**
 * The entry is restricted to specified purposes.
 * Used where visa-free access is narrower than the full range of permitted
 * activities.
 *
 * Examples:
 *   UK ordinary passport: tourism and transit only (not work/study)
 *   Türkiye e-Visa: tourism and commerce only
 */
export type PurposeCondition = {
  readonly type: 'purpose';
  allowed: ReadonlyArray<'tourism' | 'commerce' | 'transit' | 'business'>;
};

/**
 * The entitlement applies only to biometric passports issued to ICAO standards.
 *
 * Examples:
 *   Schengen Annex II footnotes: Albania, Moldova, Serbia, Ukraine, Georgia, Kosovo
 */
export type BiometricPassportCondition = {
  readonly type: 'biometric_passport';
};

/**
 * Entry under this entitlement is only permitted via specified port types.
 *
 * Example:
 *   Türkiye conditional e-Visa: airport entry only, not land border crossings
 */
export type EntryPortCondition = {
  readonly type: 'entry_port';
  allowed: ReadonlyArray<'airport' | 'seaport' | 'land_border'>;
};

/**
 * Entry under this entitlement is only available when travelling on a
 * carrier from the listed airlines.
 *
 * Example:
 *   Egypt / Türkiye conditional e-Visa (ages 15–45): must travel on Turkish
 *   Airlines, AJet, Pegasus, EgyptAir, or Air Cairo.
 */
export type CarrierCondition = {
  readonly type: 'carrier';
  /** IATA carrier codes or common names. */
  airlines: string[];
  description: string;
};

/**
 * The entitlement applies only to a specific document variant identified
 * by a string marker present in the travel document.
 *
 * Examples:
 *   Türkiye: Hong Kong SAR passport (not BNO); Taiwan passport including
 *     national identity card number; Schengen: Serbia Coordination Directorate
 *     passports excluded.
 */
export type PassportIdentifierCondition = {
  readonly type: 'passport_identifier';
  description: string;
};

/** Union of all condition types. */
export type EntitlementCondition =
  | HoldsVisaForCondition
  | AgeRangeCondition
  | PurposeCondition
  | BiometricPassportCondition
  | EntryPortCondition
  | CarrierCondition
  | PassportIdentifierCondition;

// ─── Stay entitlement ─────────────────────────────────────────────────────────

/**
 * A single entitlement rule: what stay is allowed, under what conditions,
 * with what pre-travel authorisation.
 *
 * An entitlement applies when ALL its conditions pass (AND logic).
 * Multiple entitlements within an EntitledRule represent OR'd cases.
 */
export type StayEntitlement = {
  /**
   * All limits apply simultaneously. The effective remaining allowance at
   * any moment is the minimum across all active limits.
   *
   * Must contain at least one limit (enforced by non-empty tuple type).
   */
  limits: [StayLimit, ...StayLimit[]];

  /**
   * Conditions ALL of which must pass for this entitlement to apply.
   * Absent or empty = unconditional (applies to all holders of this passport).
   */
  conditions?: EntitlementCondition[];

  /**
   * Pre-travel authorisation required before this entitlement is usable.
   * Absent = no pre-travel auth needed (traveller may arrive directly).
   */
  preAuth?: PreTravelAuth;

  notes?: RuleNote[];
};

// ─── Passport rule ────────────────────────────────────────────────────────────

/** No limit. No visa. No time restriction. */
export type FreeMovementRule = {
  readonly access: 'free_movement';
  notes?: RuleNote[];
};

/**
 * No automatic entitlement. Entry subject to embassy visa in advance or
 * immigration officer discretion at the border.
 */
export type VisaRequiredRule = {
  readonly access: 'visa_required';
  notes?: RuleNote[];
};

/**
 * The passport holder has a defined entitlement, potentially conditional.
 *
 * Evaluation order:
 *   1. Test entitlements in array order.
 *   2. First entitlement whose conditions ALL pass is applied.
 *   3. If no entitlement matches → implicit visa_required fallback.
 *
 * Unconditional entitlements (no conditions field) should be placed LAST;
 * they act as the catch-all for any holder not matched by prior conditions.
 */
export type EntitledRule = {
  readonly access: 'entitled';
  entitlements: [StayEntitlement, ...StayEntitlement[]];
  notes?: RuleNote[];
};

/** Discriminated union covering all passport rule types. */
export type PassportRule = FreeMovementRule | VisaRequiredRule | EntitledRule;

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isFreeMovement(rule: PassportRule): rule is FreeMovementRule {
  return rule.access === 'free_movement';
}

export function isVisaRequired(rule: PassportRule): rule is VisaRequiredRule {
  return rule.access === 'visa_required';
}

export function isEntitled(rule: PassportRule): rule is EntitledRule {
  return rule.access === 'entitled';
}

export function isRollingWindowLimit(limit: StayLimit): limit is RollingWindowLimit {
  return limit.type === 'rolling_window';
}

export function isPerVisitLimit(limit: StayLimit): limit is PerVisitLimit {
  return limit.type === 'per_visit';
}

export function isFixedWindowFromEntryLimit(limit: StayLimit): limit is FixedWindowFromEntryLimit {
  return limit.type === 'fixed_window_from_entry';
}

export function isCalendarPeriodLimit(limit: StayLimit): limit is CalendarPeriodLimit {
  return limit.type === 'calendar_period';
}

// ─── Usage examples ───────────────────────────────────────────────────────────
//
// The following show how each pattern encountered in the data would be
// expressed using these types. These are illustrative, not executable.
//
// ─── 1. Schengen standard — rolling window, ETIAS pre-auth ───────────────────
//
// const ETIAS: PreTravelAuth = {
//   type: 'ETIAS',
//   name: 'European Travel Information and Authorisation System',
//   applicationUrl: 'https://travel-europe.europa.eu/etias_en',
//   cost: { amount: 7, currency: 'EUR' },
//   authValidityDays: 1095, // 3 years
//   multiEntry: true,
// };
//
// 'CA': {
//   access: 'entitled',
//   entitlements: [{
//     limits: [{ type: 'rolling_window', days: 90, windowDays: 180 }],
//     preAuth: ETIAS,
//   }],
// }
//
// ─── 2. UK — per-visit, ETA, touristic-purpose condition ─────────────────────
//
// const UK_ETA: PreTravelAuth = {
//   type: 'ETA',
//   name: 'UK Electronic Travel Authorisation',
//   applicationUrl: 'https://www.gov.uk/apply-for-an-electronic-travel-authorisation-eta',
//   cost: { amount: 20, currency: 'GBP' },
//   authValidityDays: 730, // 2 years or passport expiry, whichever sooner
//   multiEntry: true,
// };
//
// 'CA': {    // from uk.ts
//   access: 'entitled',
//   entitlements: [{
//     limits: [{ type: 'per_visit', days: 180 }],
//     preAuth: UK_ETA,
//     conditions: [{
//       type: 'purpose',
//       allowed: ['tourism', 'commerce', 'transit', 'business'],
//     }],
//   }],
// }
//
// ─── 3. Stacked limits — Belarus / Türkiye ────────────────────────────────────
//
// 'BY': {    // from turkiye.ts
//   access: 'entitled',
//   entitlements: [{
//     limits: [
//       { type: 'per_visit',       days: 30  },
//       { type: 'calendar_period', days: 90, periodDays: 365 },
//     ],
//     notes: [{
//       text: 'The 30-day per-entry limit and the 90-days-per-calendar-year ' +
//             'limit apply simultaneously. The effective allowance is the ' +
//             'minimum of the two at any moment.',
//     }],
//   }],
// }
//
// ─── 4. Stacked limits — Indonesia / Türkiye ──────────────────────────────────
//
// 'ID': {    // from turkiye.ts
//   access: 'entitled',
//   entitlements: [{
//     limits: [
//       { type: 'per_visit',      days: 30,  windowDays: undefined },
//       { type: 'rolling_window', days: 90,  windowDays: 180 },
//     ],
//   }],
// }
//
// ─── 5. Fixed window from first entry — Albania / Türkiye ────────────────────
//
// 'AL': {    // from turkiye.ts
//   access: 'entitled',
//   entitlements: [{
//     limits: [{ type: 'fixed_window_from_entry', days: 90, windowDays: 180 }],
//   }],
// }
//
// ─── 6. Conditional entitlements — Algeria / Türkiye (age-based) ─────────────
//
// 'DZ': {    // from turkiye.ts
//   access: 'entitled',
//   entitlements: [
//     {
//       // Under 15: visa-free, no conditions
//       conditions: [{ type: 'age_range', max: 14, description: 'Under 15' }],
//       limits: [{ type: 'rolling_window', days: 90, windowDays: 180 }],
//     },
//     {
//       // Over 65: visa-free, no conditions
//       conditions: [{ type: 'age_range', min: 66, description: 'Over 65' }],
//       limits: [{ type: 'rolling_window', days: 90, windowDays: 180 }],
//     },
//     {
//       // 15–18 and 35–65: conditional e-Visa
//       conditions: [
//         { type: 'age_range', min: 15, max: 18, description: 'Ages 15–18' },
//         {
//           type: 'holds_visa_for',
//           destinations: ['schengen_member', 'US', 'GB', 'IE'],
//           description: 'Valid Schengen/US/UK/IE visa or residence permit',
//         },
//       ],
//       limits: [{ type: 'per_visit', days: 30 }],
//       preAuth: TURKIYE_EVISA_CONDITIONAL,
//     },
//     {
//       // 35–65 with Schengen/US/UK/IE visa: also conditional e-Visa
//       conditions: [
//         { type: 'age_range', min: 35, max: 65, description: 'Ages 35–65' },
//         {
//           type: 'holds_visa_for',
//           destinations: ['schengen_member', 'US', 'GB', 'IE'],
//           description: 'Valid Schengen/US/UK/IE visa or residence permit',
//         },
//       ],
//       limits: [{ type: 'per_visit', days: 30 }],
//       preAuth: TURKIYE_EVISA_CONDITIONAL,
//     },
//     // Ages 18–35: no entitlement matches → implicit visa_required fallback
//   ],
// }
//
// ─── 7. Ireland SSVWP — visa_required with conditional pre-auth option ────────
//
// 'BA': {    // Bosnia from ireland.ts
//   access: 'visa_required',
//   notes: [{
//     text:
//       'Exception: holders of a valid UK short-stay visa may enter Ireland ' +
//       'without a separate Irish visa under the Short Stay Visa Waiver ' +
//       'Programme (SSVWP).',
//   }],
// }
//
// --- Note on SSVWP / BIVS encoding ---
// These Irish schemes sit in an awkward middle ground: the passport holder is
// visa_required, but a secondary condition (holding a UK visa) unlocks an
// informal waiver. Two valid approaches:
//
// A) Keep as visa_required + note (current approach — simpler, conservative).
// B) Encode as entitled with a conditional entitlement that has holds_visa_for
//    as a condition. This allows the calculator to ask "do you have a UK visa?"
//    and surface the appropriate rule.
//
// Option B is more expressive and enables future UI prompting. Recommended
// when building the trip validator.
//
