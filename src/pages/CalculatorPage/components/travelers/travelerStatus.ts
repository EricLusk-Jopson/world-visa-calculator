import { VisaRegion } from "@/types";
import type { Traveler, Trip } from "@/types";
import {
  today,
  parseDate,
  formatDate,
  subDays,
  differenceInCalendarDays,
} from "@/features/calculator/utils/dates";
import {
  getDaysUsedOnDate,
  calculateMaxStay,
} from "@/features/calculator/utils/schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusVariant = "safe" | "caution" | "danger";

export interface TravelerStatus {
  daysUsed: number;
  daysRemaining: number;
  variant: StatusVariant;
  /** YYYY-MM-DD — the start of the 180-day window evaluated at refDate. */
  windowStart: string;
}

export interface TripContribution {
  tripId: string;
  destination?: string;
  entryDate: string;
  exitDate?: string;
  /** Days this trip contributes to the 180-day window at the new trip's entry. */
  daysInWindow: number;
  /**
   * Days of this trip that age out of the back of the window during the
   * user's specified trip duration (entry → exitDate).
   */
  daysAgingOutDuringTrip: number;
  /**
   * Days of this trip that age out after the specified exit date but before
   * the maximum possible exit date. These only become "free" if the traveler
   * extends beyond their planned exit.
   */
  daysAgingOutOverMaxStay: number;
}

export interface ImpactBreakdown {
  /**
   * Historical trips with at least one day in the window at entry.
   * These are the trips costing the traveler days before the new trip begins.
   */
  previousTrips: TripContribution[];
  /** Sum of daysInWindow across previousTrips. Corresponds to "a" in 90 − a + b − c. */
  previousDaysTotal: number;

  /**
   * Historical trips that have days aging out during the specified trip duration.
   * Sorted by entry date.
   */
  agingOutDuringTripTrips: TripContribution[];
  /** Sum of daysAgingOutDuringTrip across agingOutDuringTripTrips. */
  agingOutDuringTripTotal: number;

  /**
   * Historical trips that have days aging out after the specified exit date,
   * up to the maximum possible exit date. Sorted by entry date.
   */
  agingOutOverMaxStayTrips: TripContribution[];
  /** Sum of daysAgingOutOverMaxStay across agingOutOverMaxStayTrips. */
  agingOutOverMaxStayTotal: number;

  /** Total days freed across both aging-out windows. Corresponds to "b". */
  agingOutTotal: number;

  /** Duration of the new trip in calendar days (entry and exit inclusive). Corresponds to "c". */
  currentTripDays: number;

  /**
   * Additional days the traveler can extend beyond the specified exit date.
   * Equivalent to calculateMaxStay(entryDate).maxDays − currentTripDays.
   */
  daysRemaining: number;

  /**
   * The latest legal exit date if the traveler stays as long as possible.
   * Null only when canEnter is false (no allowance at all).
   */
  maxExitDate: string | null;
}

// ─── Status thresholds ────────────────────────────────────────────────────────

