import { VisaRegion } from "@/types";
import type { Traveler, Trip } from "@/types";

// ─── Layout constants ─────────────────────────────────────────────────────────

export const PX_PER_DAY = 38;
/** Days before today that the timeline starts. */
export const TIMELINE_DAYS_BEFORE = 180;
/** Days after today that the timeline extends. */
export const TIMELINE_DAYS_AFTER = 90;
export const TOTAL_DAYS = TIMELINE_DAYS_BEFORE + 1 + TIMELINE_DAYS_AFTER; // 272
export const TOTAL_HEIGHT = TOTAL_DAYS * PX_PER_DAY;
export const SIDEBAR_WIDTH = 64;
export const COLUMN_MIN_WIDTH = 280;

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string as local midnight, avoiding UTC off-by-one. */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date as YYYY-MM-DD. */
export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Today at local midnight. */
export function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** The date at which the timeline starts (TIMELINE_DAYS_BEFORE days ago). */
export function getTimelineStart(): Date {
  const d = getToday();
  d.setDate(d.getDate() - TIMELINE_DAYS_BEFORE);
  return d;
}

/** Integer days from `base` to `target` (may be negative). */
export function daysBetween(base: Date, target: Date): number {
  return Math.round((target.getTime() - base.getTime()) / 86_400_000);
}

/** Pixel offset from the top of the timeline for a given date. */
export function dateToTop(date: Date): number {
  return daysBetween(getTimelineStart(), date) * PX_PER_DAY;
}

/** Number of calendar days a trip spans (entry and exit both inclusive). */
export function tripDurationDays(entryDate: string, exitDate?: string): number {
  const entry = parseLocalDate(entryDate);
  const exit = exitDate ? parseLocalDate(exitDate) : getToday();
  return Math.max(1, daysBetween(entry, exit) + 1);
}

// ─── Timeline trip geometry ───────────────────────────────────────────────────

export interface TripGeometry {
  top: number;
  height: number;
  durationDays: number;
}

export function getTripGeometry(trip: Trip): TripGeometry {
  const today = getToday();
  const entry = parseLocalDate(trip.entryDate);
  const exit = trip.exitDate ? parseLocalDate(trip.exitDate) : today;

  const top = dateToTop(entry);
  const durationDays = daysBetween(entry, exit) + 1;
  const height = Math.max(PX_PER_DAY, durationDays * PX_PER_DAY);

  return { top, height, durationDays };
}

// ─── Status computation ───────────────────────────────────────────────────────

export type StatusVariant = "safe" | "caution" | "danger";

export function getStatusVariant(daysRemaining: number): StatusVariant {
  if (daysRemaining >= 30) return "safe";
  if (daysRemaining >= 10) return "caution";
  return "danger";
}

export interface TravelerStatus {
  daysUsed: number;
  daysRemaining: number;
  variant: StatusVariant;
}

/**
 * Computes Schengen allowance for a traveler as-of `refDate`.
 * Uses the same rolling 180-day window logic as the official EU algorithm.
 */
export function computeTravelerStatus(
  traveler: Traveler,
  refDate: Date = getToday()
): TravelerStatus {
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 179);

  let daysUsed = 0;

  for (const trip of traveler.trips) {
    if (trip.region !== VisaRegion.Schengen) continue;

    const entry = parseLocalDate(trip.entryDate);
    const exit = trip.exitDate ? parseLocalDate(trip.exitDate) : today;

    const clampedEntry = entry < windowStart ? windowStart : entry;
    const clampedExit = exit > today ? today : exit;

    if (clampedEntry <= clampedExit) {
      daysUsed += daysBetween(clampedEntry, clampedExit) + 1;
    }
  }

  const daysRemaining = Math.max(0, 90 - daysUsed);
  return { daysUsed, daysRemaining, variant: getStatusVariant(daysRemaining) };
}

/**
 * Computes days remaining at the time of a trip's exit.
 * Used for the "Xd left" chip on trip cards.
 */
export function computeStatusAtTripExit(
  traveler: Traveler,
  tripId: string
): TravelerStatus {
  const trip = traveler.trips.find((t) => t.id === tripId);
  if (!trip) return { daysUsed: 0, daysRemaining: 90, variant: "safe" };
  const refDate = trip.exitDate ? parseLocalDate(trip.exitDate) : getToday();
  return computeTravelerStatus(traveler, refDate);
}

// ─── Month marks for DateSidebar ──────────────────────────────────────────────

export interface MonthMark {
  label: string;
  topPx: number;
  year: number;
  month: number;
}

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

export function buildMonthMarks(): MonthMark[] {
  const start = getTimelineStart();
  const marks: MonthMark[] = [];

  // Start at the 1st of the month after start
  const cursor = new Date(start);
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);

  while (daysBetween(start, cursor) < TOTAL_DAYS) {
    const offset = daysBetween(start, cursor);
    if (offset >= 0) {
      marks.push({
        label: `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`,
        topPx: offset * PX_PER_DAY,
        year: cursor.getFullYear(),
        month: cursor.getMonth(),
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return marks;
}

// ─── Trip display helpers ─────────────────────────────────────────────────────

/** Human-readable short date, e.g. "12 Jan" */
export function fmtShort(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

/** Human-readable date range string */
export function fmtDateRange(entryDate: string, exitDate?: string): string {
  return `${fmtShort(entryDate)} → ${exitDate ? fmtShort(exitDate) : "ongoing"}`;
}

/** Whether a trip's entry date is in the future */
export function isTripPlanned(trip: Trip): boolean {
  return parseLocalDate(trip.entryDate) > getToday();
}

/** Whether a trip is currently ongoing (no exit date) */
export function isTripOngoing(trip: Trip): boolean {
  return !trip.exitDate;
}
