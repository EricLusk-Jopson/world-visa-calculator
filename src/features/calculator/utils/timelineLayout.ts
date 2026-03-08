import type { Trip } from "@/types";
import {
  today,
  parseDate,
  differenceInCalendarDays,
  subDays,
} from "@/features/calculator/utils/dates";

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

// ─── Timeline geometry ────────────────────────────────────────────────────────

/** The date at which the timeline starts (TIMELINE_DAYS_BEFORE days ago). */
export function getTimelineStart(): Date {
  return subDays(today(), TIMELINE_DAYS_BEFORE);
}

/** Pixel offset from the top of the timeline for a given date. */
export function dateToTop(date: Date): number {
  return differenceInCalendarDays(date, getTimelineStart()) * PX_PER_DAY;
}

export interface TripGeometry {
  top: number;
  height: number;
  durationDays: number;
}

export function getTripGeometry(trip: Trip): TripGeometry {
  const entry = parseDate(trip.entryDate);
  const exit = trip.exitDate ? parseDate(trip.exitDate) : today();

  const top = dateToTop(entry);
  const durationDays = differenceInCalendarDays(exit, entry) + 1;
  const height = Math.max(PX_PER_DAY, durationDays * PX_PER_DAY);

  return { top, height, durationDays };
}

// ─── Month marks for DateSidebar ──────────────────────────────────────────────

export interface MonthMark {
  label: string;
  topPx: number;
  year: number;
  month: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function buildMonthMarks(): MonthMark[] {
  const start = getTimelineStart();
  const marks: MonthMark[] = [];

  // Start at the 1st of the month following the timeline start.
  const cursor = new Date(start);
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);

  while (differenceInCalendarDays(cursor, start) < TOTAL_DAYS) {
    const offset = differenceInCalendarDays(cursor, start);
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
