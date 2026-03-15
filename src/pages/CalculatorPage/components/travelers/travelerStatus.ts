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
  calculateMaxStay,
  getDaysUsedOnDate,
} from "@/features/calculator/utils/schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatusVariant = "safe" | "caution" | "danger";

export interface TravelerStatus {
  daysUsed: number;
  /**
   * Additional days the traveler can extend beyond the specified exit date.
   * Equivalent to calculateMaxStay(entryDate).maxDays − currentTripDays.
   * Note: this is NOT "days remaining in allowance after this exit" — it is
   * "how much further you could push the exit if you chose to stay."
   */
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
  /** Days of this trip that age out during the new trip's stay. */
  daysAgingOut: number;
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
   * Historical trips that have days aging out of the back of the window
   * as the new stay progresses — these free up additional days.
   */
  agingOutTrips: TripContribution[];
  /** Sum of daysAgingOut across agingOutTrips. Corresponds to "b". */
  agingOutTotal: number;

  /** Duration of the new trip in calendar days (entry and exit inclusive). Corresponds to "c". */
  currentTripDays: number;

  /**
   * Days remaining after the trip: 90 − previousDaysTotal + agingOutTotal − currentTripDays.
   * Mathematically equivalent to computeTravelerStatus at exit date when no overlaps exist.
   */
  daysRemaining: number;
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

// ─── Impact breakdown ─────────────────────────────────────────────────────────

/**
 * Produces a structured breakdown of how days remaining is calculated for a
 * proposed trip. This is the data behind the expandable "After this trip"
 * section in the trip modal.
 *
 * Three components:
 *   a = previousDaysTotal  — historical Schengen days already in the window
 *   b = agingOutTotal      — those days that fall off the window during the stay
 *   c = currentTripDays    — duration of the proposed trip
 *
 * Result: 90 − a + b − c = daysRemaining
 *
 * This is algebraically equivalent to getDaysUsedOnDate at the exit date
 * provided no historical trip overlaps with the proposed stay.
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

  // The maximum possible exit date given historical trips — this is what
  // determines how far forward the aging-out window actually reaches.
  const maxStay = calculateMaxStay(entryDate, historicalTrips);
  const maxExitDate = maxStay.maxExitDate
    ? parseDate(maxStay.maxExitDate)
    : exit;

  const windowAtEntryStart = subDays(entry, 179);
  const entryMinus1 = subDays(entry, 1);

  // A historical day H ages out when H + 180 ≤ maxExitDate, i.e. H ≤ maxExitDate − 180.
  // Using maxExitDate (not the specified exit) means we capture every historical
  // day that will fall off the window before the stay is truly exhausted —
  // including days that only age out after the user's specified exit date.
  const agingOutCutoff = subDays(maxExitDate, 180);

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

    // ── Days aging out during the maximum possible stay ───────────────────
    let daysAgingOut = 0;
    if (agingOutCutoff >= windowAtEntryStart) {
      const aoStart = tEntry < windowAtEntryStart ? windowAtEntryStart : tEntry;
      const aoEnd = tExit > agingOutCutoff ? agingOutCutoff : tExit;
      daysAgingOut =
        aoStart <= aoEnd ? differenceInCalendarDays(aoEnd, aoStart) + 1 : 0;
    }

    if (daysInWindow > 0 || daysAgingOut > 0) {
      contributions.push({
        tripId: trip.id,
        destination: trip.destination,
        entryDate: trip.entryDate,
        exitDate: trip.exitDate,
        daysInWindow,
        daysAgingOut,
      });
    }
  }

  const previousTrips = contributions.filter((c) => c.daysInWindow > 0);
  const agingOutTrips = contributions.filter((c) => c.daysAgingOut > 0);

  const previousDaysTotal = previousTrips.reduce(
    (sum, c) => sum + c.daysInWindow,
    0,
  );
  const agingOutTotal = agingOutTrips.reduce(
    (sum, c) => sum + c.daysAgingOut,
    0,
  );
  const currentTripDays = differenceInCalendarDays(exit, entry) + 1;

  // daysRemaining = how many additional days you can extend beyond exitDate.
  // Equivalent to maxStay.maxDays − currentTripDays, and also to the formula
  // 90 − previousDaysTotal + agingOutTotal − currentTripDays now that
  // agingOutTotal is computed against maxExitDate rather than the specified exit.
  const daysRemaining = Math.max(0, maxStay.maxDays - currentTripDays);

  return {
    previousTrips,
    previousDaysTotal,
    agingOutTrips,
    agingOutTotal,
    currentTripDays,
    daysRemaining,
  };
}
