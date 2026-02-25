/**
 * Shared date helpers that wrap date-fns.
 *
 * All functions that accept/return "date strings" use ISO 8601 "YYYY-MM-DD"
 * format (no time component) to avoid timezone pitfalls.
 */

import {
  parseISO,
  format,
  differenceInCalendarDays,
  addDays,
  subDays,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  isValid,
  max,
  min,
} from "date-fns";

// These three are re-exported because the calculator uses them directly
// rather than through a named wrapper.
export { differenceInCalendarDays, addDays, subDays };

// ─── Parsing & Formatting ──────────────────────────────────────────────────────

/** Parse "YYYY-MM-DD" → Date (midnight local time). */
export function parseDate(iso: string): Date {
  return parseISO(iso);
}

/** Format a Date → "YYYY-MM-DD". */
export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Today as "YYYY-MM-DD". */
export function todayISO(): string {
  return formatDate(startOfDay(new Date()));
}

/** Today as a Date object (midnight local). */
export function today(): Date {
  return startOfDay(new Date());
}

// ─── Comparison Helpers ────────────────────────────────────────────────────────

/** True when a is on the same calendar day as b. */
export function isSameDay(a: Date, b: Date): boolean {
  return isEqual(startOfDay(a), startOfDay(b));
}

/** True when a is on the same day or before b. */
export function isOnOrBefore(a: Date, b: Date): boolean {
  return isBefore(a, b) || isSameDay(a, b);
}

/** True when a is on the same day or after b. */
export function isOnOrAfter(a: Date, b: Date): boolean {
  return isAfter(a, b) || isSameDay(a, b);
}

// ─── Calendar Day Counting ─────────────────────────────────────────────────────

/**
 * Count the number of calendar days in a trip.
 *
 * Schengen counts both the entry AND exit day (i.e. inclusive on both ends).
 * A same-day trip (enter and leave the same day) counts as 1 day.
 *
 * @param entry - trip entry date
 * @param exit  - trip exit date (or today for ongoing trips)
 */
export function countTripDays(entry: Date, exit: Date): number {
  // differenceInCalendarDays gives us (exit - entry), so we add 1 for inclusivity.
  return differenceInCalendarDays(exit, entry) + 1;
}

/**
 * Count the number of days a trip overlaps with a given window [windowStart, windowEnd] (inclusive).
 * Returns 0 if no overlap.
 */
export function countDaysInWindow(
  tripEntry: Date,
  tripExit: Date,
  windowStart: Date,
  windowEnd: Date,
): number {
  const overlapStart = max([tripEntry, windowStart]);
  const overlapEnd = min([tripExit, windowEnd]);

  if (isAfter(overlapStart, overlapEnd)) return 0;
  return differenceInCalendarDays(overlapEnd, overlapStart) + 1;
}

// ─── Validation Helpers ────────────────────────────────────────────────────────

/** True if a string is a valid "YYYY-MM-DD" date. */
export function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return isValid(parseISO(s));
}
