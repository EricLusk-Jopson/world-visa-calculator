import { VisaRegion } from "@/types";
import type { Traveler } from "@/types";
import {
  today,
  parseDate,
  formatDate,
  subDays,
} from "@/features/calculator/utils/dates";
import { getDaysUsedOnDate } from "@/features/calculator/utils/schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusVariant = "safe" | "caution" | "danger";

export interface TravelerStatus {
  daysUsed: number;
  daysRemaining: number;
  variant: StatusVariant;
  /** YYYY-MM-DD — the start of the 180-day window evaluated at refDate. */
  windowStart: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStatusVariant(daysRemaining: number): StatusVariant {
  if (daysRemaining >= 30) return "safe";
  if (daysRemaining >= 10) return "caution";
  return "danger";
}

// ─── Status computation ───────────────────────────────────────────────────────

/**
 * Computes Schengen allowance for a traveler as-of `refDate`.
 * Delegates the day-counting to getDaysUsedOnDate in schengen.ts so the
 * rolling-window logic lives in exactly one place.
 */
export function computeTravelerStatus(
  traveler: Traveler,
  refDate: Date = today(),
): TravelerStatus {
  const schengenTrips = traveler.trips.filter(
    (t) => t.region === VisaRegion.Schengen,
  );

  const daysUsed = getDaysUsedOnDate(formatDate(refDate), schengenTrips);
  const daysRemaining = Math.max(0, 90 - daysUsed);

  return {
    daysUsed,
    daysRemaining,
    variant: getStatusVariant(daysRemaining),
    windowStart: formatDate(subDays(refDate, 179)),
  };
}

/**
 * Computes days remaining at the time of a specific trip's exit.
 * Used for the "Xd left" chip on trip cards.
 */
export function computeStatusAtTripExit(
  traveler: Traveler,
  tripId: string,
): TravelerStatus {
  const trip = traveler.trips.find((t) => t.id === tripId);

  if (!trip) {
    return {
      daysUsed: 0,
      daysRemaining: 90,
      variant: "safe",
      windowStart: formatDate(subDays(today(), 179)),
    };
  }

  const refDate = trip.exitDate ? parseDate(trip.exitDate) : today();
  return computeTravelerStatus(traveler, refDate);
}
