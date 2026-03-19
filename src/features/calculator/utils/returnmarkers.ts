/**
 * Return markers: when Schengen trips of 15/30/45/60/75/90 days first become
 * possible again, plus a live "max stay today" snapshot chip at each phase
 * boundary.
 *
 * ── DATA STRUCTURE ──────────────────────────────────────────────────────────
 *
 * A single Uint8Array covers every calendar day from today−179 through
 * timelineEnd. arr[i] = 1 if day (arrayStart + i) was/is a Schengen day,
 * 0 otherwise. All completed and pending Schengen trips are written in.
 *
 * A prefix-sum array makes any window sum O(1):
 *   sum(arr[a..b]) = prefix[b+1] − prefix[a]
 *
 * ── KEY IDENTITY ─────────────────────────────────────────────────────────────
 *
 * arr[k] = 1 means day (arrayStart + k) was a Schengen day. That day exits
 * the rolling 180-day window [D−179, D−1] on the first D where D−179 > that
 * day, i.e.:
 *
 *   aging-out date = arrayStart + k + 180 = today − 179 + k + 180 = today + k + 1
 *
 * So scanning arr left-to-right and counting 1s tells us exactly when each
 * increment of available allowance is unlocked.
 *
 * ── MAX-NOW SCAN (per phase) ─────────────────────────────────────────────────
 *
 * Mirrors calculateMaxStay v2 using the array instead of rebuilding a Set:
 *
 *   daysUsed = windowSum(phaseStartIdx−179, phaseStartIdx−1)  [O(1) with prefix]
 *   allowance = 90 − daysUsed
 *   for i in [0, allowance):           // allowance ≤ 90 ⇒ terminates
 *     if arr[phaseStartIdx−179+i] == 1: allowance++   // historical day ages out
 *   maxNow = allowance
 *
 * ── THRESHOLD SCAN (per phase) ───────────────────────────────────────────────
 *
 * After maxNow is known, scan arr from the left edge of the window at
 * phaseStart forward to the left edge at phaseEnd. Each 1 at index k
 * represents one more day of allowance unlocked on today+k+1. Accumulate
 * until the next multiple-of-15 threshold is crossed; record the date; jump
 * to the next threshold (always exactly 15 more 1s away).
 *
 * Total calculateMaxStay calls across the entire function: 0.
 * Total array iterations: O(90) for maxNow + O(window_ones) for thresholds,
 * per phase. Window ones ≤ 90. Per-phase cost is O(90), constant time.
 */