/** Minimum days remaining to show "safe" status. */
export const STATUS_SAFE_THRESHOLD = 30;
/** Minimum days remaining to show "caution" status (below this = "danger"). */
export const STATUS_CAUTION_THRESHOLD = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStatusVariant(daysRemaining: number): StatusVariant {
  if (daysRemaining >= STATUS_SAFE_THRESHOLD) return "safe";
  if (daysRemaining >= STATUS_CAUTION_THRESHOLD) return "caution";
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

// ─── Impact breakdown ─────────────────────────────────────────────────────────

/**
 * Produces a structured breakdown of how days remaining is calculated for a
 * proposed trip. This is the data behind the expandable "After this trip"
 * section in the trip modal.
 *
 * Three components:
 *   a = previousDaysTotal  — historical Schengen days already in the window
 *   b = agingOutTotal      — days that fall off the window before max stay exit
 *   c = currentTripDays    — duration of the proposed trip
 *
 * Result: 90 − a + b − c = daysRemaining (= days the traveler can extend beyond exitDate)
 *
 * The aging-out days are further split into two categories:
 *   b1 = agingOutDuringTripTotal   — freed within the specified trip duration
 *   b2 = agingOutOverMaxStayTotal  — freed only if the traveler extends past exitDate
 *   b  = b1 + b2
 *
 * @param entryDate        YYYY-MM-DD proposed entry date.
 * @param exitDate         YYYY-MM-DD proposed exit date. Pass undefined for ongoing trips
 *                         (today is used as the reference exit).
 * @param historicalTrips  Schengen trips excluding the proposed trip itself.
 */
export function computeImpactBreakdown(
  entryDate: string,
  exitDate: string | undefined,
  historicalTrips: Trip[],
): ImpactBreakdown {
  const entry = parseDate(entryDate);
  const exit = exitDate ? parseDate(exitDate) : today();

  // Maximum possible exit given the historical record.
  const maxStay = calculateMaxStay(entryDate, historicalTrips);
  const maxExitDate = maxStay.maxExitDate
    ? parseDate(maxStay.maxExitDate)
    : exit;

  const windowAtEntryStart = subDays(entry, 179);
  const entryMinus1 = subDays(entry, 1);

  // Two aging-out cutoffs:
  //   duringTrip   — days that fall off before the specified exit
  //   overMaxStay  — days that fall off between specified exit and max exit
  // A historical day H ages out when H + 180 ≤ referenceExit, i.e. H ≤ referenceExit − 180.
  const duringTripCutoff = subDays(exit, 180);
  const overMaxStayCutoff = subDays(maxExitDate, 180);

  const contributions: TripContribution[] = [];

  for (const trip of historicalTrips) {
    const tEntry = parseDate(trip.entryDate);
    const tExit = trip.exitDate ? parseDate(trip.exitDate) : entryMinus1;

    // ── Days in window at entry ───────────────────────────────────────────
    const inWinStart =
      tEntry < windowAtEntryStart ? windowAtEntryStart : tEntry;
    const inWinEnd = tExit > entryMinus1 ? entryMinus1 : tExit;
    const daysInWindow =
      inWinStart <= inWinEnd
        ? differenceInCalendarDays(inWinEnd, inWinStart) + 1
        : 0;

    // ── Days aging out during the specified trip ───────────────────────────
    // Overlap of [tEntry, tExit] with [windowAtEntryStart, duringTripCutoff].
    let daysAgingOutDuringTrip = 0;
    if (duringTripCutoff >= windowAtEntryStart) {
      const aoStart = tEntry < windowAtEntryStart ? windowAtEntryStart : tEntry;
      const aoEnd = tExit > duringTripCutoff ? duringTripCutoff : tExit;
      daysAgingOutDuringTrip =
        aoStart <= aoEnd ? differenceInCalendarDays(aoEnd, aoStart) + 1 : 0;
    }

    // ── Days aging out between specified exit and max stay exit ───────────
    // Overlap of [tEntry, tExit] with [duringTripCutoff + 1, overMaxStayCutoff].
    // These days only become free if the traveler extends past their planned exit.
    let daysAgingOutOverMaxStay = 0;
    const overMaxStayStart = subDays(duringTripCutoff, -1); // duringTripCutoff + 1
    if (
      overMaxStayCutoff >= overMaxStayStart &&
      overMaxStayCutoff >= windowAtEntryStart
    ) {
      const aoStart = tEntry < overMaxStayStart ? overMaxStayStart : tEntry;
      const aoEnd = tExit > overMaxStayCutoff ? overMaxStayCutoff : tExit;
      daysAgingOutOverMaxStay =
        aoStart <= aoEnd ? differenceInCalendarDays(aoEnd, aoStart) + 1 : 0;
    }

    if (
      daysInWindow > 0 ||
      daysAgingOutDuringTrip > 0 ||
      daysAgingOutOverMaxStay > 0
    ) {
      contributions.push({
        tripId: trip.id,
        destination: trip.destination,
        entryDate: trip.entryDate,
        exitDate: trip.exitDate,
        daysInWindow,
        daysAgingOutDuringTrip,
        daysAgingOutOverMaxStay,
      });
    }
  }

  const byEntryDate = (a: TripContribution, b: TripContribution) =>
    a.entryDate < b.entryDate ? -1 : 1;

  const previousTrips = contributions
    .filter((c) => c.daysInWindow > 0)
    .sort(byEntryDate);

  const agingOutDuringTripTrips = contributions
    .filter((c) => c.daysAgingOutDuringTrip > 0)
    .sort(byEntryDate);

  const agingOutOverMaxStayTrips = contributions
    .filter((c) => c.daysAgingOutOverMaxStay > 0)
    .sort(byEntryDate);

  const previousDaysTotal = previousTrips.reduce(
    (sum, c) => sum + c.daysInWindow,
    0,
  );
  const agingOutDuringTripTotal = agingOutDuringTripTrips.reduce(
    (sum, c) => sum + c.daysAgingOutDuringTrip,
    0,
  );
  const agingOutOverMaxStayTotal = agingOutOverMaxStayTrips.reduce(
    (sum, c) => sum + c.daysAgingOutOverMaxStay,
    0,
  );
  const agingOutTotal = agingOutDuringTripTotal + agingOutOverMaxStayTotal;
  const currentTripDays = differenceInCalendarDays(exit, entry) + 1;

  const daysRemaining = Math.max(0, maxStay.maxDays - currentTripDays);

  return {
    previousTrips,
    previousDaysTotal,
    agingOutDuringTripTrips,
    agingOutDuringTripTotal,
    agingOutOverMaxStayTrips,
    agingOutOverMaxStayTotal,
    agingOutTotal,
    currentTripDays,
    daysRemaining,
    maxExitDate: maxStay.maxExitDate,
  };
}
