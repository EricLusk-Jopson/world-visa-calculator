import type { Traveler, Trip } from "@/types";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";
import { parseDate } from "@/features/calculator/utils/dates";
import { computeOverstayTripIds } from "../../trips/tripDuration";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TravelerEntry {
  traveler: Traveler;
  travelerIndex: number;
  trip: Trip;
}

export interface PositionedTrip {
  trip: Trip;
  entries: TravelerEntry[];
  top: number;
  height: number;
  /** First lane the card occupies, 0-based, within its overlap group. */
  lane: number;
  /** Number of adjacent lanes the card covers (> 1 for a shared trip). */
  laneSpan: number;
  /** Lanes in the card's overlap group; every card in a group shares it. */
  laneCount: number;
  /** True if any traveler in this merged card is in an overstay state. */
  isOverstay: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MIN_TRIP_HEIGHT = 28;

/**
 * Lane keys are travelerIndex * SUBLANES + k: k = 0 is the traveler's home
 * lane, k > 0 are extra lanes for that traveler's own overlapping trips, so
 * they sort right next to the home lane rather than after every traveler.
 */
const SUBLANES = 1000;

// ─── Merge ────────────────────────────────────────────────────────────────────

function buildPositionedTrips(
  travelers: Traveler[],
  hiddenIds: string[],
  timelineStart: Date,
  todayStr: string,
): Omit<PositionedTrip, "lane" | "laneSpan" | "laneCount">[] {
  const overstayByTraveler = new Map<string, Set<string>>(
    travelers.map((t) => [t.id, computeOverstayTripIds(t)]),
  );

  const merged: Omit<PositionedTrip, "lane" | "laneSpan" | "laneCount">[] =
    [];

  travelers.forEach((traveler, travelerIndex) => {
    if (hiddenIds.includes(traveler.id)) return;

    traveler.trips.forEach((trip) => {
      const tripIsOverstay =
        overstayByTraveler.get(traveler.id)?.has(trip.id) ?? false;

      const existing = merged.find(
        (m) =>
          m.trip.entryDate === trip.entryDate &&
          m.trip.exitDate === trip.exitDate &&
          m.trip.region === trip.region,
      );

      if (existing) {
        existing.entries.push({ traveler, travelerIndex, trip });
        if (tripIsOverstay) existing.isOverstay = true;
      } else {
        const top = dateToTop(parseDate(trip.entryDate), timelineStart);
        const exitStr = trip.exitDate ?? todayStr;
        const rawBottom = dateToTop(parseDate(exitStr), timelineStart);
        const height = Math.max(rawBottom - top, MIN_TRIP_HEIGHT);
        merged.push({
          trip,
          entries: [{ traveler, travelerIndex, trip }],
          top,
          height,
          isOverstay: tripIsOverstay,
        });
      }
    });
  });

  return merged;
}

// ─── Lane assignment ──────────────────────────────────────────────────────────

export interface LaneCard {
  top: number;
  height: number;
  /** Indices of the travelers on this card (several for a shared trip). */
  travelerIndices: number[];
}

export interface LanePlacement {
  lane: number;
  laneSpan: number;
  laneCount: number;
}

/**
 * Traveler-aware lane layout for the merged mobile column.
 *
 * Each traveler owns a home lane, so their trips line up vertically down the
 * column instead of drifting to whichever lane happens to be free. Cards that
 * only touch (one trip's exit date is the next one's entry date) don't
 * overlap and can share a lane.
 *
 * Algorithm:
 *   1. Sort by top (longer first on ties). A card's preferred placement is
 *      the range from its lowest to its highest traveler's home lane, so a
 *      shared trip spans its travelers' lanes. If that range is busy, try
 *      each traveler's home lane, then their extra lanes (see SUBLANES).
 *   2. Union-find to build connected overlap components.
 *   3. Per group, compact the lane keys in use to 0..laneCount-1, keeping
 *      their order; every card in the group gets the same laneCount.
 */
export function assignTravelerLanes(cards: LaneCard[]): LanePlacement[] {
  const overlaps = (a: LaneCard, b: LaneCard) =>
    a.top < b.top + b.height && b.top < a.top + a.height;

  const order = cards
    .map((_, i) => i)
    .sort(
      (a, b) =>
        cards[a].top - cards[b].top || cards[b].height - cards[a].height,
    );

  // ── Step 1: place each card on a lane-key range [lo, hi] ───────────────────
  const ranges: Array<[number, number]> = new Array(cards.length);
  const placed: number[] = [];

  const isFree = (i: number, lo: number, hi: number) =>
    placed.every(
      (j) =>
        ranges[j][1] < lo || ranges[j][0] > hi || !overlaps(cards[i], cards[j]),
    );

  for (const i of order) {
    const travelerIndices = cards[i].travelerIndices.length
      ? cards[i].travelerIndices
      : [0];
    const homes = [...new Set(travelerIndices)]
      .sort((a, b) => a - b)
      .map((t) => t * SUBLANES);

    let range: [number, number] = [homes[0], homes[homes.length - 1]];
    if (!isFree(i, ...range)) {
      search: for (let k = 0; k < SUBLANES; k++) {
        for (const home of homes) {
          if (isFree(i, home + k, home + k)) {
            range = [home + k, home + k];
            break search;
          }
        }
      }
    }

    ranges[i] = range;
    placed.push(i);
  }

  // ── Step 2: union-find overlap groups ───────────────────────────────────────
  const parent = cards.map((_, i) => i);

  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }

  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (overlaps(cards[i], cards[j])) parent[find(i)] = find(j);
    }
  }

  // ── Step 3: compact lane keys per group ────────────────────────────────────
  const groupKeys = new Map<number, Set<number>>();
  cards.forEach((_, i) => {
    const root = find(i);
    const keys = groupKeys.get(root) ?? new Set<number>();
    keys.add(ranges[i][0]).add(ranges[i][1]);
    groupKeys.set(root, keys);
  });

  const groupIndex = new Map<number, Map<number, number>>();
  for (const [root, keys] of groupKeys) {
    const sorted = [...keys].sort((a, b) => a - b);
    groupIndex.set(root, new Map(sorted.map((key, idx) => [key, idx])));
  }

  return cards.map((_, i) => {
    const index = groupIndex.get(find(i))!;
    const lo = index.get(ranges[i][0])!;
    const hi = index.get(ranges[i][1])!;
    return { lane: lo, laneSpan: hi - lo + 1, laneCount: index.size };
  });
}

/** Merges shared trips across visible travelers and lays them out in lanes. */
export function assignLanes(
  travelers: Traveler[],
  hiddenIds: string[],
  timelineStart: Date,
  todayStr: string,
): PositionedTrip[] {
  const flat = buildPositionedTrips(
    travelers,
    hiddenIds,
    timelineStart,
    todayStr,
  );
  const placements = assignTravelerLanes(
    flat.map((item) => ({
      top: item.top,
      height: item.height,
      travelerIndices: item.entries.map((e) => e.travelerIndex),
    })),
  );
  return flat.map((item, i) => ({ ...item, ...placements[i] }));
}
