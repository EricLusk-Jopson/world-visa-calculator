/**
 * Aging-out markers: dates when historical trips to a rolling-window
 * destination start exiting the window, progressively freeing up allowance.
 *
 * A trip's first day (entryDate) drops out of [D−(W−1), D−1] on the first D
 * where D−(W−1) > entryDate, i.e. D = entryDate + W, where W is the window
 * the traveller's passport gets there (180 for 90-in-180, 365 for Armenia's
 * 180-in-365). From that date onward, one more day of the trip becomes
 * available each calendar day until the last day ages out at exitDate + W.
 *
 * We place the marker at entryDate + W — the first moment any benefit is
 * felt — and label it "+Xd" where X is the full trip duration. This is the
 * date that typically triggers the "wild jump" in max stay.
 */

import type { Traveler, VisaRegion } from "@/types";
import {
  parseDate,
  addDays,
  countTripDays,
} from "@/features/calculator/utils/dates";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";
import { resolveRollingWindow } from "./rollingLimit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgingMarker {
  region: VisaRegion;
  /** The date the trip's first day leaves the window. */
  date: Date;
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
  region: VisaRegion,
  timelineStart: Date,
  timelineEnd: Date,
): AgingMarker[] {
  return traveler.trips
    .filter((t) => t.region === region && t.exitDate)
    .flatMap((trip) => {
      // The window the trip counted against is the one in force when it began.
      const config = resolveRollingWindow(
        region,
        traveler.passportCode,
        trip.entryDate,
      );
      if (!config) return [];

      const entry = parseDate(trip.entryDate);
      const exit = parseDate(trip.exitDate!);
      const agingStart = addDays(entry, config.windowSize);

      // Show markers for any trip whose aging-start falls within the visible
      // timeline range, regardless of whether it is past or future.
      if (agingStart < timelineStart || agingStart > timelineEnd) return [];

      return [
        {
          region,
          date: agingStart,
          top: dateToTop(agingStart, timelineStart),
          tripDays: countTripDays(entry, exit),
          destination: trip.destination || "Trip",
          entryDate: trip.entryDate,
          exitDate: trip.exitDate!,
        },
      ];
    });
}
