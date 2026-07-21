/**
 * Generic stay calculator driven by StayLimit enum values.
 *
 * Supports per_visit and rolling_window limit types. When a traveler's
 * entitlement carries multiple simultaneous limits, all apply; the
 * most restrictive result (lowest daysRemaining) is returned.
 *
 * Re-entry risk uses proportional thresholds so the same logic works
 * for any per-visit allowance (UK 6 months, Ireland 90 days, etc.).
 */

import type {
  StayLimit,
  PerVisitLimit,
  StayUnit,
  RegionRule,
  PassportRule,
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
  return null;
}

/**
 * Resolve the stay limits that apply to a traveler for a region.
 *
 * - entitled passport → the first entitlement's own limits (respects
 *   per-passport allowances and their units).
 * - no passport set → the region's default rule limits (permissive default,
 *   mirroring how eligibility is treated elsewhere).
 * - free_movement / visa_required → null (no calculable per-visit cap).
 */
export function resolveStayLimits(
  passportCode: string | null,
  rule: PassportRule,
  regionRule: RegionRule | null,
): [StayLimit, ...StayLimit[]] | null {
  if (rule.access === "entitled") return rule.entitlements[0].limits;
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
  const limits = resolveStayLimits(passportCode, rule, regionRule);
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
