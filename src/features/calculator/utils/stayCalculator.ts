/**
 * Generic stay calculator driven by StayLimit enum values.
 *
 * Supports all four limit types — per_visit, rolling_window,
 * fixed_window_from_entry, and calendar_period. When a traveler's entitlement
 * carries multiple simultaneous limits, all apply; the most restrictive result
 * (lowest daysRemaining) is returned.
 *
 * Re-entry risk uses proportional thresholds so the same logic works
 * for any per-visit allowance (UK 6 months, Ireland 90 days, etc.).
 */

import type {
  StayLimit,
  PerVisitLimit,
  FixedWindowFromEntryLimit,
  CalendarPeriodLimit,
  StayUnit,
  RegionRule,
  PassportRule,
  EntitledRule,
  StayEntitlement,
  TemporalWindow,
  Trip,
} from "@/types";
import { VisaRegion } from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import {
  parseDate,
  formatDate,
  today,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  countTripDays,
  countDaysInWindow,
  differenceInCalendarDays,
} from "./dates";
import { createRollingWindowCalculator } from "./rollingWindowCalculator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StayVariant = "safe" | "caution" | "danger";

export interface StayAssessment {
  limitType: StayLimit["type"];
  /** Approximate allowance in days — used for threshold maths and overage display. */
  daysAllowed: number;
  /** Human adjective form of the allowance, e.g. "6-month", "90-day". */
  limitLabel: string;
  tripDays: number;
  /** Days between checkDate and maxExitDate. Negative = over the limit. */
  daysRemaining: number;
  maxExitDate: string;
  variant: StayVariant;
}

export interface ReentryRisk {
  lastTripDays: number;
  daysSinceExit: number;
  variant: "danger" | "caution" | "safe";
}

export interface TripStayInfo {
  stayVariant: StayVariant;
  daysRemaining: number;
  reentryVariant?: ReentryRisk["variant"];
}

// ─── Unit helpers ─────────────────────────────────────────────────────────────

const UNIT_SINGULAR: Record<StayUnit, string> = {
  days: "day",
  weeks: "week",
  months: "month",
  years: "year",
};

const APPROX_DAYS_PER_UNIT: Record<StayUnit, number> = {
  days: 1,
  weeks: 7,
  months: 30,
  years: 365,
};

/** Approximate a per-visit allowance in days, for thresholds and overage maths. */
export function perVisitApproxDays(limit: PerVisitLimit): number {
  return limit.value * APPROX_DAYS_PER_UNIT[limit.unit];
}

/** Human adjective form of a per-visit allowance, e.g. "6-month", "90-day". */
export function perVisitLimitLabel(limit: PerVisitLimit): string {
  return `${limit.value}-${UNIT_SINGULAR[limit.unit]}`;
}

/**
 * Last legal day of presence for a per-visit allowance entered on `entry`.
 *
 * days/weeks are counted (inclusive: a 90-day permission expires on entry+89);
 * months/years are calendar-anchored (a 6-month visit entered Jan 15 expires Jul 15).
 */
function perVisitMaxExit(limit: PerVisitLimit, entry: Date): Date {
  switch (limit.unit) {
    case "days":
      return addDays(entry, limit.value - 1);
    case "weeks":
      return addDays(addWeeks(entry, limit.value), -1);
    case "months":
      return addMonths(entry, limit.value);
    case "years":
      return addYears(entry, limit.value);
  }
}

function cautionThreshold(daysAllowed: number): number {
  return Math.floor(daysAllowed * (5 / 6));
}

// ─── Limit resolution ─────────────────────────────────────────────────────────

/**
 * Convert a RegionRule to the equivalent StayLimit array.
 * Returns null for officer_discretion rules (no calculable limit).
 */
export function regionRuleToLimits(
  rule: RegionRule,
): [StayLimit, ...StayLimit[]] | null {
  if (rule.type === "per_visit")
    return [{ type: "per_visit", value: rule.allowanceDays, unit: "days" }];
  if (rule.type === "rolling_window")
    return [{ type: "rolling_window", days: rule.allowanceDays, windowDays: rule.windowDays }];
  if (rule.type === "fixed_window_from_entry")
    return [{ type: "fixed_window_from_entry", days: rule.allowanceDays, windowDays: rule.windowDays }];
  return null;
}

// ─── Temporal windows ─────────────────────────────────────────────────────────

