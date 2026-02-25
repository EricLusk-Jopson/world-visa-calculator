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
import {
  parseDate,
  formatDate,
  today,
  subDays,
  addDays,
  countDaysInWindow,
  differenceInCalendarDays,
} from "./dates";

// ─── Constants ─────────────────────────────────────────────────────────────────

export const SCHENGEN_MAX_DAYS = 90;
export const SCHENGEN_WINDOW_SIZE = 180;

// ─── Internal helper ───────────────────────────────────────────────────────────

/**
 * Sum the days from `trips` that fall within [windowStart, windowEnd] inclusive.
 *
 * Trips with no exitDate are treated as ending today. This handles ongoing
 * trips (traveler is currently inside Schengen).
 */
function daysInWindow(
  trips: Trip[],
  windowStart: Date,
  windowEnd: Date,
): number {
  const fallbackExit = today();
  let total = 0;
  for (const trip of trips) {
    const entry = parseDate(trip.entryDate);
    const exit = trip.exitDate ? parseDate(trip.exitDate) : fallbackExit;
    total += countDaysInWindow(entry, exit, windowStart, windowEnd);
  }
  return total;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Given a proposed entry date and a traveler's historical trip record, return
 * the maximum stay available — the last legal exit date if entering on
 * `entryDateStr`, accounting for old trips rolling off the 180-day window
 * as the stay progresses.
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

  // Step 1 — days already used in the 180-day window ending on entry day.
  // We look at [entry − 179, entry − 1]: the entry day itself is day 1 of the
  // new trip, not part of the historical record.
  const initialWindowStart = subDays(entry, SCHENGEN_WINDOW_SIZE - 1);
  const previousStay = daysInWindow(
    historicalTrips,
    initialWindowStart,
    subDays(entry, 1),
  );

  // Step 2 — can the traveler enter at all?
  if (previousStay >= SCHENGEN_MAX_DAYS) {
    return {
      entryDate: entryDateStr,
      canEnter: false,
      maxExitDate: null,
      maxDays: 0,
    };
  }

  // Step 3 — walk forward to find the true maximum exit date.
  //
  // For each candidate exit date D (starting the day after the current maxExit):
  //   window            = [D − 179, D]
  //   historicalInWindow = days from existing trips in that window
  //   proposedDays       = days from entry through D  (always fits in window
  //                        because the trip is < 180 days)
  //
  // We stop as soon as historicalInWindow + proposedDays would exceed 90.

  let maxExit = entry; // entry day itself is always valid (1 day minimum)

  for (let i = 0; i < SCHENGEN_MAX_DAYS; i++) {
    const candidate = addDays(maxExit, 1);
    const windowStart = subDays(candidate, SCHENGEN_WINDOW_SIZE - 1);
    const historicalInWindow = daysInWindow(
      historicalTrips,
      windowStart,
      candidate,
    );
    const proposedDays = differenceInCalendarDays(candidate, entry) + 1;

    if (historicalInWindow + proposedDays > SCHENGEN_MAX_DAYS) break;

    maxExit = candidate;
  }

  return {
    entryDate: entryDateStr,
    canEnter: true,
    maxExitDate: formatDate(maxExit),
    maxDays: differenceInCalendarDays(maxExit, entry) + 1,
  };
}