import { VisaRegion } from "@/types";
import type { Traveler } from "@/types";
import {
  today,
  parseDate,
  addDays,
  subDays,
  differenceInCalendarDays,
} from "@/features/calculator/utils/dates";
import { dateToTop } from "@/features/calculator/utils/timelineLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReturnMarker {
  date: Date;
  /** Pixel offset from the top of the canvas. */
  top: number;
  /**
   * isCurrent: exact max stay available on this date.
   * !isCurrent: the threshold (multiple of 15) first reached on this date.
   */
  days: number;
  /**
   * True  → snapshot chip at a phase boundary (today / day after a trip ends).
   * False → milestone chip when a 15/30/45…/90d stay first becomes possible.
   */
  isCurrent: boolean;
}

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

  // ── Build bit array ──────────────────────────────────────────────────────────
  //
  // Covers today−179 → timelineEnd. Both completed (historical) and pending
  // (future) Schengen trips are marked as 1s. Pending trip days are included
  // so the prefix sum correctly excludes them from phase scans (they lie
  // beyond phaseStartIdx and are never reached by either inner loop).

  const arrayStart = subDays(todayDate, 179);
  const arrayLen = differenceInCalendarDays(timelineEnd, arrayStart) + 1;
  const arr = new Uint8Array(arrayLen);

  for (const trip of allSchengen) {
    const entry = parseDate(trip.entryDate);
    // Ongoing trips capped at today: their future days are unknown and should
    // not appear as 1s beyond today.
    const exit = trip.exitDate ? parseDate(trip.exitDate) : todayDate;
    const startI = Math.max(0, differenceInCalendarDays(entry, arrayStart));
    const endI = Math.min(
      arrayLen - 1,
      differenceInCalendarDays(exit, arrayStart),
    );
    for (let i = startI; i <= endI; i++) arr[i] = 1;
  }

  // ── Prefix sums ──────────────────────────────────────────────────────────────
  //
  // prefix[i] = sum(arr[0..i−1]).
  // sum(arr[a..b]) = prefix[b+1] − prefix[a].

  const prefix = new Int32Array(arrayLen + 1);
  for (let i = 0; i < arrayLen; i++) prefix[i + 1] = prefix[i] + arr[i];

  function windowSum(fromIdx: number, toIdx: number): number {
    const a = Math.max(0, fromIdx);
    const b = Math.min(arrayLen - 1, toIdx);
    if (a > b) return 0;
    return prefix[b + 1] - prefix[a];
  }

  // ── Build phases ─────────────────────────────────────────────────────────────
  //
  // A phase is a contiguous free window between consecutive pending Schengen
  // trips (or between today and the first trip, or after the last trip).
  // Within a phase there are no pending Schengen trips, so arr values at
  // indices ≥ phaseStartIdx are always 0 — the inner scans never accidentally
  // count future trip days.

  const insideSchengenNow = allSchengen.some((t) => !t.exitDate);

  const futureTrips = allSchengen
    .filter((t) => t.exitDate && parseDate(t.entryDate) > todayDate)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1));

  type Phase = { start: Date; end: Date };
  const phases: Phase[] = [];

  // Phase 0: today → day before first pending trip (or timelineEnd).
  // Skipped if the traveler is currently inside Schengen — they can't re-enter
  // until the ongoing trip ends, which has no exit date so we can't compute it.
  if (!insideSchengenNow) {
    const p0End =
      futureTrips.length > 0
        ? subDays(parseDate(futureTrips[0].entryDate), 1)
        : timelineEnd;
    const cappedEnd = p0End < timelineEnd ? p0End : timelineEnd;
    if (cappedEnd >= todayDate) {
      phases.push({ start: todayDate, end: cappedEnd });
    }
  }

  // Phase n: day after trip[n] exits → day before trip[n+1] starts.
  for (let i = 0; i < futureTrips.length; i++) {
    const phaseStart = addDays(parseDate(futureTrips[i].exitDate!), 1);
    const rawEnd =
      i + 1 < futureTrips.length
        ? subDays(parseDate(futureTrips[i + 1].entryDate), 1)
        : timelineEnd;
    const cappedEnd = rawEnd < timelineEnd ? rawEnd : timelineEnd;
    if (phaseStart <= cappedEnd && phaseStart <= timelineEnd) {
      phases.push({ start: phaseStart, end: cappedEnd });
    }
  }

  // ── Process each phase ────────────────────────────────────────────────────────

  const allMarkers: ReturnMarker[] = [];

  for (const phase of phases) {
    if (phase.start > timelineEnd) break;

    // idx(D) = D − arrayStart = D − today + 179
    const phaseStartIdx = differenceInCalendarDays(phase.start, arrayStart);
    const phaseEndIdx = differenceInCalendarDays(phase.end, arrayStart);

    // ── daysUsed and maxNow ────────────────────────────────────────────────────
    //
    // Window at phaseStart = [phaseStart−179, phaseStart−1]
    //                       = arr indices [phaseStartIdx−179, phaseStartIdx−1]
    //
    // Aging scan: arr[phaseStartIdx−179+i] covers the same positions as
    // calculateMaxStay v2's "fallingOff = addDays(windowStart, i)".
    // Since phaseStartIdx ≥ 179 (phaseStart ≥ today), phaseStartIdx−179 ≥ 0
    // and the maximum check index phaseStartIdx−179+89 ≤ phaseStartIdx−90 <
    // phaseStartIdx — safely within the historical (past) portion of the array.

    const daysUsed = windowSum(phaseStartIdx - 179, phaseStartIdx - 1);
    let allowance = 90 - daysUsed;
    if (allowance <= 0) continue; // can't enter at this phase start

    for (let i = 0; i < allowance; i++) {
      // arr[phaseStartIdx−179+i] is guaranteed to be a historical day (see above).
      if (arr[phaseStartIdx - 179 + i] === 1) allowance++;
    }
    const maxNow = allowance;

    // Emit snapshot chip — the exact max stay available at this phase boundary.
    allMarkers.push({
      date: phase.start,
      top: dateToTop(phase.start, timelineStart),
      days: maxNow,
      isCurrent: true,
    });

    // ── Threshold scan ─────────────────────────────────────────────────────────
    //
    // Find when each 15-day milestone above maxNow first becomes achievable.
    //
    // We scan arr from the left edge of the window at phaseStart
    // (= phaseStartIdx−179) forward to the left edge at phaseEnd
    // (= phaseEndIdx−179). Each 1 at index k ages out on today+k+1,
    // adding one more day of available allowance.
    //
    // The scan never crosses into future-trip territory because:
    //   phaseEndIdx−179 < phaseStartIdx  (phase end < phase start + 179)
    //   which means all scanned indices correspond to historical dates.
    //
    // First threshold: the next multiple of 15 above maxNow.
    // needed   : how many 1s must age out to reach it  (= firstThreshold − maxNow)
    // After the first: every subsequent threshold needs exactly 15 more 1s.

    const firstThreshold = Math.floor(maxNow / 15) * 15 + 15;
    if (firstThreshold > 90) continue;

    let nextThreshold = firstThreshold;
    let needed = nextThreshold - maxNow;
    let accumulated = 0;

    const scanFrom = phaseStartIdx - 179;
    const scanTo = Math.min(phaseEndIdx - 179, arrayLen - 1);

    for (let k = scanFrom; k <= scanTo; k++) {
      if (arr[k] !== 1) continue;

      accumulated++;
      if (accumulated < needed) continue;

      // The `needed`-th 1 was found at index k.
      // arr[k] = day (arrayStart + k) ages out on today + k + 1.
      const markerDate = addDays(arrayStart, k + 180);

      allMarkers.push({
        date: markerDate,
        top: dateToTop(markerDate, timelineStart),
        days: nextThreshold,
        isCurrent: false,
      });

      nextThreshold += 15;
      if (nextThreshold > 90) break;

      needed = 15; // every subsequent threshold is exactly 15 more 1s away
      accumulated = 0;
    }
  }

  return allMarkers;
}
