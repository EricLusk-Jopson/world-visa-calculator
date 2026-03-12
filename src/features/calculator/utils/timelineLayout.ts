import type { Trip, Traveler } from "@/types";
import {
  today,
  parseDate,
  differenceInCalendarDays,
  subDays,
  addDays,
} from "@/features/calculator/utils/dates";

// ─── Layout constants ─────────────────────────────────────────────────────────

export const PX_PER_DAY = 4;

/**
 * Approximate height of the sticky header row.
 * Used only for the initial scroll-to-today calculation — never enforced on DOM.
 */
export const COLUMN_HEADER_HEIGHT = 78;

/** Minimum rendered height for any trip card, regardless of duration. */
export const CARD_MIN_HEIGHT = 32;
/** Cards below this render in "pill" layout. */
export const CARD_COMPACT_THRESHOLD = 48;
/** Cards at or above this render in "full" layout; between → "compact". */
export const CARD_FULL_THRESHOLD = 64;

// ─── Lane layout ──────────────────────────────────────────────────────────────
//
// Overlapping cards are split into equal-width lanes within their overlap group.
// The available column width is divided evenly across all lanes in the group —
// no offsets, just equal slices. Cards in non-overlapping groups always occupy
// the full width.
//
// CARD_LEFT_BASE: left margin from column edge to the first lane.
// CARD_RIGHT_MARGIN: gap between the last lane and the column right edge.
// LANE_GAP: horizontal gap between adjacent lanes so card borders don't merge.
// MIN_CARD_WIDTH: floor on lane width — prevents cards becoming unreadable.
//   At MIN_CARD_WIDTH, no more lanes are opened (greedy algorithm is capped).

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

export type CardLayoutMode = "pill" | "compact" | "full";

export interface TripGeometry {
  top: number;
  height: number;
  naturalHeight: number;
  durationDays: number;
  layoutMode: CardLayoutMode;
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

  const layoutMode: CardLayoutMode =
    height >= CARD_FULL_THRESHOLD
      ? "full"
      : height >= CARD_COMPACT_THRESHOLD
        ? "compact"
        : "pill";

  return { top, height, naturalHeight, durationDays, layoutMode };
}

// ─── Lane assignment ──────────────────────────────────────────────────────────

export interface LaneAssignment {
  /** 0-based index of this card's lane within its overlap group. */
  laneIndex: number;
  /**
   * Total number of lanes in this card's overlap group.
   * Cards in a non-overlapping group always get numLanes = 1 (full width).
   */
  numLanes: number;
}

/**
 * Assign each card an equal-width lane within its overlap group.
 *
 * An "overlap group" is a connected component of cards whose rendered
 * intervals [top, top+height] mutually touch or overlap. Within a group,
 * the column is divided into `numLanes` equal slices and each card occupies
 * exactly one slice.
 *
 * Algorithm:
 *   1. Sort cards by top.
 *   2. Greedy lane assignment — find first free lane (laneBottom ≤ card.top).
 *      Open a new lane if none is free, subject to MIN_CARD_WIDTH floor.
 *   3. Union-Find to group all mutually overlapping cards into connected
 *      components.
 *   4. numLanes for a group = highest lane index in the group + 1.
 *
 * Returns Map<tripId, LaneAssignment>.
 */
export function computeLaneAssignments(
  cards: Array<{ id: string; top: number; height: number }>,
  columnWidth: number,
): Map<string, LaneAssignment> {
  if (cards.length === 0) return new Map();

  const availableWidth = columnWidth - CARD_LEFT_BASE - CARD_RIGHT_MARGIN;
  // Maximum lanes before cards become too narrow to read.
  const maxLanes = Math.max(1, Math.floor(availableWidth / MIN_CARD_WIDTH));

  const sorted = [...cards].sort((a, b) => a.top - b.top);

  // ── Step 1: greedy lane assignment ──────────────────────────────────────────
  // laneBottoms[i] = pixel coordinate where the last card in lane i ends.
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
        // Open a new lane.
        assignedLane = laneBottoms.length;
        laneBottoms.push(0);
      } else {
        // At width cap — reuse the lane whose last card ends soonest.
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
  // Two cards are in the same group if their rendered intervals overlap.
  const parent = new Map<string, string>(sorted.map((c) => [c.id, c.id]));

  function find(id: string): string {
    if (parent.get(id) !== id) parent.set(id, find(parent.get(id)!));
    return parent.get(id)!;
  }
  function union(a: string, b: string) {
    parent.set(find(a), find(b));
  }

  // O(n²) — fine for the small number of trips per traveler.
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const overlaps = a.top < b.top + b.height && b.top < a.top + a.height;
      if (overlaps) union(a.id, b.id);
    }
  }

  // ── Step 3: compute numLanes per group ──────────────────────────────────────
  // numLanes = highest lane index in the group + 1.
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
