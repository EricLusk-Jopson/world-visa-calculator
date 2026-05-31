/**
 * Generic "X days in Y days" rolling-window calculator.
 *
 * THE RULE
 * --------
 * In any rolling `windowSize`-day window ending on day D, a traveler may spend
 * at most `maxDays` days inside the zone. Both Schengen (90/180) and Türkiye
 * (90/180) use this same algorithm — only the configuration differs.
 *
 * KEY INSIGHT
 * -----------
 * "Days remaining" is NOT simply maxDays minus days already used. Because the
 * window slides forward as a trip progresses, old stays fall off the back end
 * and free up room. The true maximum stay on a trip starting today is often
 * significantly longer than that naive subtraction suggests.
 *
 * THE ALGORITHM  (calculateMaxStay)
 * ------------------------------------
 * 1. Build a Set of every historical zone day in [D−(windowSize−1), D−1].
 *    Its size is `prev` — the days already used.
 *
 * 2. If prev ≥ maxDays, entry is impossible.
 *
 * 3. Otherwise, start with allowance = maxDays − prev and walk forward from
 *    D−(windowSize−1). For each day at position i that falls off the back of
 *    the window as our stay advances — if that day was a zone day, it no longer
 *    counts against us, so allowance grows by 1.
 *
 *    We iterate while i < allowance (which can grow). The loop runs at most
 *    maxDays times because allowance starts at maxDays−prev and can only grow
 *    by `prev`, capping at exactly maxDays.
 *
 * Instantiate via createRollingWindowCalculator({ maxDays, windowSize }).
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

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RollingWindowConfig {
  /** Maximum days allowed within any single rolling window. */
  maxDays: number;
  /** Size of the rolling window in days. */
  windowSize: number;
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Build a Set of every ISO date string on which the traveler was inside the
 * zone, clipped to [windowStart, windowEnd] inclusive.
 *
 * This single O(historical zone days) pass replaces repeated window-scan calls.
 */
function buildDaySet(
  trips: Trip[],
  windowStart: Date,
  windowEnd: Date,
): Set<string> {
  const days = new Set<string>();
  const fallbackExit = today();

  for (const trip of trips) {
    const tripEntry = parseDate(trip.entryDate);
    const tripExit = trip.exitDate ? parseDate(trip.exitDate) : fallbackExit;

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

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createRollingWindowCalculator(config: RollingWindowConfig) {
  const { maxDays, windowSize } = config;

  /**
   * Return the number of zone days used in the rolling window ending on
   * (and including) `referenceDateStr`.
   *
   * Note that `maxDays − daysUsed` is NOT the correct answer to "how long can
   * I stay?"; use `calculateMaxStay` for that.
   */
  function getDaysUsedOnDate(
    referenceDateStr: string,
    trips: Trip[],
  ): number {
    const ref = parseDate(referenceDateStr);
    const windowStart = subDays(ref, windowSize - 1);
    return buildDaySet(trips, windowStart, ref).size;
  }

  /**
   * Given a proposed entry date and a traveler's historical trip record, return
   * the maximum stay available — the last legal exit date if entering on
   * `entryDateStr`, accounting for old trips rolling off the window as the
   * stay progresses.
   *
   * @param entryDateStr    ISO "YYYY-MM-DD" proposed entry date.
   * @param historicalTrips Completed and ongoing trips. Must NOT include the
   *                        proposed trip itself.
   */
  function calculateMaxStay(
    entryDateStr: string,
    historicalTrips: Trip[],
  ): MaxStayResult {
    const entry = parseDate(entryDateStr);
    const windowStart = subDays(entry, windowSize - 1);

    const historicalDays = buildDaySet(
      historicalTrips,
      windowStart,
      subDays(entry, 1),
    );
    const prev = historicalDays.size;

    if (prev >= maxDays) {
      return {
        entryDate: entryDateStr,
        canEnter: false,
        maxExitDate: null,
        maxDays: 0,
      };
    }

    let allowance = maxDays - prev;

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
   * Find the earliest date on which a traveler can begin a new trip to the
   * zone, starting the search from `searchFrom` (defaults to today).
   *
   * Two constraints must both be satisfied before a date is valid:
   *
   *   1. OVERLAP — the candidate must not fall inside an existing trip.
   *      When violated, jump to the day after that trip's exit date.
   *
   *   2. ALLOWANCE — `prev` (historical zone days in the rolling window
   *      ending on the candidate) must be < maxDays.
   *      When violated, jump to `gatingDay + windowSize` — the first day
   *      the 90th-from-last historical day falls out of the window.
   *
   * Both jumps are derived analytically, so the loop body runs at most once
   * per constraint violation. In practice this converges in 1–3 iterations.
   *
   * @param trips         All existing trips for this traveler.
   * @param searchFrom    ISO date to start searching from. Defaults to today.
   * @param maxSearchDays Safety cap. Defaults to 365.
   */
  function calculateEarliestEntry(
    trips: Trip[],
    searchFrom: string = todayISO(),
    maxSearchDays = 365,
  ): EarliestEntryResult {
    const searchStart = parseDate(searchFrom);
    const searchLimit = addDays(searchStart, maxSearchDays);

    const sortedTrips = [...trips].sort((a, b) =>
      a.entryDate < b.entryDate ? -1 : 1,
    );

    let candidate = searchStart;

    while (candidate < searchLimit) {
      const candidateStr = formatDate(candidate);

      // ── Constraint 1: no overlap with an existing trip ──────────────────────
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

      // ── Constraint 2: allowance available ────────────────────────────────────
      const windowStart = subDays(candidate, windowSize - 1);
      const historicalDays = buildDaySet(
        trips,
        windowStart,
        subDays(candidate, 1),
      );
      const prev = historicalDays.size;

      if (prev >= maxDays) {
        const sorted = [...historicalDays].sort(); // ISO strings sort lexicographically
        const gatingDay = sorted[sorted.length - maxDays];
        candidate = addDays(parseDate(gatingDay), windowSize);
        continue;
      }

      // ── Both constraints satisfied ──────────────────────────────────────────
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

  return { getDaysUsedOnDate, calculateMaxStay, calculateEarliestEntry };
}
