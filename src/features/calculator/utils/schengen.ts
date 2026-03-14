// /**
//  * Core Schengen 90/180 rule calculation.
//  *
//  * THE RULE
//  * --------
//  * In any rolling 180-day window ending on day D, a traveler may spend at most
//  * 90 days inside the Schengen Area.
//  *
//  * KEY INSIGHT
//  * -----------
//  * "Days remaining" is NOT simply 90 minus days already used. Because the
//  * window slides forward as a trip progresses, old stays fall off the back end
//  * and free up room. The true maximum stay on a trip starting today is often
//  * significantly longer than that naive subtraction suggests.
//  *
//  * THE ALGORITHM  (calculateMaxStay)
//  * ------------------------------------
//  * 1. From the proposed entry date, look back 179 days to get the window start.
//  *    Sum all historical Schengen days in [windowStart, entryDate − 1].
//  *    This is previous_stay.
//  *
//  * 2. If previous_stay >= 90, the traveler cannot enter. Return canEnter = false.
//  *
//  * 3. Otherwise, walk forward day by day from the entry date. On each candidate
//  *    exit day D, compute:
//  *      - historical_in_window : historical days in [D − 179, D]
//  *      - proposed_days        : D − entryDate + 1
//  *    If historical_in_window + proposed_days > 90, the previous day was the
//  *    true maximum exit. Stop.
//  *
//  * 4. The loop runs at most 90 iterations because no single trip can ever
//  *    exceed 90 days (the proposed trip alone would saturate any window it spans).
//  */

// import type { Trip, MaxStayResult } from "../../../types";
// import {
//   parseDate,
//   formatDate,
//   today,
//   subDays,
//   addDays,
//   countDaysInWindow,
//   differenceInCalendarDays,
// } from "./dates";

// // ─── Constants ─────────────────────────────────────────────────────────────────

// export const SCHENGEN_MAX_DAYS = 90;
// export const SCHENGEN_WINDOW_SIZE = 180;

// // ─── Internal helper ───────────────────────────────────────────────────────────

// /**
//  * Sum the days from `trips` that fall within [windowStart, windowEnd] inclusive.
//  *
//  * Trips with no exitDate are treated as ending today. This handles ongoing
//  * trips (traveler is currently inside Schengen).
//  */
// function daysInWindow(
//   trips: Trip[],
//   windowStart: Date,
//   windowEnd: Date,
// ): number {
//   const fallbackExit = today();
//   let total = 0;
//   for (const trip of trips) {
//     const entry = parseDate(trip.entryDate);
//     const exit = trip.exitDate ? parseDate(trip.exitDate) : fallbackExit;
//     total += countDaysInWindow(entry, exit, windowStart, windowEnd);
//   }
//   return total;
// }

// // ─── Public API ────────────────────────────────────────────────────────────────

// /**
//  * Given a proposed entry date and a traveler's historical trip record, return
//  * the maximum stay available — the last legal exit date if entering on
//  * `entryDateStr`, accounting for old trips rolling off the 180-day window
//  * as the stay progresses.
//  *
//  * @param entryDateStr    ISO "YYYY-MM-DD" proposed entry date.
//  * @param historicalTrips Completed and ongoing trips. Must NOT include the
//  *                        proposed trip itself.
//  */
// export function calculateMaxStay(
//   entryDateStr: string,
//   historicalTrips: Trip[],
// ): MaxStayResult {
//   const entry = parseDate(entryDateStr);

//   // Step 1 — days already used in the 180-day window ending on entry day.
//   // We look at [entry − 179, entry − 1]: the entry day itself is day 1 of the
//   // new trip, not part of the historical record.
//   const initialWindowStart = subDays(entry, SCHENGEN_WINDOW_SIZE - 1);
//   const previousStay = daysInWindow(
//     historicalTrips,
//     initialWindowStart,
//     subDays(entry, 1),
//   );

//   // Step 2 — can the traveler enter at all?
//   if (previousStay >= SCHENGEN_MAX_DAYS) {
//     return {
//       entryDate: entryDateStr,
//       canEnter: false,
//       maxExitDate: null,
//       maxDays: 0,
//     };
//   }

//   // Step 3 — walk forward to find the true maximum exit date.
//   //
//   // For each candidate exit date D (starting the day after the current maxExit):
//   //   window            = [D − 179, D]
//   //   historicalInWindow = days from existing trips in that window
//   //   proposedDays       = days from entry through D  (always fits in window
//   //                        because the trip is < 180 days)
//   //
//   // We stop as soon as historicalInWindow + proposedDays would exceed 90.

