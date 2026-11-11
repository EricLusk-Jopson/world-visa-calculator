/**
 * Overstay preview for the trip date pickers: would a trip on these dates put
 * any of the selected travelers over their stay limit?
 *
 * Built on computeTravelerDurations, so it applies exactly the rules the
 * Stay Duration summary shows (rolling windows, per-visit limits, calendar
 * budgets). Results are memoised per (entry, exit) pair, so a calendar can ask
 * about every visible day as it scrolls without recomputing.
 */

import { VisaRegion } from "@/types";
import type { Traveler } from "@/types";
import { computeTravelerDurations } from "./tripDuration";
import type { ComputeTravelerDurationsParams } from "./tripDuration";
import { parseDate, formatDate, addDays } from "@/features/calculator/utils/dates";

/** How far past the entry date the exit-date search looks (≈3 years). */
const EXIT_HORIZON_DAYS = 1096;

export interface OverstayPreviewParams {
  region: VisaRegion;
  travelers: Traveler[];
  travelerIds: string[];
  excludeTripId?: ComputeTravelerDurationsParams["excludeTripId"];
  excludeTrip?: ComputeTravelerDurationsParams["excludeTrip"];
}

export interface OverstayPreview {
  /** True when a trip from `entry` to `exit` (ISO, inclusive) overstays for any traveler. */
  overstays: (entry: string, exit: string) => boolean;
  /**
   * The first exit date that overstays for a trip entering on `entry`, or null
   * if none does within the horizon. Every later exit overstays too: a longer
   * trip only adds days against the same limit.
   */
  firstOverstayExit: (entry: string) => string | null;
}

const NEVER: OverstayPreview = {
  overstays: () => false,
  firstOverstayExit: () => null,
};

export function createOverstayPreview(params: OverstayPreviewParams): OverstayPreview {
  const { region, travelers, travelerIds, excludeTripId, excludeTrip } = params;
  if (region === VisaRegion.Elsewhere || travelerIds.length === 0) return NEVER;

  const rangeCache = new Map<string, boolean>();
  const thresholdCache = new Map<string, string | null>();

  function overstays(entry: string, exit: string): boolean {
    const key = `${entry}|${exit}`;
    let hit = rangeCache.get(key);
    if (hit === undefined) {
      hit = computeTravelerDurations({
        region,
        travelers,
        travelerIds,
        entryDate: entry,
        exitDate: exit,
        destination: "",
        excludeTripId,
        excludeTrip,
      }).some((d) => d.tracked && d.overstay);
      rangeCache.set(key, hit);
    }
    return hit;
  }

  function firstOverstayExit(entry: string): string | null {
    if (thresholdCache.has(entry)) return thresholdCache.get(entry)!;
    const start = parseDate(entry);
    const exitAt = (offset: number) => formatDate(addDays(start, offset));

    let result: string | null = null;
    if (overstays(entry, entry)) {
      result = entry;
    } else if (overstays(entry, exitAt(EXIT_HORIZON_DAYS))) {
      // Binary search: lo is known safe, hi is known to overstay.
      let lo = 0;
      let hi = EXIT_HORIZON_DAYS;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (overstays(entry, exitAt(mid))) hi = mid;
        else lo = mid;
      }
      result = exitAt(hi);
    }
    thresholdCache.set(entry, result);
    return result;
  }

  return { overstays, firstOverstayExit };
}
