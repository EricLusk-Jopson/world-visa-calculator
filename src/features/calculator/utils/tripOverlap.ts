/**
 * Trip-overlap helpers for the date pickers.
 *
 * A new trip may touch another trip on a single day (an overland border
 * crossing to a different region — e.g. Bulgaria → Türkiye), but may not share
 * any interior day. So for the selected travelers we block every OTHER trip's
 * interior days (first and last day of each trip stay available), and treat an
 * overlap of two or more days as a conflict.
 */

import type { Traveler, Trip } from "@/types";
import { parseDate, addDays, differenceInCalendarDays } from "./dates";

export interface BlockedRange {
  from: Date;
  to: Date;
}

/** Coordinates identifying the trip being edited across all its per-traveler copies. */
export type ExcludeTrip = Pick<Trip, "entryDate" | "exitDate" | "region">;

/** Far-future stand-in exit for ongoing trips (no exit date recorded). */
function resolveExit(exitDate: string | undefined): Date {
  return exitDate ? parseDate(exitDate) : addDays(new Date(), 3650);
}

/**
 * True when `trip` is the trip being edited. Trip ids are per-traveler copies
 * (and are regenerated on URL decode), so a shared trip is matched by its
 * (entryDate, exitDate, region) coordinates — the identity the rest of the app
 * uses — falling back to the id for a plain single-traveler edit.
 */
function isExcluded(
  trip: Trip,
  excludeTripId: string | undefined,
  excludeTrip: ExcludeTrip | undefined,
): boolean {
  if (excludeTripId !== undefined && trip.id === excludeTripId) return true;
  return (
    excludeTrip !== undefined &&
    trip.entryDate === excludeTrip.entryDate &&
    trip.exitDate === excludeTrip.exitDate &&
    trip.region === excludeTrip.region
  );
}

/**
 * Interior-day ranges of every other trip for the selected travelers, to be
 * disabled on the calendar. The trip being edited is excluded. Trips shorter
 * than three days have no interior day and contribute nothing.
 */
export function blockedTripRanges(
  travelers: Traveler[],
  travelerIds: string[],
  excludeTripId?: string,
  excludeTrip?: ExcludeTrip,
): BlockedRange[] {
  const ranges: BlockedRange[] = [];
  const seen = new Set<string>();

  for (const tid of travelerIds) {
    const traveler = travelers.find((x) => x.id === tid);
    if (!traveler) continue;

    for (const trip of traveler.trips) {
      if (isExcluded(trip, excludeTripId, excludeTrip)) continue;
      const key = `${trip.entryDate}|${trip.exitDate ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const from = addDays(parseDate(trip.entryDate), 1); // first day stays open
      const to = addDays(resolveExit(trip.exitDate), -1); // last day stays open
      if (from <= to) ranges.push({ from, to });
    }
  }

  return ranges;
}

/** True when `date` falls inside any blocked range. */
export function isDateBlocked(date: Date, ranges: BlockedRange[]): boolean {
  return ranges.some((r) => date >= r.from && date <= r.to);
}

/**
 * True when a proposed [entryDate, exitDate] trip overlaps any other trip of the
 * selected travelers by two or more days (a single touching day is allowed).
 */
export function hasBlockingOverlap(
  travelers: Traveler[],
  travelerIds: string[],
  entryDate: string,
  exitDate: string | undefined,
  excludeTripId?: string,
  excludeTrip?: ExcludeTrip,
): boolean {
  const nEntry = parseDate(entryDate);
  const nExit = resolveExit(exitDate);

  for (const tid of travelerIds) {
    const traveler = travelers.find((x) => x.id === tid);
    if (!traveler) continue;

    for (const trip of traveler.trips) {
      if (isExcluded(trip, excludeTripId, excludeTrip)) continue;
      const tEntry = parseDate(trip.entryDate);
      const tExit = resolveExit(trip.exitDate);

      const overlapStart = nEntry > tEntry ? nEntry : tEntry;
      const overlapEnd = nExit < tExit ? nExit : tExit;
      const overlapDays = differenceInCalendarDays(overlapEnd, overlapStart) + 1;
      if (overlapDays >= 2) return true;
    }
  }

  return false;
}
