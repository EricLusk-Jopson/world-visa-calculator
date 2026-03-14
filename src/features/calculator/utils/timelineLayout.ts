import type { Trip, Traveler } from "@/types";
import {
  today,
  parseDate,
  differenceInCalendarDays,
  subDays,
  addDays,
} from "@/features/calculator/utils/dates";

// ─── Layout constants ─────────────────────────────────────────────────────────

export const PX_PER_DAY = 3;

/**
 * Approximate height of the sticky header row.
 * Used only for the initial scroll-to-today calculation — never enforced on DOM.
 */
export const COLUMN_HEADER_HEIGHT = 78;

/** Minimum rendered height for any trip card, regardless of duration. */
export const CARD_MIN_HEIGHT = 28;

// ─── Card display thresholds ──────────────────────────────────────────────────
//
// Rather than a "layout mode" enum, the card derives what to show directly
// from its rendered height against these two thresholds. This gives finer
// control and makes intermediate sizes (e.g. 36px) well-defined.
//
// At CARD_MIN_HEIGHT (24px):
//   → destination name only, duration suffix, tooltip for everything else.
//
// At SHOW_DATE_THRESHOLD (42px):
//   → adds the date range line. Duration moves from inline suffix to badge row.
//
// At SHOW_BADGE_THRESHOLD (58px):
//   → adds the region and remaining-days badge row.

export const SHOW_DATE_THRESHOLD = 42;
export const SHOW_BADGE_THRESHOLD = 58;

// ─── Lane layout ──────────────────────────────────────────────────────────────

export const CARD_LEFT_BASE = 20;
export const CARD_RIGHT_MARGIN = 10;
export const LANE_GAP = 4;
export const MIN_CARD_WIDTH = 80;

/** Minimum days before today the timeline shows (180-day lookback floor). */
export const TIMELINE_DAYS_BEFORE = 180;
/** Days after today the timeline extends. */
export const TIMELINE_DAYS_AFTER = 90;
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

export function computeTotalHeight(timelineStart: Date): number {
  return computeTotalDays(timelineStart) * PX_PER_DAY;
}

// ─── Trip geometry ────────────────────────────────────────────────────────────

export function dateToTop(date: Date, timelineStart: Date): number {
  return differenceInCalendarDays(date, timelineStart) * PX_PER_DAY;
}

export interface TripGeometry {
  top: number;
  height: number;
  naturalHeight: number;
  durationDays: number;
}

export function getTripGeometry(trip: Trip, timelineStart: Date): TripGeometry {
  const entry = parseDate(trip.entryDate);
  const exit = trip.exitDate ? parseDate(trip.exitDate) : today();

  const top = dateToTop(entry, timelineStart);
  const durationDays = differenceInCalendarDays(exit, entry) + 1;

  // Render cards ending one visual day early so sequentially-adjacent trips
  // that share a boundary date don't paint over each other.
  const visualDays = Math.max(1, durationDays - 1);
  const naturalHeight = visualDays * PX_PER_DAY;
  const height = Math.max(CARD_MIN_HEIGHT, naturalHeight);

  return { top, height, naturalHeight, durationDays };
}

// ─── Lane assignment ──────────────────────────────────────────────────────────

export interface LaneAssignment {
  laneIndex: number;
  numLanes: number;
}

/**
 * Assign each card an equal-width lane within its overlap group.
 *
 * An "overlap group" is a connected component of cards whose rendered
 * intervals [top, top+height] touch or overlap. Within a group the column
 * is divided into numLanes equal slices. Cards outside any overlap group
 * always get numLanes = 1 (full available width).
 *
 * Algorithm:
 *   1. Sort by top. Greedy lane allocation — first free lane wins; open a new
 *      lane if none free, subject to MIN_CARD_WIDTH floor; at cap reuse the
 *      lane ending soonest.
 *   2. Union-find to build connected overlap components.
 *   3. numLanes per group = highest laneIndex in group + 1.
 */
export function computeLaneAssignments(
  cards: Array<{ id: string; top: number; height: number }>,
  columnWidth: number,
): Map<string, LaneAssignment> {
  if (cards.length === 0) return new Map();

  const availableWidth = columnWidth - CARD_LEFT_BASE - CARD_RIGHT_MARGIN;
  const maxLanes = Math.max(1, Math.floor(availableWidth / MIN_CARD_WIDTH));

  const sorted = [...cards].sort((a, b) => a.top - b.top);

  // ── Step 1: greedy lane allocation ──────────────────────────────────────────
  const laneBottoms: number[] = [];
  const laneIndexMap = new Map<string, number>();

  for (const card of sorted) {
    let assignedLane = -1;

    for (let lane = 0; lane < laneBottoms.length; lane++) {
      if (card.top >= laneBottoms[lane]) {
        assignedLane = lane;
        break;
      }
    }

    if (assignedLane === -1) {
      if (laneBottoms.length < maxLanes) {
        assignedLane = laneBottoms.length;
        laneBottoms.push(0);
      } else {
        assignedLane = laneBottoms.reduce(
          (best, bottom, lane) => (bottom < laneBottoms[best] ? lane : best),
          0,
        );
      }
    }

    laneBottoms[assignedLane] = card.top + card.height;
    laneIndexMap.set(card.id, assignedLane);
  }

  // ── Step 2: union-find overlap groups ───────────────────────────────────────
  const parent = new Map<string, string>(sorted.map((c) => [c.id, c.id]));

  function find(id: string): string {
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!));
    return parent.get(id)!;
  }
  function union(a: string, b: string) {
    parent.set(find(a), find(b));
  }

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (a.top < b.top + b.height && b.top < a.top + a.height) {
        union(a.id, b.id);
      }
    }
  }

  // ── Step 3: numLanes per group ───────────────────────────────────────────────
  const groupMaxLane = new Map<string, number>();
  for (const card of sorted) {
    const root = find(card.id);
    const lane = laneIndexMap.get(card.id)!;
    groupMaxLane.set(root, Math.max(groupMaxLane.get(root) ?? 0, lane));
  }

  // ── Step 4: build result ────────────────────────────────────────────────────
  const result = new Map<string, LaneAssignment>();
  for (const card of sorted) {
    const root = find(card.id);
    result.set(card.id, {
      laneIndex: laneIndexMap.get(card.id)!,
      numLanes: (groupMaxLane.get(root) ?? 0) + 1,
    });
  }

  return result;
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
