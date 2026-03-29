/**
 * Aging-out markers: dates when historical Schengen trips start exiting the
 * 180-day rolling window, progressively freeing up allowance.
 *
 * A trip's first day (entryDate) drops out of [D−179, D−1] on the first D
 * where D−179 > entryDate, i.e. D = entryDate + 180. From that date onward,
 * one more day of the trip becomes available each calendar day until the
 * last day (exitDate) ages out at exitDate + 180.
 *
 * We place the marker at entryDate + 180 — the first moment any benefit is
 * felt — and label it "+Xd" where X is the full trip duration. This is the
 * date that typically triggers the "wild jump" in max stay.
 */

import type { Traveler } from "@/types";
import { VisaRegion } from "@/types";
import {
  parseDate,
  addDays,
  countTripDays,
} from "@/features/calculator/utils/dates";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgingMarker {
  /** Pixel offset from the top of the canvas. */
  top: number;
  /** Full trip duration in days — shown as "+Xd" on the chip. */
  tripDays: number;
  /** Display name for the "Y ages out" label. */
  destination: string;
  /** For tooltip context. */
  entryDate: string;
  exitDate: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeAgingMarkers(
  traveler: Traveler,
  timelineStart: Date,
  timelineEnd: Date,
): AgingMarker[] {
  return traveler.trips
    .filter((t) => t.region === VisaRegion.Schengen && t.exitDate)
    .flatMap((trip) => {
      const entry = parseDate(trip.entryDate);
      const exit = parseDate(trip.exitDate!);
      const agingStart = addDays(entry, 180);

      // Show markers for any trip whose aging-start falls within the visible
      // timeline range, regardless of whether it is past or future.
      if (agingStart < timelineStart || agingStart > timelineEnd) return [];

      const tripDays = countTripDays(entry, exit);

      return [
        {
          top: dateToTop(agingStart, timelineStart),
          tripDays,
          destination: trip.destination || "Trip",
          entryDate: trip.entryDate,
          exitDate: trip.exitDate!,
        },
      ];
    });
}
