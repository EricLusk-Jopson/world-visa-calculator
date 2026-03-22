import type { Trip } from "@/types";
import {
  today,
  parseDate,
  differenceInCalendarDays,
  MONTH_NAMES,
} from "@/features/calculator/utils/dates";

// ─── Duration ─────────────────────────────────────────────────────────────────

/**
 * Number of calendar days a trip spans (entry and exit both inclusive).
 * Ongoing trips are measured to today.
 */
export function tripDurationDays(entryDate: string, exitDate?: string): number {
  const entry = parseDate(entryDate);
  const exit = exitDate ? parseDate(exitDate) : today();
  return Math.max(1, differenceInCalendarDays(exit, entry) + 1);
}

// ─── Display helpers ──────────────────────────────────────────────────────────

/**
 * Human-readable short date: "12 Jan" in the current year, "12 Jan 2024"
 * in any other year.
 */
export function fmtShort(dateStr: string): string {
  const d = parseDate(dateStr);
  const suffix =
    d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : "";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}${suffix}`;
}

/** Human-readable date range, e.g. "12 Jan → 4 Feb" or "12 Jan → ongoing". */
export function fmtDateRange(entryDate: string, exitDate?: string): string {
  return `${fmtShort(entryDate)} → ${exitDate ? fmtShort(exitDate) : "ongoing"}`;
}

// ─── Trip state predicates ────────────────────────────────────────────────────

/** True if the trip's entry date is in the future. */
export function isTripPlanned(trip: Trip): boolean {
  return parseDate(trip.entryDate) > today();
}

/** True if the trip has no exit date (traveler is currently inside). */
export function isTripOngoing(trip: Trip): boolean {
  return !trip.exitDate;
}
