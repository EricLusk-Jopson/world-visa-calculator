/**
 * Generic stay calculator driven by StayLimit enum values.
 *
 * Supports per_visit and rolling_window limit types. When a traveler's
 * entitlement carries multiple simultaneous limits, all apply; the
 * most restrictive result (lowest daysRemaining) is returned.
 *
 * Re-entry risk uses proportional thresholds so the same logic works
 * for any per-visit allowance (UK 180 d, Ireland 90 d, etc.).
 */

import type { StayLimit, RegionRule, Trip } from "@/types";
import {
  parseDate,
  formatDate,
  today,
  addDays,
  countTripDays,
  differenceInCalendarDays,
} from "./dates";
import { createRollingWindowCalculator } from "./rollingWindowCalculator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StayVariant = "safe" | "caution" | "danger";

export interface StayAssessment {
  limitType: StayLimit["type"];
  daysAllowed: number;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cautionThreshold(daysAllowed: number): number {
  return Math.floor(daysAllowed * (5 / 6));
}

/**
 * Convert a RegionRule to the equivalent StayLimit array for use with assessStay.
 * Returns null for officer_discretion rules (no calculable limit).
 */
export function regionRuleToLimits(
  rule: RegionRule,
): [StayLimit, ...StayLimit[]] | null {
  if (rule.type === "per_visit")
    return [{ type: "per_visit", days: rule.allowanceDays }];
  if (rule.type === "rolling_window")
    return [{ type: "rolling_window", days: rule.allowanceDays, windowDays: rule.windowDays }];
  return null;
}

// ─── Per-limit assessors ──────────────────────────────────────────────────────

function assessPerVisit(
  limit: { days: number },
  entryDate: string,
  checkDate?: string,
): StayAssessment {
  const entry = parseDate(entryDate);
  const check = checkDate ? parseDate(checkDate) : today();
  const maxExit = addDays(entry, limit.days - 1);
  const maxExitDate = formatDate(maxExit);
  const tripDays = countTripDays(entry, check);
  const daysRemaining = differenceInCalendarDays(maxExit, check);

  let variant: StayVariant;
  if (daysRemaining < 0) variant = "danger";
  else if (tripDays >= cautionThreshold(limit.days)) variant = "caution";
  else variant = "safe";

  return { limitType: "per_visit", daysAllowed: limit.days, tripDays, daysRemaining, maxExitDate, variant };
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

  if (!maxStay.canEnter) {
    return {
      limitType: "rolling_window",
      daysAllowed: limit.days,
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