/**
 * "Very old" sentinel used as a TemporalWindow's effective start when the
 * source never states one and it's the first window on record for that
 * entitlement — see TemporalWindow in @/types. Deliberately far enough in
 * the past that no realistic itinerary could predate it, so a window with
 * no stated start behaves as "always has been in effect", never as
 * "started whenever we happened to check the source" (that placeholder-date
 * bug is exactly what this sentinel replaces).
 */
const UNKNOWN_START = parseDate("1900-01-01");

/**
 * The effective [start, end] range of `windows[index]`.
 *
 * `end` is always `validUntil`. `start` is `validFrom` when stated;
 * otherwise it chains from the *previous* window in the array — the day
 * after that window's `validUntil` — so appending a newly-announced
 * renewal never requires editing earlier entries. The first window on
 * record, if it has no stated `validFrom`, is treated as unbounded in the
 * past (UNKNOWN_START), not "today".
 */
export function effectiveWindowRange(
  windows: readonly TemporalWindow[],
  index: number,
): { start: Date; end: Date } {
  const end = parseDate(windows[index].validUntil);
  const start = windows[index].validFrom
    ? parseDate(windows[index].validFrom)
    : index > 0
      ? addDays(parseDate(windows[index - 1].validUntil), 1)
      : UNKNOWN_START;
  return { start, end };
}

/** The TemporalWindow (if any) in `windows` whose effective range contains `date`. */
function windowContaining(
  windows: readonly TemporalWindow[],
  date: Date,
): TemporalWindow | undefined {
  return windows.find((_, i) => {
    const { start, end } = effectiveWindowRange(windows, i);
    return date >= start && date <= end;
  });
}

// ─── Entitlement selection ─────────────────────────────────────────────────────

export interface EntitlementSelection {
  selected: StayEntitlement;
  /** True when `selected` isn't the rule's unconditional/first-listed entitlement. */
  isOverride: boolean;
  /** The entitlement that would apply outside every temporal window on `selected` — for display. */
  baseEntitlement?: StayEntitlement;
  /** The specific TemporalWindow that matched, when `selected.temporalWindows` is set. */
  activeWindow?: TemporalWindow;
}

/**
 * Select which of an EntitledRule's (possibly several, OR'd) entitlements
 * applies for a trip entering on `entryDate`.
 *
 * Only `temporalWindows` are evaluated here — it's the one gating mechanism
 * that's mechanically computable from the trip alone (no traveller
 * self-report needed). Every other condition type is treated as passing,
 * matching prior behavior (conditions were previously never evaluated at
 * all; this narrows that gap to just temporal windows, not closes it
 * entirely).
 *
 * Returns null when no entitlement's temporal windows contain `entryDate` —
 * the caller should fall back to visa_required (e.g. a seasonal-only waiver
 * outside every window on record, with no unconditional fallback entitlement).
 */
export function selectEntitlement(
  rule: EntitledRule,
  entryDate: string,
): EntitlementSelection | null {
  const entry = parseDate(entryDate);

  const baseEntitlement = rule.entitlements.find((e) => !e.temporalWindows);

  for (const entitlement of rule.entitlements) {
    if (!entitlement.temporalWindows) {
      return { selected: entitlement, isOverride: false };
    }
    const activeWindow = windowContaining(entitlement.temporalWindows, entry);
    if (activeWindow) {
      return {
        selected: entitlement,
        isOverride: true,
        activeWindow,
        ...(baseEntitlement && baseEntitlement !== entitlement ? { baseEntitlement } : {}),
      };
    }
  }

  return null;
}

/**
 * Resolve the stay limits that apply to a traveler for a region on a given
 * entry date.
 *
 * - entitled passport → the selected entitlement's own limits (respects
 *   per-passport allowances, their units, and any active temporal window).
 *   Falls back to null (visa_required-equivalent, no calculable limit) when
 *   no entitlement's temporal windows contain the entry date.
 * - no passport set → the region's default rule limits (permissive default,
 *   mirroring how eligibility is treated elsewhere).
 * - free_movement / visa_required → null (no calculable per-visit cap).
 */
