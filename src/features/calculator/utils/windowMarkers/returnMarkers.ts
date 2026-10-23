/**
 * Return markers: future dates when trips of each milestone length first
 * become possible again in a rolling-window destination, plus a live
 * "max stay today" snapshot at each phase boundary.
 *
 * Runs once per destination: the traveller's trips there, against the
 * rolling window their passport gets there (see rollingLimit.ts). Milestones
 * are six even steps up to the allowance (15/30/…/90 for 90-in-180).
 *
 * ── ALGORITHM ────────────────────────────────────────────────────────────────
 *
 * The timeline is split into phases separated by pending trips to the region:
 *
 *   Phase 0 : timelineStart → day before first relevant trip's entry
 *   Phase n : trip[n].exit+1 → day before trip[n+1].entry
 *   Final   : lastTrip.exit+1 → timelineEnd
 *
 * Within each phase there are no pending trips to the region, so
 * calculateMaxStay(D, historicalTrips) is well-defined for any D in the phase.
 *
 * At each phase boundary we emit an isCurrent snapshot chip (exact max stay
 * on that date). Then we scan forward day-by-day within the phase, calling
 * calculateMaxStay once per day, and record the first date each milestone
 * threshold is crossed.
 *
 * ── WHY DAY-BY-DAY (NOT AN AGING-EVENT SCAN) ─────────────────────────────────
 *
 * Tracking "type-1 events" — historical days aging off the entry window as
 * the entry date advances — correctly handles cases where maxStay increases
 * because a historical day drops off [D-(W-1), D-1].
 *
 * But maxStay(D) also increases via "type-2 events": as D advances, the reach
 * of calculateMaxStay's inner stay-extension scan shifts, bringing historical
 * days into range that were previously just out of reach. The transition date
 * for a historical day d_k at allowance A is D = d_k + W - A — and A itself
 * changes, making upfront enumeration a fixed-point problem.
 *
 * The day-by-day scan avoids this entirely. Phase lengths are bounded by
 * trip gaps and the timeline extent, and each calculateMaxStay call iterates
 * at most maxDays times, so the cost is negligible and correctness is
 * trivially guaranteed.
 */

