/**
 * Canonical tooltip strings for rolling-window timeline markers.
 *
 * All marker tooltip text — on both the desktop column view and the mobile
 * single-column view — is defined here so phrasing, date format, and
 * explanation copy stay identical across platforms. Every marker names its
 * destination, since one timeline can carry markers for several (mobile's
 * per-traveller rows sit under a heading that does). Durations in sentences
 * are spelled out ("a 90-day visit", "8 days"), never "90d".
 *
 * Date format: "MMM d" (e.g. "Jan 15"). The year is omitted because users
 * are planning their own trips and already know what year they fall in.
 */

import { format } from "date-fns";
import { VISA_REGION_LABELS, type VisaRegion } from "@/types";
import { regionVisitName } from "./markerLayout";

// ─── Internal ─────────────────────────────────────────────────────────────────

const DATE_FMT = "MMM d";

// ─── Return markers ───────────────────────────────────────────────────────────

/** Live max-stay snapshot on the current date. */
export const returnMarkerCurrentText = (
  region: VisaRegion,
  days: number,
): string =>
  `Currently, a visit of up to ${days} days to ${regionVisitName(region)} is possible.`;

/** A milestone that is first reachable again on `date`. */
export const returnMarkerThresholdText = (
  region: VisaRegion,
  date: Date,
  days: number,
): string =>
  `From ${format(date, DATE_FMT)}, a ${days}-day visit to ${regionVisitName(region)} is possible once again.`;

/**
 * Mobile: one line per traveler inside a grouped return marker, under a
 * heading that names the destination.
 * Format: "Alice: from Jan 15, a 45-day visit is possible once again."
 */
export const returnMarkerRowText = (
  name: string,
  date: Date,
  days: number,
): string =>
  `${name}: from ${format(date, DATE_FMT)}, a ${days}-day visit is possible once again.`;

// ─── Aging markers ────────────────────────────────────────────────────────────

/**
 * First line of any aging marker tooltip — concise trip summary.
 * Format: "From Mar 18, Iceland (8 days) begins to age out of your Schengen
 * Area window."
 */
export const agingMarkerTripLine = (
  region: VisaRegion,
  destination: string,
  tripDays: number,
  agingDate: Date,
): string =>
  `From ${format(agingDate, DATE_FMT)}, ${destination} (${tripDays} ${tripDays === 1 ? "day" : "days"}) begins to age out of your ${VISA_REGION_LABELS[region]} window.`;

/**
 * Second line of any aging marker tooltip — behaviour explanation.
 * Follows `agingMarkerTripLine` on desktop (in the same tooltip) and is
 * rendered as a separate dimmed line on mobile.
 */
export const AGING_MARKER_EXPLANATION =
  "Each day that ages out frees up a day of allowance, which typically causes a noticeable jump in the longest visit possible.";