export function resolveStayLimits(
  passportCode: string | null,
  rule: PassportRule,
  regionRule: RegionRule | null,
  entryDate?: string,
): [StayLimit, ...StayLimit[]] | null {
  if (rule.access === "entitled") {
    if (!entryDate) return rule.entitlements[0].limits;
    return selectEntitlement(rule, entryDate)?.selected.limits ?? null;
  }
  if (!passportCode && regionRule) return regionRuleToLimits(regionRule);
  return null;
}

// ─── Per-limit assessors ──────────────────────────────────────────────────────

function assessPerVisit(
  limit: PerVisitLimit,
  entryDate: string,
  checkDate?: string,
): StayAssessment {
  const entry = parseDate(entryDate);
  const check = checkDate ? parseDate(checkDate) : today();
  const maxExit = perVisitMaxExit(limit, entry);
  const daysAllowed = perVisitApproxDays(limit);
  const tripDays = countTripDays(entry, check);
  const daysRemaining = differenceInCalendarDays(maxExit, check);

  let variant: StayVariant;
  if (daysRemaining < 0) variant = "danger";
  else if (tripDays >= cautionThreshold(daysAllowed)) variant = "caution";
  else variant = "safe";

  return {
    limitType: "per_visit",
    daysAllowed,
    limitLabel: `${limit.value}-${UNIT_SINGULAR[limit.unit]}`,
    tripDays,
    daysRemaining,
    maxExitDate: formatDate(maxExit),
    variant,
  };
}

function assessRollingWindow(
  limit: { days: number; windowDays: number },
  historicalTrips: Trip[],
  entryDate: string,
  checkDate?: string,
): StayAssessment {
  const { calculateMaxStay } = createRollingWindowCalculator({
    maxDays: limit.days,
    windowSize: limit.windowDays,
  });

  const maxStay = calculateMaxStay(entryDate, historicalTrips);
  const limitLabel = `${limit.days}-day`;

  if (!maxStay.canEnter) {
    return {
      limitType: "rolling_window",
      daysAllowed: limit.days,
      limitLabel,
      tripDays: 0,
      daysRemaining: 0,
      maxExitDate: entryDate,
      variant: "danger",
    };
  }

  const entry = parseDate(entryDate);
  const check = checkDate ? parseDate(checkDate) : today();
  const tripDays = countTripDays(entry, check);
  const daysRemaining = maxStay.maxDays - tripDays;

  let variant: StayVariant;
  if (daysRemaining < 0) variant = "danger";
  else if (tripDays >= cautionThreshold(limit.days)) variant = "caution";
  else variant = "safe";

  return {
    limitType: "rolling_window",
    daysAllowed: limit.days,
    limitLabel,
    tripDays,
    daysRemaining,
    maxExitDate: maxStay.maxExitDate!,
    variant,
  };
}

function minDate(a: Date, b: Date): Date {
  return a < b ? a : b;
}

/**
 * Shared assessor for the two "fixed budget inside a fixed window" limit types.
 * Within [windowStart, windowEnd], total presence must not exceed `days`. Unlike
 * a rolling window, days do not age out during the trip — the window is fixed.
 */
export function assessBudgetWindow(
  limitType: StayLimit["type"],
  days: number,
  windowStart: Date,
  windowEnd: Date,
  historicalTrips: Trip[],
  entryDate: string,
  checkDate?: string,
): StayAssessment {
  const entry = parseDate(entryDate);
  const check = checkDate ? parseDate(checkDate) : today();
  const priorCutoff = addDays(entry, -1);

  // Days already spent inside the window by completed trips, before this entry.
  let usedBefore = 0;
  for (const t of historicalTrips) {
    const tEntry = parseDate(t.entryDate);
    const tExit = t.exitDate ? parseDate(t.exitDate) : check;
    usedBefore += countDaysInWindow(
      tEntry,
      tExit,
      windowStart,
      minDate(windowEnd, priorCutoff),
    );
  }

  const remainingBudget = Math.max(0, days - usedBefore);
  const tripDays = countTripDays(entry, check);

  // Max exit is bounded by the remaining budget and the window's end.
  const budgetExit = addDays(entry, remainingBudget - 1);
  const maxExit = minDate(budgetExit, windowEnd);
  const daysRemaining = differenceInCalendarDays(maxExit, check);

  let variant: StayVariant;
  if (remainingBudget <= 0 || daysRemaining < 0) variant = "danger";
  else if (tripDays >= cautionThreshold(days)) variant = "caution";
  else variant = "safe";

  return {
    limitType,
    daysAllowed: days,
    limitLabel: `${days}-day`,
    tripDays,
    daysRemaining,
    maxExitDate: formatDate(maxExit),
    variant,
  };
}

