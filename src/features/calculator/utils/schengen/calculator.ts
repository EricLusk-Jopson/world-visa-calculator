/**
 * Schengen-configured rolling-window calculator.
 *
 * The Schengen Area applies a 90-in-180-days rule. This module wires the
 * generic rollingWindowCalculator with those constants and re-exports the
 * resulting functions under their original names so call-sites are unchanged.
 */

import { createRollingWindowCalculator } from "../rollingWindowCalculator";

export const SCHENGEN_MAX_DAYS = 90;
export const SCHENGEN_WINDOW_SIZE = 180;

const {
  getDaysUsedOnDate,
  calculateMaxStay,
  calculateEarliestEntry,
} = createRollingWindowCalculator({
  maxDays: SCHENGEN_MAX_DAYS,
  windowSize: SCHENGEN_WINDOW_SIZE,
});

export { getDaysUsedOnDate, calculateMaxStay, calculateEarliestEntry };