//   let maxExit = entry; // entry day itself is always valid (1 day minimum)

//   for (let i = 0; i < SCHENGEN_MAX_DAYS; i++) {
//     const candidate = addDays(maxExit, 1);
//     const windowStart = subDays(candidate, SCHENGEN_WINDOW_SIZE - 1);
//     const historicalInWindow = daysInWindow(
//       historicalTrips,
//       windowStart,
//       candidate,
//     );
//     const proposedDays = differenceInCalendarDays(candidate, entry) + 1;

//     if (historicalInWindow + proposedDays > SCHENGEN_MAX_DAYS) break;

//     maxExit = candidate;
//   }

//   return {
//     entryDate: entryDateStr,
//     canEnter: true,
//     maxExitDate: formatDate(maxExit),
//     maxDays: differenceInCalendarDays(maxExit, entry) + 1,
//   };
// }

// V2

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

import type { Trip, MaxStayResult, EarliestEntryResult } from "../../../types";
import {
  parseDate,
  formatDate,
  today,
  todayISO,
  subDays,
  addDays,
} from "./dates";

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

/**
 * Find the earliest date on which a traveler can begin a new trip to Schengen,
 * starting the search from `searchFrom` (defaults to today).
 *
 * Two constraints must both be satisfied before a date is valid:
 *
 *   1. OVERLAP — the candidate must not fall inside an existing trip.
 *      When violated, jump to the day after that trip's exit date.
 *
 *   2. ALLOWANCE — `prev` (historical Schengen days in the 180-day window
 *      ending on the candidate) must be < 90.
 *      When violated, the gating day is the 90th-from-last historical day.
 *      Jump to `gatingDay + 180` — the first day it falls out of the window.
 *
 * Both jumps are derived analytically from the day set, so the loop body
 * runs at most once per constraint violation rather than crawling day-by-day.
 * In practice this converges in 1–3 iterations for any realistic trip history.
 *
 * @param trips         All existing trips for this traveler.
 * @param searchFrom    ISO date to start searching from. Defaults to today.
 * @param maxSearchDays Safety cap. Defaults to 365.
 */
export function calculateEarliestEntry(
  trips: Trip[],
  searchFrom: string = todayISO(),
  maxSearchDays = 365,
): EarliestEntryResult {
  const searchStart = parseDate(searchFrom);
  const searchLimit = addDays(searchStart, maxSearchDays);

  // Sort trips once so the overlap scan is predictable.
  const sortedTrips = [...trips].sort((a, b) =>
    a.entryDate < b.entryDate ? -1 : 1,
  );

  let candidate = searchStart;

  while (candidate < searchLimit) {
    const candidateStr = formatDate(candidate);

    // ── Constraint 1: no overlap with an existing trip ─────────────────────
    // Find the first trip whose [entry, exit] range contains the candidate.
    const blocking = sortedTrips.find((t) => {
      const tEntry = parseDate(t.entryDate);
      const tExit = t.exitDate ? parseDate(t.exitDate) : today();
      return candidate >= tEntry && candidate <= tExit;
    });

    if (blocking) {
      const blockingExit = blocking.exitDate
        ? parseDate(blocking.exitDate)
        : today();
      candidate = addDays(blockingExit, 1);
      continue;
    }

    // ── Constraint 2: allowance available ──────────────────────────────────
    const windowStart = subDays(candidate, SCHENGEN_WINDOW_SIZE - 1);
    const historicalDays = buildSchengenDaySet(
      trips,
      windowStart,
      subDays(candidate, 1),
    );
    const prev = historicalDays.size;

    if (prev >= SCHENGEN_MAX_DAYS) {
      // Sort the days we found and jump to when the 90th-from-last falls off.
      // gatingDay is the oldest of the 90 days that are blocking us.
      const sorted = [...historicalDays].sort(); // ISO strings sort lexicographically
      const gatingDay = sorted[sorted.length - SCHENGEN_MAX_DAYS];
      candidate = addDays(parseDate(gatingDay), SCHENGEN_WINDOW_SIZE);
      continue;
    }

    // ── Both constraints satisfied ─────────────────────────────────────────
    const maxStay = calculateMaxStay(candidateStr, trips);
    return {
      earliestDate: candidateStr,
      maxDaysAvailable: maxStay.maxDays,
      canEnterOnSearchDate: candidate <= searchStart,
    };
  }

  return {
    earliestDate: null,
    maxDaysAvailable: 0,
    canEnterOnSearchDate: false,
  };
}