/**
 * Fixed window anchored to first entry (e.g. Türkiye 90-in-180 from entry).
 * The window resets once a fresh entry falls `windowDays` or more after the
 * current anchor; consecutive trips inside the window share the day budget.
 */
function assessFixedWindow(
  limit: FixedWindowFromEntryLimit,
  historicalTrips: Trip[],
  entryDate: string,
  checkDate?: string,
): StayAssessment {
  const entries = historicalTrips
    .filter((t) => t.entryDate < entryDate)
    .map((t) => t.entryDate)
    .concat(entryDate)
    .sort();

  let anchor = entries[0];
  for (const e of entries) {
    if (differenceInCalendarDays(parseDate(e), parseDate(anchor)) >= limit.windowDays) {
      anchor = e;
    }
  }

  const windowStart = parseDate(anchor);
  const windowEnd = addDays(windowStart, limit.windowDays - 1);
  return assessBudgetWindow(
    "fixed_window_from_entry",
    limit.days,
    windowStart,
    windowEnd,
    historicalTrips,
    entryDate,
    checkDate,
  );
}

/**
 * Calendar-period limit (e.g. Türkiye Belarus: 90 days per calendar year).
 * The budget resets on 1 January. Max exit is capped at year-end; a trip that
 * spans into January draws on the next year's fresh budget, which the more
 * restrictive per-visit cap that always accompanies this limit governs.
 */
function assessCalendarPeriod(
  limit: CalendarPeriodLimit,
  historicalTrips: Trip[],
  entryDate: string,
  checkDate?: string,
): StayAssessment {
  const year = parseDate(entryDate).getFullYear();
  const windowStart = new Date(year, 0, 1);
  const windowEnd = new Date(year, 11, 31);
  return assessBudgetWindow(
    "calendar_period",
    limit.days,
    windowStart,
    windowEnd,
    historicalTrips,
    entryDate,
    checkDate,
  );
}

export interface FixedWindowStatus {
  windowStart: string;
  windowEnd: string;
  /** Days used within the current window, up to and including refDate. */
  daysUsed: number;
  daysRemaining: number;
  /** Longest new stay startable on refDate, 0 if none. */
  maxStay: number;
  canEnter: boolean;
}

/**
 * Fixed-window-from-entry status "as of" a reference date, independent of
 * whether a trip is ongoing on that date — mirrors
 * createRollingWindowCalculator's getDaysUsedOnDate/calculateMaxStay pair,
 * but for the non-rolling, entry-anchored window (e.g. Montenegro's 90 days
 * within 180 days of first entry). Used by destinationStatus.ts for the
 * region-level allowance chip.
 */
