/**
 * Core Schengen 90/180 rule calculation.
 *
 * THE RULE
 * --------
 * In any rolling 180-day window ending on day D, a traveler may spend at most
 * 90 days inside the Schengen Area.
 *
 * KEY INSIGHT
 * -----------
 * "Days remaining" is NOT simply 90 minus days already used. Because the
 * window slides forward as a trip progresses, old stays fall off the back end
 * and free up room. The true maximum stay on a trip starting today is often
 * significantly longer than that naive subtraction suggests.
 *
 * THE ALGORITHM  (calculateMaxStay)
 * ------------------------------------
 * 1. From the proposed entry date, look back 179 days to get the window start.
 *    Sum all historical Schengen days in [windowStart, entryDate − 1].
 *    This is previous_stay.
 *
 * 2. If previous_stay >= 90, the traveler cannot enter. Return canEnter = false.
 *
 * 3. Otherwise, walk forward day by day from the entry date. On each candidate
 *    exit day D, compute:
 *      - historical_in_window : historical days in [D − 179, D]
 *      - proposed_days        : D − entryDate + 1
 *    If historical_in_window + proposed_days > 90, the previous day was the
 *    true maximum exit. Stop.
 *
 * 4. The loop runs at most 90 iterations because no single trip can ever
 *    exceed 90 days (the proposed trip alone would saturate any window it spans).
 */

import type { Trip, MaxStayResult } from "../../../types";
import { parseDate, formatDate, today, subDays, addDays } from "./dates";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const SCHENGEN_MAX_DAYS = 90;
export const SCHENGEN_WINDOW_SIZE = 180;

// ─── Internal helper ───────────────────────────────────────────────────────────

/**
 * Build a Set of every ISO date string on which the traveler was inside
 * Schengen, clipped to [windowStart, windowEnd] inclusive.
 *
 * This single O(historical Schengen days) pass replaces the repeated
 * daysInWindow calls in the original algorithm.
 */
function buildSchengenDaySet(
  trips: Trip[],
  windowStart: Date,
  windowEnd: Date,
): Set<string> {
  const days = new Set<string>();
  const fallbackExit = today();

  for (const trip of trips) {
    const tripEntry = parseDate(trip.entryDate);
    const tripExit = trip.exitDate ? parseDate(trip.exitDate) : fallbackExit;

    // Clip to the window.
    const start = tripEntry < windowStart ? windowStart : tripEntry;
    const end = tripExit > windowEnd ? windowEnd : tripExit;

    if (start > end) continue;

    let cursor = start;
    while (cursor <= end) {
      days.add(formatDate(cursor));
      cursor = addDays(cursor, 1);
    }
  }

  return days;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Return the number of Schengen days a traveler has used in the 180-day window
 * ending on (and including) `referenceDateStr`.
 *
 * This is the raw "days used" figure — useful for display. Note that
 * `90 − daysUsed` is NOT the correct answer to "how long can I stay?"; use
 * `calculateMaxStay` for that.
 */
export function getDaysUsedOnDate(
  referenceDateStr: string,
  trips: Trip[],
): number {
  const ref = parseDate(referenceDateStr);
  const windowStart = subDays(ref, SCHENGEN_WINDOW_SIZE - 1);
  return buildSchengenDaySet(trips, windowStart, ref).size;
}

/**
 * Given a proposed entry date and a traveler's historical trip record, return
 * the maximum stay available — the last legal exit date if entering on
 * `entryDateStr`, accounting for old trips rolling off the 180-day window
 * as the stay progresses.
 *
 * ALGORITHM
 * ---------
 * 1. Build a Set of every historical Schengen day in [D−179, D−1].
 *    Its size is `prev` — the days already used.
 *
 * 2. If prev ≥ 90, entry is impossible.
 *
 * 3. Otherwise, start with allowance = 90 − prev and walk forward from D−179.
 *    For each day at position i that falls off the back of the window as our
 *    stay advances — if that day was a Schengen day, it no longer counts
 *    against us, so allowance grows by 1.
 *
 *    We iterate while i < allowance (which can grow). The loop runs at most 90
 *    times because allowance starts at 90−prev and can only grow by `prev`
 *    (one increment per historical Schengen day found), capping at exactly 90.
 *
 * @param entryDateStr    ISO "YYYY-MM-DD" proposed entry date.
 * @param historicalTrips Completed and ongoing trips. Must NOT include the
 *                        proposed trip itself.
 */
export function calculateMaxStay(
  entryDateStr: string,
  historicalTrips: Trip[],
): MaxStayResult {
  const entry = parseDate(entryDateStr);
  const windowStart = subDays(entry, SCHENGEN_WINDOW_SIZE - 1); // D − 179

  // Step 1 — single pass over historical trips to build the day set.
  // We look at [D−179, D−1]: entry day is day 1 of the new trip, not history.
  const historicalDays = buildSchengenDaySet(
    historicalTrips,
    windowStart,
    subDays(entry, 1),
  );
  const prev = historicalDays.size;

  // Step 2 — can the traveler enter at all?
  if (prev >= SCHENGEN_MAX_DAYS) {
    return {
      entryDate: entryDateStr,
      canEnter: false,
      maxExitDate: null,
      maxDays: 0,
    };
  }

  // Step 3 — compute max allowance by walking forward from D−179.
  //
  // As our stay advances by one day, the window also advances by one day:
  // the oldest day in the window (D−179+i) falls off the back. If that day
  // was a Schengen day, we recover it and allowance grows by 1.
  //
  // We stop when i reaches allowance — meaning every day we are entitled to
  // has been "earned". That final value of allowance is max_stay.
  //
  // Termination: allowance ≤ 90−prev+prev = 90, so at most 90 iterations.

  let allowance = SCHENGEN_MAX_DAYS - prev;

  for (let i = 0; i < allowance; i++) {
    const fallingOff = formatDate(addDays(windowStart, i));
    if (historicalDays.has(fallingOff)) {
      allowance++;
    }
  }

  return {
    entryDate: entryDateStr,
    canEnter: true,
    maxExitDate: formatDate(addDays(entry, allowance - 1)),
    maxDays: allowance,
  };
}
