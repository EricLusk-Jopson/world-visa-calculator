/**
 * UK per-visit stay calculator.
 *
 * THE RULE
 * --------
 * Visa-free visitors (ETA and non-ETA alike) may remain in the UK for up to
 * SIX CALENDAR MONTHS per visit. This is NOT a rolling window — it is a
 * per-visit cap, and there is no aggregate counter across visits.
 *
 * "Six calendar months" is measured in actual months, not days:
 *   entry Jan 15  →  max exit Jul 15
 *   entry Aug 31  →  max exit Feb 28/29 (month clamped by date-fns addMonths)
 *
 * GRADUATED WARNINGS
 * ------------------
 *   ≥ UK_CAUTION_DAYS  →  "caution"  (approaching the limit)
 *   past max exit date  →  "danger"   (limit exceeded or imminent)
 *
 * RE-ENTRY RISK
 * -------------
 * The UK "genuine visitor" test considers overall travel patterns. Visitors who
 * repeatedly stay near the 6-month limit may be refused entry. If the most
 * recent completed UK trip lasted ≥ UK_CAUTION_DAYS, a re-entry risk warning
 * is surfaced in the trip modal.
 */

import { addMonths } from "date-fns";
import type { Trip } from "@/types";
import {
  parseDate,
  formatDate,
  today,
  countTripDays,
  differenceInCalendarDays,
} from "../dates";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum stay for visa-free visitors: 6 calendar months per visit. */
export const UK_MAX_CALENDAR_MONTHS = 6;

/**
 * Trip duration (in days) above which a caution warning is shown.
 * Chosen to give roughly a 30-day lead-in before the ~180-day calendar limit.
 */
export const UK_CAUTION_DAYS = 150;

// ─── Types ────────────────────────────────────────────────────────────────────

export type StayVariant = "safe" | "caution" | "danger";

export interface UKStayAssessment {
  /** Last legal day of presence, ISO "YYYY-MM-DD". */
  maxExitDate: string;
  /** Calendar days elapsed so far (entry to checkDate, inclusive). */
  tripDays: number;
  /** Days between checkDate and maxExitDate (negative = over the limit). */
  daysRemaining: number;
  variant: StayVariant;
}

export interface UKReentryRisk {
  lastTripEntry: string;
  lastTripExit: string;
  /** Duration of the flagged trip in calendar days. */
  lastTripDays: number;
  variant: "caution" | "danger";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the last day on which a visa-free visitor entering on `entryDateStr`
 * is legally permitted to remain in the UK.
 *
 * date-fns addMonths clamps to the end of the month where necessary
 * (e.g. Aug 31 + 6 months = Feb 28/29).
 */
export function calculateUKMaxExitDate(entryDateStr: string): string {
  return formatDate(addMonths(parseDate(entryDateStr), UK_MAX_CALENDAR_MONTHS));
}

/**
 * Assess the current stay for a UK visa-free visitor.
 *
 * @param entryDateStr  Entry date.
 * @param checkDateStr  Date to assess against (defaults to today).
 *                      For a completed trip, pass the exit date.
 */
export function assessUKStay(
  entryDateStr: string,
  checkDateStr?: string,
): UKStayAssessment {
  const entry = parseDate(entryDateStr);
  const checkDate = checkDateStr ? parseDate(checkDateStr) : today();
  const maxExitDate = calculateUKMaxExitDate(entryDateStr);
  const maxExit = parseDate(maxExitDate);

  const tripDays = countTripDays(entry, checkDate);
  const daysRemaining = differenceInCalendarDays(maxExit, checkDate);

  let variant: StayVariant;
  if (daysRemaining < 0) variant = "danger";
  else if (tripDays >= UK_CAUTION_DAYS) variant = "caution";
  else variant = "safe";

  return { maxExitDate, tripDays, daysRemaining, variant };
}

/**
 * Returns re-entry risk information if the most recent completed UK trip
 * reached the caution or danger threshold, otherwise null.
 *
 * @param ukTrips            Completed UK trips for a single traveler.
 * @param proposedEntryDateStr  The entry date being evaluated in the trip modal.
 */
export function detectUKReentryRisk(
  ukTrips: Trip[],
  proposedEntryDateStr: string,
): UKReentryRisk | null {
  const pastTrips = ukTrips
    .filter((t) => t.exitDate && t.exitDate < proposedEntryDateStr)
    .sort((a, b) => (a.exitDate! > b.exitDate! ? -1 : 1));

  if (pastTrips.length === 0) return null;

  const last = pastTrips[0];
  const assessment = assessUKStay(last.entryDate, last.exitDate);

  if (assessment.variant === "danger" || assessment.daysRemaining <= 0) {
    return {
      lastTripEntry: last.entryDate,
      lastTripExit: last.exitDate!,
      lastTripDays: assessment.tripDays,
      variant: "danger",
    };
  }
  if (assessment.variant === "caution") {
    return {
      lastTripEntry: last.entryDate,
      lastTripExit: last.exitDate!,
      lastTripDays: assessment.tripDays,
      variant: "caution",
    };
  }

  return null;
}
