/**
 * utils/dates.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  parseDate,
  formatDate,
  todayISO,
  today,
  isSameDay,
  isOnOrBefore,
  isOnOrAfter,
  countTripDays,
  countDaysInWindow,
  isValidDateString,
} from "./dates";

// ─── Helper ────────────────────────────────────────────────────────────────────

const d = (iso: string) => parseDate(iso);

// ─── parseDate / formatDate ────────────────────────────────────────────────────

describe("parseDate", () => {
  it("parses a valid ISO string into a Date", () => {
    const result = parseDate("2024-03-15");
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2); // 0-indexed
    expect(result.getDate()).toBe(15);
  });

  it("round-trips through formatDate", () => {
    const iso = "2024-06-01";
    expect(formatDate(parseDate(iso))).toBe(iso);
  });
});

describe("formatDate", () => {
  it("formats a Date as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2024-11-05T00:00:00"))).toBe("2024-11-05");
  });

  it("zero-pads month and day", () => {
    expect(formatDate(new Date("2024-01-09T00:00:00"))).toBe("2024-01-09");
  });
});

// ─── today / todayISO ─────────────────────────────────────────────────────────

describe("today", () => {
  it("returns a Date whose formatted value matches todayISO", () => {
    expect(formatDate(today())).toBe(todayISO());
  });

  it("returns midnight (start of day)", () => {
    const t = today();
    expect(t.getHours()).toBe(0);
    expect(t.getMinutes()).toBe(0);
    expect(t.getSeconds()).toBe(0);
  });
});

describe("todayISO", () => {
  it("returns a string matching YYYY-MM-DD", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─── isSameDay ────────────────────────────────────────────────────────────────

describe("isSameDay", () => {
  it("returns true for identical dates", () => {
    expect(isSameDay(d("2024-06-01"), d("2024-06-01"))).toBe(true);
  });

  it("returns true regardless of time component", () => {
    const morning = new Date("2024-06-01T08:00:00");
    const evening = new Date("2024-06-01T20:00:00");
    expect(isSameDay(morning, evening)).toBe(true);
  });

  it("returns false for adjacent days", () => {
    expect(isSameDay(d("2024-06-01"), d("2024-06-02"))).toBe(false);
  });
});

// ─── isOnOrBefore ─────────────────────────────────────────────────────────────

describe("isOnOrBefore", () => {
  it("returns true when a is before b", () => {
    expect(isOnOrBefore(d("2024-01-01"), d("2024-06-01"))).toBe(true);
  });

  it("returns true when a equals b", () => {
    expect(isOnOrBefore(d("2024-06-01"), d("2024-06-01"))).toBe(true);
  });

  it("returns false when a is after b", () => {
    expect(isOnOrBefore(d("2024-06-02"), d("2024-06-01"))).toBe(false);
  });
});

// ─── isOnOrAfter ──────────────────────────────────────────────────────────────

describe("isOnOrAfter", () => {
  it("returns true when a is after b", () => {
    expect(isOnOrAfter(d("2024-06-02"), d("2024-06-01"))).toBe(true);
  });

  it("returns true when a equals b", () => {
    expect(isOnOrAfter(d("2024-06-01"), d("2024-06-01"))).toBe(true);
  });

  it("returns false when a is before b", () => {
    expect(isOnOrAfter(d("2024-01-01"), d("2024-06-01"))).toBe(false);
  });
});

// ─── countTripDays ────────────────────────────────────────────────────────────

describe("countTripDays", () => {
  it("counts 1 day for a same-day trip", () => {
    expect(countTripDays(d("2024-06-01"), d("2024-06-01"))).toBe(1);
  });

  it("counts both the entry and exit day (inclusive)", () => {
    // Jun 1, Jun 2, Jun 3 = 3 days
    expect(countTripDays(d("2024-06-01"), d("2024-06-03"))).toBe(3);
  });

  it("counts a 30-day trip correctly", () => {
    // Jan 1 – Jan 30 = 30 days
    expect(countTripDays(d("2024-01-01"), d("2024-01-30"))).toBe(30);
  });

  it("counts across a month boundary", () => {
    // Jan 30 – Feb 2 = Jan 30, 31, Feb 1, 2 = 4 days
    expect(countTripDays(d("2024-01-30"), d("2024-02-02"))).toBe(4);
  });

  it("counts across a year boundary", () => {
    // Dec 30 – Jan 2 = Dec 30, 31, Jan 1, 2 = 4 days
    expect(countTripDays(d("2023-12-30"), d("2024-01-02"))).toBe(4);
  });
});

// ─── countDaysInWindow ────────────────────────────────────────────────────────

describe("countDaysInWindow", () => {
  // Window: Jun 1 – Jun 30

  it("returns 0 when the trip ends before the window starts", () => {
    expect(
      countDaysInWindow(
        d("2024-05-01"),
        d("2024-05-31"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(0);
  });

  it("returns 0 when the trip starts after the window ends", () => {
    expect(
      countDaysInWindow(
        d("2024-07-01"),
        d("2024-07-15"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(0);
  });

  it("returns the full trip length when the trip is entirely inside the window", () => {
    // Trip Jun 10 – Jun 20 = 11 days, all inside Jun 1 – Jun 30
    expect(
      countDaysInWindow(
        d("2024-06-10"),
        d("2024-06-20"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(11);
  });

  it("clips a trip that starts before the window", () => {
    // Trip May 25 – Jun 05. Window Jun 1 – Jun 30. Overlap: Jun 1 – Jun 5 = 5 days.
    expect(
      countDaysInWindow(
        d("2024-05-25"),
        d("2024-06-05"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(5);
  });

  it("clips a trip that ends after the window", () => {
    // Trip Jun 25 – Jul 05. Window Jun 1 – Jun 30. Overlap: Jun 25 – Jun 30 = 6 days.
    expect(
      countDaysInWindow(
        d("2024-06-25"),
        d("2024-07-05"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(6);
  });

  it("clips a trip that straddles both window boundaries", () => {
    // Trip May 01 – Jul 31. Window Jun 1 – Jun 30. Overlap = 30 days.
    expect(
      countDaysInWindow(
        d("2024-05-01"),
        d("2024-07-31"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(30);
  });

  it("returns 1 when the trip touches only the first day of the window", () => {
    expect(
      countDaysInWindow(
        d("2024-05-31"),
        d("2024-06-01"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(1);
  });

  it("returns 1 when the trip touches only the last day of the window", () => {
    expect(
      countDaysInWindow(
        d("2024-06-30"),
        d("2024-07-01"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(1);
  });

  it("counts a same-day trip inside the window as 1 day", () => {
    expect(
      countDaysInWindow(
        d("2024-06-15"),
        d("2024-06-15"),
        d("2024-06-01"),
        d("2024-06-30"),
      ),
    ).toBe(1);
  });

  it("works correctly with a 180-day window (the Schengen window size)", () => {
    // Trip exactly spans the window: Jan 3 – Jun 30 in a window of Jan 3 – Jun 30 = 180 days
    const windowStart = d("2024-01-03");
    const windowEnd = d("2024-06-30");
    expect(
      countDaysInWindow(windowStart, windowEnd, windowStart, windowEnd),
    ).toBe(180);
  });
});

// ─── isValidDateString ────────────────────────────────────────────────────────

describe("isValidDateString", () => {
  it("returns true for a valid date string", () => {
    expect(isValidDateString("2024-06-15")).toBe(true);
  });

  it("returns true for a leap day in a leap year", () => {
    expect(isValidDateString("2024-02-29")).toBe(true);
  });

  it("returns false for a leap day in a non-leap year", () => {
    expect(isValidDateString("2023-02-29")).toBe(false);
  });

  it("returns false for wrong format (DD/MM/YYYY)", () => {
    expect(isValidDateString("15/06/2024")).toBe(false);
  });

  it("returns false for a partial string", () => {
    expect(isValidDateString("2024-06")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidDateString("")).toBe(false);
  });

  it("returns false for an invalid calendar date", () => {
    expect(isValidDateString("2024-13-01")).toBe(false); // month 13
    expect(isValidDateString("2024-06-31")).toBe(false); // June has 30 days
  });

  it("returns false for a string with a time component", () => {
    expect(isValidDateString("2024-06-15T12:00:00")).toBe(false);
  });
});
