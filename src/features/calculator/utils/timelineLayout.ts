import type { Trip, Traveler } from "@/types";
import {
  today,
  parseDate,
  differenceInCalendarDays,
  subDays,
  addDays,
} from "@/features/calculator/utils/dates";

// ─── Layout constants ─────────────────────────────────────────────────────────

export const PX_PER_DAY = 6;

/**
 * Approximate height of the sticky header row — used only for the initial
 * scroll-to-today calculation. The header row itself sizes naturally to match
 * TravelerColumnHeader's intrinsic height, so this constant never enforces a
 * fixed height on any DOM element.
 *
 * Breakdown (matches TravelerColumnHeader padding + rows):
 *   pt 12 + name row ~22 + gap 8 + label row ~13 + gap 8 + bar 3 + pb 12 = ~78px
 */
export const COLUMN_HEADER_HEIGHT = 78;

/** Minimum rendered height for any trip card, regardless of duration. */
export const CARD_MIN_HEIGHT = 32;
/** Cards below this render in "pill" layout. */
export const CARD_COMPACT_THRESHOLD = 48;
/** Cards at or above this render in "full" layout; between → "compact". */
export const CARD_FULL_THRESHOLD = 64;

/** Minimum days before today the timeline shows (180-day lookback floor). */
export const TIMELINE_DAYS_BEFORE = 180;
/** Days after today the timeline extends. */
export const TIMELINE_DAYS_AFTER = 90;
/** Buffer added before the earliest trip so it doesn't sit flush at the top. */
const EARLY_TRIP_BUFFER = 14;

export const SIDEBAR_WIDTH = 64;
export const COLUMN_MIN_WIDTH = 280;

// ─── Dynamic timeline start ───────────────────────────────────────────────────

export function computeTimelineStart(travelers: Traveler[]): Date {
  const defaultStart = subDays(today(), TIMELINE_DAYS_BEFORE);
  let earliest = defaultStart;

  for (const traveler of travelers) {
    for (const trip of traveler.trips) {
      const entry = parseDate(trip.entryDate);
      if (entry < earliest) earliest = entry;
    }
  }

  return subDays(earliest, EARLY_TRIP_BUFFER);
}

// ─── Derived dimensions ───────────────────────────────────────────────────────

export function computeTotalDays(timelineStart: Date): number {
  const end = addDays(today(), TIMELINE_DAYS_AFTER);
  return differenceInCalendarDays(end, timelineStart) + 1;
}

/** Pixel height of the card-body canvas (excludes the sticky header row). */
export function computeTotalHeight(timelineStart: Date): number {
  return computeTotalDays(timelineStart) * PX_PER_DAY;
}

// ─── Trip geometry ────────────────────────────────────────────────────────────

/** Pixel offset from the top of the card-body canvas for a given date. */
export function dateToTop(date: Date, timelineStart: Date): number {
  return differenceInCalendarDays(date, timelineStart) * PX_PER_DAY;
}

export type CardLayoutMode = "pill" | "compact" | "full";

export interface TripGeometry {
  top: number;
  /** Rendered (clamped) height in pixels. */
  height: number;
  /** Natural (unclamped) height before clamping to CARD_MIN_HEIGHT. */
  naturalHeight: number;
  /** Actual calendar duration — used for display, not for sizing. */
  durationDays: number;
  layoutMode: CardLayoutMode;
}

export function getTripGeometry(trip: Trip, timelineStart: Date): TripGeometry {
  const entry = parseDate(trip.entryDate);
  const exit = trip.exitDate ? parseDate(trip.exitDate) : today();

  const top = dateToTop(entry, timelineStart);
  const durationDays = differenceInCalendarDays(exit, entry) + 1;

  // Render cards ending one day early so sequentially-adjacent trips
  // (e.g. exit Schengen Jan 5, enter Turkey Jan 5) don't visually overlap.
  // durationDays is unaffected and still displays the correct calendar count.
  const visualDays = Math.max(1, durationDays - 1);
  const naturalHeight = visualDays * PX_PER_DAY;
  const height = Math.max(CARD_MIN_HEIGHT, naturalHeight);

  const layoutMode: CardLayoutMode =
    height >= CARD_FULL_THRESHOLD
      ? "full"
      : height >= CARD_COMPACT_THRESHOLD
        ? "compact"
        : "pill";

  return { top, height, naturalHeight, durationDays, layoutMode };
}

// ─── Month marks ──────────────────────────────────────────────────────────────

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

export function buildMonthMarks(timelineStart: Date): MonthMark[] {
  const totalDays = computeTotalDays(timelineStart);
  const marks: MonthMark[] = [];

  const cursor = new Date(timelineStart);
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);

  while (differenceInCalendarDays(cursor, timelineStart) < totalDays) {
    const offset = differenceInCalendarDays(cursor, timelineStart);
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
