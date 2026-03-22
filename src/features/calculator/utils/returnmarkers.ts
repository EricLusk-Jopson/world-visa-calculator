/**
 * Return markers: future dates when Schengen trips of 15/30/45/60/75/90 days
 * first become possible again, plus a live "max stay today" snapshot chip at
 * each phase boundary.
 *
 * ── ALGORITHM ────────────────────────────────────────────────────────────────
 *
 * The timeline is split into phases separated by pending Schengen trips:
 *
 *   Phase 0 : today         → day before first pending trip's entry
 *   Phase n : trip[n].exit+1 → day before trip[n+1].entry
 *   Final   : lastTrip.exit+1 → timelineEnd
 *
 * Within each phase there are no pending Schengen trips, so
 * calculateMaxStay(D, historicalTrips) is well-defined for any D in the phase.
 *
 * At each phase boundary we emit an isCurrent snapshot chip (exact max stay
 * on that date). Then we scan forward day-by-day within the phase, calling
 * calculateMaxStay once per day, and record the first date each 15-day
 * milestone threshold is crossed.
 *
 * ── WHY DAY-BY-DAY (NOT THE PREVIOUS AGING-EVENT SCAN) ───────────────────────
 *
 * The previous approach tracked "type-1 events" — historical days aging off
 * the entry window as the entry date advances. This correctly handles cases
 * where maxStay increases because a historical day drops off [D-179, D-1].
 *
 * But maxStay(D) also increases via "type-2 events": as D advances, the reach
 * of calculateMaxStay's inner stay-extension scan shifts, bringing historical
 * days into range that were previously just out of reach. The transition date
 * for a historical day d_k at allowance A is D = d_k + 180 - A — and A itself
 * changes, making upfront enumeration a fixed-point problem.
 *
 * The day-by-day scan avoids this entirely. Phase lengths are bounded by
 * trip gaps and the timeline extent — typically 30–90 days. At 90 inner
 * iterations per calculateMaxStay call:
 *
 *   90 phase-days × 90 iterations = 8,100 ops/phase
 *
 * This is negligible, and correctness is trivially guaranteed.
 */

import { VisaRegion } from "@/types";
import type { Traveler, Trip } from "@/types";
import {
  today,
  parseDate,
  formatDate,
  addDays,
  subDays,
  differenceInCalendarDays,
} from "@/features/calculator/utils/dates";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";
import { calculateMaxStay } from "./schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReturnMarker {
  date: Date;
  /** Pixel offset from the top of the canvas. */
  top: number;
  /**
   * isCurrent: exact max stay on this date (phase-boundary snapshot).
   * !isCurrent: 15-day milestone threshold first achievable on this date.
   */
  days: number;
  isCurrent: boolean;
}

/** Day-count milestones used to place return-opportunity markers on the timeline. */
export const RETURN_MARKER_THRESHOLDS = [15, 30, 45, 60, 75, 90] as const;

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeReturnMarkers(
  traveler: Traveler,
  timelineStart: Date,
  timelineEnd: Date,
): ReturnMarker[] {
  const todayDate = today();
  const allSchengen = traveler.trips.filter(
    (t) => t.region === VisaRegion.Schengen,
  );

  // ── Build phases ─────────────────────────────────────────────────────────────

  const insideSchengenNow = allSchengen.some((t) => !t.exitDate);

  // BUG FIX: use >= so that a trip starting exactly today is included in
  // futureTrips. Previously `> todayDate` excluded same-day entries, causing
  // the trip to be invisible to both the futureTrips phase builder AND the
  // Phase 0 historical set (which only includes trips whose exit < today).
  // The result was Phase 0 running with an incomplete historical record,
  // letting the algorithm conclude that 90 days were available when in fact
  // the traveler was already mid-trip.
  //
  // With >=, a trip starting today is treated as a pending future trip.
  // Phase 0's end becomes (today − 1), which is before today, so the
  // `cappedEnd >= todayDate` guard naturally skips Phase 0. The phase that
  // runs after the trip exits then correctly includes it in its historical set.
  const futureTrips = allSchengen
    .filter((t) => t.exitDate && parseDate(t.entryDate) >= todayDate)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1));

  type Phase = { start: Date; end: Date; historical: Trip[] };
  const phases: Phase[] = [];

  // Phase 0: today → day before first pending trip (or timelineEnd).
  // Skipped if currently inside Schengen — re-entry date is unknown.
  if (!insideSchengenNow) {
    const p0End =
      futureTrips.length > 0
        ? subDays(parseDate(futureTrips[0].entryDate), 1)
        : timelineEnd;
    const cappedEnd = p0End < timelineEnd ? p0End : timelineEnd;
    if (cappedEnd >= todayDate) {
      // Historical: Schengen trips that ended before today.
      const hist = allSchengen.filter(
        (t) => t.exitDate && parseDate(t.exitDate) < todayDate,
      );
      phases.push({ start: todayDate, end: cappedEnd, historical: hist });
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

    // Historical: all Schengen trips that ended on or before this trip's exit.
    const hist = allSchengen.filter(
      (t) => !t.exitDate || parseDate(t.exitDate) <= tripExit,
    );
    phases.push({
      start: phaseStart,
      end: cappedEnd < timelineEnd ? cappedEnd : timelineEnd,
      historical: hist,
    });
  }

  // ── Process each phase ────────────────────────────────────────────────────────

  const allMarkers: ReturnMarker[] = [];

  for (const phase of phases) {
    if (phase.start > timelineEnd) break;

    // Snapshot at phase start.
    const startResult = calculateMaxStay(
      formatDate(phase.start),
      phase.historical,
    );
    const maxAtStart = startResult.canEnter ? startResult.maxDays : 0;

    allMarkers.push({
      date: phase.start,
      top: dateToTop(phase.start, timelineStart),
      days: maxAtStart,
      isCurrent: true,
    });

    // Thresholds remaining above maxAtStart.
    const pending = RETURN_MARKER_THRESHOLDS.filter((t) => t > maxAtStart);
    if (pending.length === 0) continue;

    // Day-by-day scan within the phase.
    const phaseDays = differenceInCalendarDays(phase.end, phase.start);
    let pendingIdx = 0; // index into pending array (sorted ascending)

    for (let d = 1; d <= phaseDays && pendingIdx < pending.length; d++) {
      const date = addDays(phase.start, d);
      const result = calculateMaxStay(formatDate(date), phase.historical);
      const maxDays = result.canEnter ? result.maxDays : 0;

      // A single day can cross multiple thresholds (e.g. 56→90 in one step).
      while (pendingIdx < pending.length && maxDays >= pending[pendingIdx]) {
        allMarkers.push({
          date,
          top: dateToTop(date, timelineStart),
          days: pending[pendingIdx],
          isCurrent: false,
        });
        pendingIdx++;
      }
    }
  }

  return allMarkers;
}
