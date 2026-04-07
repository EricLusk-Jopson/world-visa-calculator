/**
 * Canonical tooltip strings for Schengen timeline markers.
 *
 * All marker tooltip text — on both the desktop column view and the mobile
 * single-column view — is defined here so phrasing, date format, and
 * explanation copy stay identical across platforms.
 *
 * Date format: "MMM d" (e.g. "Jan 15"). The year is omitted because users
 * are planning their own trips and already know what year they fall in.
 */

import { format } from "date-fns";

// ─── Internal ─────────────────────────────────────────────────────────────────

const DATE_FMT = "MMM d";

// ─── Return markers ───────────────────────────────────────────────────────────

/** Desktop pill: live max-stay snapshot rendered on the current date. */
export const returnMarkerCurrentText = (days: number): string =>
  `Currently, you can start a Schengen trip of up to ${days} days.`;

/** Desktop pill: future threshold that first becomes reachable on `date`. */
export const returnMarkerThresholdText = (date: Date, days: number): string =>
  `From ${format(date, DATE_FMT)}, a ${days}-day Schengen trip first becomes possible.`;

/**
 * Mobile list-row: one line per traveler inside a grouped return marker tooltip.
 * Format: "Alice · Jan 15 · up to 45d"
 */
export const returnMarkerRowText = (
  name: string,
  date: Date,
  days: number,
): string => `${name} · ${format(date, DATE_FMT)} · up to ${days}d`;

// ─── Aging markers ────────────────────────────────────────────────────────────

/**
 * First line of any aging marker tooltip — concise trip summary.
 * Format: "Iceland (8d) ages out Mar 18"
 */
export const agingMarkerTripLine = (
  destination: string,
  tripDays: number,
  agingDate: Date,
): string =>
  `${destination} (${tripDays}d) ages out ${format(agingDate, DATE_FMT)}`;

/**
 * Second line of any aging marker tooltip — behaviour explanation.
 * Appended to `agingMarkerTripLine` on desktop (as one sentence) and rendered
 * as a separate dimmed line on mobile.
 */
export const AGING_MARKER_EXPLANATION =
  "Each exiting day frees up allowance and typically causes a noticeable jump in max stay.";
