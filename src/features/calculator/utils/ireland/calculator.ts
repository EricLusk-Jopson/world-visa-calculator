/**
 * Ireland per-visit stay calculator.
 *
 * THE RULE
 * --------
 * Visa-free visitors may be admitted for up to 90 days per permission granted
 * at the border. This is a per-visit cap — Ireland does NOT use a rolling
 * window like Schengen.
 *
 * GRADUATED WARNINGS
 * ------------------
 *   ≥ IRELAND_CAUTION_DAYS (75)  →  "caution"
 *   ≥ IRELAND_MAX_DAYS (90)      →  "danger"
 *
 * RE-ENTRY RISK
 * -------------
 * INIS has explicitly stated that it is not possible to remain in Ireland for
 * 90 days and then immediately re-enter for a further 90-day period. Repeat
 * maximum-duration stays are subject to officer discretion. If the most recent
 * completed Ireland trip reached the caution or danger threshold, a re-entry
 * risk warning is surfaced in the trip modal.
 */

import type { Trip } from "@/types";
import {
  parseDate,
  formatDate,
  today,
  addDays,
  countTripDays,
  differenceInCalendarDays,
} from "../dates";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum days per permission for visa-free visitors. */
export const IRELAND_MAX_DAYS = 90;

/** Trip duration (in days) above which a caution warning is shown. */
export const IRELAND_CAUTION_DAYS = 75;

// ─── Types ────────────────────────────────────────────────────────────────────

export type StayVariant = "safe" | "caution" | "danger";

export interface IrelandStayAssessment {
  /** Last legal day of presence, ISO "YYYY-MM-DD". */
  maxExitDate: string;
  /** Calendar days elapsed so far (entry to checkDate, inclusive). */
  tripDays: number;
  /** Days between checkDate and maxExitDate (negative = over the limit). */
  daysRemaining: number;
  variant: StayVariant;
}

export interface IrelandReentryRisk {
  lastTripEntry: string;
  lastTripExit: string;
  /** Duration of the flagged trip in calendar days. */
  lastTripDays: number;
  variant: "caution" | "danger";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the last day on which a visa-free visitor entering on `entryDateStr`
 * is legally permitted to remain in Ireland (90th inclusive day).
 */
export function calculateIrelandMaxExitDate(entryDateStr: string): string {
  return formatDate(addDays(parseDate(entryDateStr), IRELAND_MAX_DAYS - 1));
}

/**
 * Assess the current stay for an Ireland visa-free visitor.
 *
 * @param entryDateStr  Entry date.
 * @param checkDateStr  Date to assess against (defaults to today).
 *                      For a completed trip, pass the exit date.
 */
export function assessIrelandStay(
  entryDateStr: string,
  checkDateStr?: string,
): IrelandStayAssessment {
  const entry = parseDate(entryDateStr);
  const checkDate = checkDateStr ? parseDate(checkDateStr) : today();
  const maxExitDate = calculateIrelandMaxExitDate(entryDateStr);
  const maxExit = parseDate(maxExitDate);

  const tripDays = countTripDays(entry, checkDate);
  const daysRemaining = differenceInCalendarDays(maxExit, checkDate);

  let variant: StayVariant;
  if (daysRemaining < 0 || tripDays >= IRELAND_MAX_DAYS) variant = "danger";
  else if (tripDays >= IRELAND_CAUTION_DAYS) variant = "caution";
  else variant = "safe";

  return { maxExitDate, tripDays, daysRemaining, variant };
}

/**
 * Returns re-entry risk information if the most recent completed Ireland trip
 * reached the caution or danger threshold, otherwise null.
 *
 * @param irelandTrips          Completed Ireland trips for a single traveler.
 * @param proposedEntryDateStr  The entry date being evaluated in the trip modal.
 */
export function detectIrelandReentryRisk(
  irelandTrips: Trip[],
  proposedEntryDateStr: string,
): IrelandReentryRisk | null {
  const pastTrips = irelandTrips
    .filter((t) => t.exitDate && t.exitDate < proposedEntryDateStr)
    .sort((a, b) => (a.exitDate! > b.exitDate! ? -1 : 1));

  if (pastTrips.length === 0) return null;

  const last = pastTrips[0];
  const assessment = assessIrelandStay(last.entryDate, last.exitDate);

  if (assessment.variant === "danger" || assessment.tripDays >= IRELAND_MAX_DAYS) {
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
