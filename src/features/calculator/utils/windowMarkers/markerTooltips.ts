/**
 * Canonical tooltip strings for rolling-window timeline markers.
 *
 * All marker tooltip text — on both the desktop column view and the mobile
 * single-column view — is defined here so phrasing, date format, and
 * explanation copy stay identical across platforms. Every marker names its
 * destination, since one timeline can carry markers for several (in the
 * mobile drawer, the heading does). Durations in sentences
 * are spelled out ("a 90-day visit", "8 days"), never "90d".
 *
 * Date format: "MMM d" (e.g. "Jan 15"). The year is omitted because users
 * are planning their own trips and already know what year they fall in.
 */

import { addDays, format } from "date-fns";
import type { VisaRegion } from "@/types";
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
 * Lead of a return-marker line, followed by the travellers it applies to:
 * "From Jun 23, a 90-day visit is possible once again for" + "Me and Wifey."
 */
export const returnVisitLead = (date: Date, days: number): string =>
  `From ${format(date, DATE_FMT)}, a ${days}-day visit is possible once again for`;

// ─── Aging markers ────────────────────────────────────────────────────────────

/**
 * The text around the (italicised) trip name in an age-out sentence:
 * "On Sep 17, " + "Bosnia" + " begins to fall outside the rolling window."
 */
export const agingLeadParts = (
  agingDate: Date,
): { before: string; after: string } => ({
  before: `On ${format(agingDate, DATE_FMT)}, `,
  after: " begins to fall outside the rolling window.",
});

/** "This returns 4 days to" + the travellers whose window it was in. */
export const agingReturnsLead = (tripDays: number): string =>
  `This returns ${tripDays} ${tripDays === 1 ? "day" : "days"} to`;

/**
 * What actually happens after the age-out date: a trip's days come back one
 * per day, in the order they were spent (day k of the trip leaves the window
 * on agingDate + k). Null for a one-day trip, where there's nothing to add.
 */
export const agingMarkerSubtext = (
  agingDate: Date,
  tripDays: number,
): string | null =>
  tripDays <= 1
    ? null
    : `Its days come back one at a time, in the order they were spent: the first on ${format(agingDate, DATE_FMT)}, the last on ${format(addDays(agingDate, tripDays - 1), DATE_FMT)}.`;

// ─── Name lists ───────────────────────────────────────────────────────────────

/** Separator before the i-th of n names: "Me", "Me and Wifey", "A, B and C". */
export const nameSeparator = (i: number, n: number): string =>
  i === 0 ? "" : i === n - 1 ? " and " : ", ";
