/**
 * Pure helpers behind TripDateRangeCalendar: range selection and the fixed
 * month layout that lets the calendar render only the months on screen.
 *
 * Every month's height is a function of its week count alone, so the scroll
 * position of any month is known up front. Nothing is measured and nothing is
 * prepended while scrolling, which is what used to make the list jump.
 */

/** ISO "YYYY-MM-DD" range; `to` is unset while the exit is still being picked. */
export interface IsoRange {
  from: string;
  to?: string;
}

/** Inclusive ISO interval of days that can't be selected. */
export interface IsoInterval {
  from: string;
  to: string;
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export const CAPTION_HEIGHT = 40;
export const ROW_HEIGHT = 44;
export const MONTH_GAP = 8;

export interface CalendarMonth {
  year: number;
  /** 0-based, as in Date. */
  month: number;
  /** Weekday (0 = Sunday) of the 1st. */
  firstWeekday: number;
  daysInMonth: number;
  weeks: number;
}

export function describeMonth(year: number, month: number): CalendarMonth {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    year: first.getFullYear(),
    month: first.getMonth(),
    firstWeekday,
    daysInMonth,
    weeks: Math.ceil((firstWeekday + daysInMonth) / 7),
  };
}

export function monthHeight(m: CalendarMonth): number {
  return CAPTION_HEIGHT + m.weeks * ROW_HEIGHT + MONTH_GAP;
}

export interface CalendarLayout {
  months: CalendarMonth[];
  /** offsets[i] is the top of month i; offsets[months.length] is the total height. */
  offsets: number[];
}

/** `count` consecutive months starting at (year, month). */
export function buildLayout(year: number, month: number, count: number): CalendarLayout {
  const months: CalendarMonth[] = [];
  const offsets = [0];
  for (let i = 0; i < count; i++) {
    const m = describeMonth(year, month + i);
    months.push(m);
    offsets.push(offsets[i] + monthHeight(m));
  }
  return { months, offsets };
}

/** Index of the month containing pixel `y` (clamped to the list). */
export function monthIndexAt(layout: CalendarLayout, y: number): number {
  const { offsets, months } = layout;
  let lo = 0;
  let hi = months.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (offsets[mid] <= y) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Index of the month holding an ISO date, or -1 if it's outside the list. */
export function monthIndexOf(layout: CalendarLayout, iso: string): number {
  const first = layout.months[0];
  if (!first) return -1;
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7)) - 1;
  const i = (y - first.year) * 12 + (m - first.month);
  return i >= 0 && i < layout.months.length ? i : -1;
}

/** Inclusive range of month indexes overlapping [top, bottom] px. */
export function visibleMonths(
  layout: CalendarLayout,
  top: number,
  bottom: number,
): [number, number] {
  return [monthIndexAt(layout, top), monthIndexAt(layout, bottom)];
}

export function isoDay(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Selection ────────────────────────────────────────────────────────────────

export function rangeHitsBlocked(from: string, to: string, blocked: IsoInterval[]): boolean {
  return blocked.some((b) => b.from <= to && b.to >= from);
}

/**
 * The range a tap on `day` produces. The first tap selects a one-day trip;
 * a later tap moves whichever end it falls beyond (or the exit, inside the
 * range); tapping a lone one-day selection clears it. A range that would
 * span a blocked day restarts from the tapped day with no exit.
 */
export function nextRange(
  day: string,
  current: IsoRange | undefined,
  blocked: IsoInterval[],
): IsoRange | undefined {
  let next: IsoRange | undefined;
  if (!current) {
    next = { from: day, to: day };
  } else if (!current.to) {
    next = day < current.from ? { from: day, to: current.from } : { from: current.from, to: day };
  } else if (day === current.from && day === current.to) {
    next = undefined;
  } else if (day === current.from || day === current.to) {
    next = { from: day, to: day };
  } else if (day < current.from) {
    next = { from: day, to: current.to };
  } else {
    next = { from: current.from, to: day };
  }

  if (next?.to && rangeHitsBlocked(next.from, next.to, blocked)) {
    next = { from: day };
  }
  return next;
}
