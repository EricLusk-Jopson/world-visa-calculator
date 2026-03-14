/**
 * Shared constants for the timeline layout.
 * All pixel values are in logical pixels (px).
 */

/** Pixels per calendar day on the vertical timeline axis. */
export const DAY_PX = 28;

/** Fixed width of each traveler column (including inner padding). */
export const COL_WIDTH = 240;

/** Height of the sticky column header (TravelerColumnHeader). */
export const HDR_HEIGHT = 80;

/** Width of the left date-sidebar. */
export const SIDEBAR_WIDTH = 64;

/** How many days before today to start the visible range. */
export const DAYS_BEFORE_TODAY = 120;

/** How many days after today to extend the visible range. */
export const DAYS_AFTER_TODAY = 365;

/** Total visible day range. */
export const TOTAL_DAYS = DAYS_BEFORE_TODAY + DAYS_AFTER_TODAY;

/** Total px height of the scrollable timeline body. */
export const TIMELINE_BODY_HEIGHT = TOTAL_DAYS * DAY_PX;

/** Returns the Date that corresponds to y=0 on the timeline. */
export function getTimelineOrigin(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - DAYS_BEFORE_TODAY);
  return d;
}

/** Converts a YYYY-MM-DD string to a y-offset in px from the timeline origin. */
export function dateToPx(dateStr: string): number {
  const origin = getTimelineOrigin();
  const target = new Date(dateStr + "T00:00:00");
  const diffMs = target.getTime() - origin.getTime();
  const diffDays = diffMs / 86_400_000;
  return Math.round(diffDays * DAY_PX);
}

/** Y-offset of "today" line from the timeline origin. */
export function todayPx(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const origin = getTimelineOrigin();
  return Math.round((today.getTime() - origin.getTime()) / 86_400_000) * DAY_PX;
}
