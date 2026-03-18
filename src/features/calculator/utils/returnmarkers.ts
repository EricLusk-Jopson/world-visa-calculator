import { VisaRegion } from "@/types";
import type { Traveler } from "@/types";
import {
  today,
  formatDate,
  addDays,
  differenceInCalendarDays,
} from "@/features/calculator/utils/dates";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";
import { calculateMaxStay } from "./schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReturnMarker {
  /** Pixel offset from the top of the canvas. */
  top: number;
  /** Trip duration this marker represents (10, 20, 30 … 90). */
  days: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THRESHOLDS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return the set of markers to render on the timeline for one traveler.
 *
 * For each threshold T in [10, 20, … 90], finds the earliest future date where
 * `calculateMaxStay` returns maxDays ≥ T. This is the same calculation used by
 * the date picker — it correctly accounts for historical Schengen days aging
 * off the rolling 180-day window as the proposed stay progresses, rather than
 * naively computing 90 − daysUsed.
 *
 * Only thresholds above the traveler's *current* max stay are included — those
 * already achievable today need no future marker.
 *
 * @param traveler      The traveler to compute for.
 * @param timelineStart The timeline origin date (for pixel conversion).
 * @param timelineEnd   Scan up to this date.
 */
export function computeReturnMarkers(
  traveler: Traveler,
  timelineStart: Date,
  timelineEnd: Date,
): ReturnMarker[] {
  // Only Schengen trips count against the allowance.
  const schengenTrips = traveler.trips.filter(
    (t) => t.region === VisaRegion.Schengen,
  );

  const fromDate = today();

  // Determine the traveler's current maximum stay so we only show markers for
  // durations that aren't yet achievable today.
  const currentResult = calculateMaxStay(formatDate(fromDate), schengenTrips);
  const currentMax = currentResult.canEnter ? currentResult.maxDays : 0;

  const pending = THRESHOLDS.filter((t) => t > currentMax);
  if (pending.length === 0) return [];

  const markers: ReturnMarker[] = [];
  const found = new Set<number>();
  const totalDays = differenceInCalendarDays(timelineEnd, fromDate);

  for (let i = 1; i <= totalDays && found.size < pending.length; i++) {
    const date = addDays(fromDate, i);
    const result = calculateMaxStay(formatDate(date), schengenTrips);
    const maxDays = result.canEnter ? result.maxDays : 0;

    for (const threshold of pending) {
      if (!found.has(threshold) && maxDays >= threshold) {
        found.add(threshold);
        markers.push({
          top: dateToTop(date, timelineStart),
          days: threshold,
        });
      }
    }
  }

  return markers;
}