import type { Traveler, Trip, VisaRegion } from "@/types";
import {
  parseDate,
  formatDate,
  addDays,
  subDays,
  differenceInCalendarDays,
} from "@/features/calculator/utils/dates";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";
import { createRollingWindowCalculator } from "@/features/calculator/utils/rollingWindowCalculator";
import {
  effectiveAllowance,
  resolveRollingWindow,
  thresholdsFor,
} from "./rollingLimit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReturnMarker {
  region: VisaRegion;
  date: Date;
  /** Pixel offset from the top of the canvas. */
  top: number;
  /**
   * isCurrent: exact max stay on this date (phase-boundary snapshot).
   * !isCurrent: milestone threshold first achievable on this date.
   */
  days: number;
  isCurrent: boolean;
  /** Longest stay the region's rule ever allows — scales the chip's colour. */
  allowance: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeReturnMarkers(
  traveler: Traveler,
  region: VisaRegion,
  timelineStart: Date,
  timelineEnd: Date,
): ReturnMarker[] {
  const regionTrips = traveler.trips.filter((t) => t.region === region);

  // ── Build phases ─────────────────────────────────────────────────────────────

  const insideAtStart = regionTrips.some((t) => !t.exitDate);

  // "Relevant" trips: any trip to the region whose exit date is on or after
  // timelineStart. This covers:
  //   1. Past trips that exit within the visible range
  //   2. Straddling trips — entryDate < timelineStart, exitDate >= timelineStart
  //   3. Future trips entirely ahead of timelineStart
  //
  // For a straddling trip, Phase 0's end = subDays(entryDate, 1) < timelineStart,
  // so the `cappedEnd >= timelineStart` guard naturally skips Phase 0. The phase
  // that opens after the trip exits correctly includes it in its historical set.
  const futureTrips = regionTrips
    .filter((t) => t.exitDate && parseDate(t.exitDate) >= timelineStart)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1));

  type Phase = { start: Date; end: Date; historical: Trip[] };
  const phases: Phase[] = [];

  // Phase 0: timelineStart → day before first relevant trip (or timelineEnd).
  // Skipped if currently inside the region — re-entry date is unknown.
  if (!insideAtStart) {
    const p0End =
      futureTrips.length > 0
        ? subDays(parseDate(futureTrips[0].entryDate), 1)
        : timelineEnd;
    const cappedEnd = p0End < timelineEnd ? p0End : timelineEnd;
    if (cappedEnd >= timelineStart) {
      // Historical: trips to the region that ended before timelineStart.
      const hist = regionTrips.filter(
        (t) => t.exitDate && parseDate(t.exitDate) < timelineStart,
      );
      phases.push({ start: timelineStart, end: cappedEnd, historical: hist });
    }
  }

  // Phases after each future trip exits.
  for (let i = 0; i < futureTrips.length; i++) {
    const tripExit = parseDate(futureTrips[i].exitDate!);
    const phaseStart = addDays(tripExit, 1);
    const rawEnd =
      i + 1 < futureTrips.length
        ? subDays(parseDate(futureTrips[i + 1].entryDate), 1)
        : timelineEnd;
    const cappedEnd = rawEnd < timelineEnd ? rawEnd : timelineEnd;
    if (phaseStart > cappedEnd || phaseStart > timelineEnd) continue;

    // Historical: all trips to the region that ended on or before this exit.
    const hist = regionTrips.filter(
      (t) => !t.exitDate || parseDate(t.exitDate) <= tripExit,
    );
    phases.push({ start: phaseStart, end: cappedEnd, historical: hist });
  }

  // ── Process each phase ────────────────────────────────────────────────────────

  const allMarkers: ReturnMarker[] = [];

  for (const phase of phases) {
    if (phase.start > timelineEnd) break;

    // The rule in force when the phase opens — passport entitlements can carry
    // temporal windows, so it is resolved per phase, not once per region.
    const config = resolveRollingWindow(
      region,
      traveler.passportCode,
      formatDate(phase.start),
    );
    if (!config) continue;

    const { calculateMaxStay } = createRollingWindowCalculator(config);
    const allowance = effectiveAllowance(config);
    const maxStayOn = (date: Date): number => {
      const result = calculateMaxStay(formatDate(date), phase.historical);
      return result.canEnter ? Math.min(result.maxDays, allowance) : 0;
    };

    // Snapshot at phase start.
    const maxAtStart = maxStayOn(phase.start);
    allMarkers.push({
      region,
      date: phase.start,
      top: dateToTop(phase.start, timelineStart),
      days: maxAtStart,
      isCurrent: true,
      allowance,
    });

    // Thresholds remaining above maxAtStart.
    const pending = thresholdsFor(allowance).filter((t) => t > maxAtStart);
    if (pending.length === 0) continue;

    // Day-by-day scan within the phase.
    const phaseDays = differenceInCalendarDays(phase.end, phase.start);
    let pendingIdx = 0; // index into pending array (sorted ascending)

    for (let d = 1; d <= phaseDays && pendingIdx < pending.length; d++) {
      const date = addDays(phase.start, d);
      const maxDays = maxStayOn(date);

      // A single day can cross multiple thresholds (e.g. 56→90 in one step);
      // only the highest is worth a chip — "up to 90d from here" says it all.
      let crossed = 0;
      while (pendingIdx < pending.length && maxDays >= pending[pendingIdx]) {
        crossed = pending[pendingIdx];
        pendingIdx++;
      }
      if (crossed > 0) {
        allMarkers.push({
          region,
          date,
          top: dateToTop(date, timelineStart),
          days: crossed,
          isCurrent: false,
          allowance,
        });
      }
    }
  }

  return allMarkers;
}