export function computeFixedWindowStatus(
  limit: { days: number; windowDays: number },
  regionTrips: Trip[],
  refDate: string,
): FixedWindowStatus {
  const entries = regionTrips
    .filter((t) => t.entryDate < refDate)
    .map((t) => t.entryDate)
    .concat(refDate)
    .sort();

  let anchor = entries[0];
  for (const e of entries) {
    if (differenceInCalendarDays(parseDate(e), parseDate(anchor)) >= limit.windowDays) {
      anchor = e;
    }
  }

  const windowStart = parseDate(anchor);
  const windowEnd = addDays(windowStart, limit.windowDays - 1);
  const ref = parseDate(refDate);

  const daysUsed = regionTrips.reduce((sum, t) => {
    const tEntry = parseDate(t.entryDate);
    const tExit = t.exitDate ? parseDate(t.exitDate) : ref;
    return sum + countDaysInWindow(tEntry, tExit, windowStart, minDate(windowEnd, ref));
  }, 0);

  const daysRemaining = Math.max(0, limit.days - daysUsed);
  const canEnter = daysRemaining > 0 && ref <= windowEnd;
  const maxExit = minDate(addDays(ref, daysRemaining - 1), windowEnd);
  const maxStay = canEnter ? differenceInCalendarDays(maxExit, ref) + 1 : 0;

  return {
    windowStart: formatDate(windowStart),
    windowEnd: formatDate(windowEnd),
    daysUsed,
    daysRemaining,
    maxStay,
    canEnter,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Assess a traveler's stay against a list of limits (all apply simultaneously).
 * Returns the most restrictive (lowest daysRemaining) result across all limits.
 * Returns null if no supported limit types are present.
 */
export function assessStay(
  limits: [StayLimit, ...StayLimit[]],
  historicalTrips: Trip[],
  entryDate: string,
  checkDate?: string,
): StayAssessment | null {
  const results: StayAssessment[] = [];

  for (const limit of limits) {
    if (limit.type === "per_visit") {
      results.push(assessPerVisit(limit, entryDate, checkDate));
    } else if (limit.type === "rolling_window") {
      results.push(assessRollingWindow(limit, historicalTrips, entryDate, checkDate));
    } else if (limit.type === "fixed_window_from_entry") {
      results.push(assessFixedWindow(limit, historicalTrips, entryDate, checkDate));
    } else if (limit.type === "calendar_period") {
      results.push(assessCalendarPeriod(limit, historicalTrips, entryDate, checkDate));
    }
  }

  if (results.length === 0) return null;
  return results.reduce((worst, a) =>
    a.daysRemaining < worst.daysRemaining ? a : worst,
  );
}

/**
 * Detect re-entry risk for per-visit regions.
 * Triggered when the most recent completed trip lasted ≥ 5/6 × allowanceDays.
 * Cooldown thresholds: danger < 0.75×, caution < 1.5×, safe < 2.0× (of allowanceDays).
 */
export function detectReentryRisk(
  allowanceDays: number,
  completedTrips: Trip[],
  proposedEntryDate: string,
): ReentryRisk | null {
  const caution = cautionThreshold(allowanceDays);
  const dangerCooldown = Math.floor(allowanceDays * 0.75);
  const cautionCooldown = Math.floor(allowanceDays * 1.5);
  const safeCooldown = Math.floor(allowanceDays * 2.0);

  const pastTrips = completedTrips
    .filter((t) => t.exitDate && t.exitDate < proposedEntryDate)
    .sort((a, b) => (a.exitDate! > b.exitDate! ? -1 : 1));

  if (pastTrips.length === 0) return null;

  const last = pastTrips[0];
  const lastTripDays = countTripDays(
    parseDate(last.entryDate),
    parseDate(last.exitDate!),
  );

  if (lastTripDays < caution) return null;

  const daysSinceExit = differenceInCalendarDays(
    parseDate(proposedEntryDate),
    parseDate(last.exitDate!),
  );

  let variant: "danger" | "caution" | "safe";
  if (daysSinceExit < dangerCooldown) variant = "danger";
  else if (daysSinceExit < cautionCooldown) variant = "caution";
  else if (daysSinceExit < safeCooldown) variant = "safe";
  else return null;

  return { lastTripDays, daysSinceExit, variant };
}

/**
 * High-level convenience: assess a single trip's stay and re-entry risk for any
 * region, resolving the traveler's applicable limits from their passport rule.
 * Returns null when the traveler is not eligible / no calculable limit applies.
 *
 * Used by the timeline and card views to render per-trip stay chips.
 */
export function assessRegionTripStay(
  region: VisaRegion,
  passportCode: string | null,
  trip: Trip,
  travelerTrips: Trip[],
): TripStayInfo | null {
  if (region === VisaRegion.Elsewhere) return null;

  const rule = getPassportRule(region, passportCode);
  const regionRule = getRegionDefinition(region)?.rule ?? null;
  const limits = resolveStayLimits(passportCode, rule, regionRule, trip.entryDate);
  if (!limits) return null;

  const history = travelerTrips.filter(
    (t) => t.region === region && t.id !== trip.id,
  );
  const assessment = assessStay(limits, history, trip.entryDate, trip.exitDate);
  if (!assessment) return null;

  let reentryVariant: ReentryRisk["variant"] | undefined;
  const perVisit = limits.find(
    (l): l is PerVisitLimit => l.type === "per_visit",
  );
  if (perVisit) {
    const completed = travelerTrips.filter(
      (t) => t.region === region && t.exitDate && t.id !== trip.id,
    );
    const risk = detectReentryRisk(
      perVisitApproxDays(perVisit),
      completed,
      trip.entryDate,
    );
    reentryVariant = risk?.variant;
  }

  return {
    stayVariant: assessment.variant,
    daysRemaining: assessment.daysRemaining,
    reentryVariant,
  };
}
