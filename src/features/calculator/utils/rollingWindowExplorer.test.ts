/**
 * Tests for the rolling-window explorer's data layer. Limits come from the
 * real region data: a Canadian passport ("CA") gets Schengen 90/180, a US
 * one ("US") gets Schengen 90/180 and Armenia 180/365, a Russian one ("RU")
 * gets Türkiye 60/180, a German one ("DE") has free movement in Schengen,
 * and the UK is per-visit for everyone.
 */

import { describe, it, expect } from "vitest";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import {
  buildExplorerRows,
  buildTravelerTimelines,
  clampDate,
  countTripsOutside,
  fitBounds,
  getRollingLimit,
  listExplorerDestinations,
  longestWindowDays,
  rowWindowStats,
  tripDaysInWindow,
  tripLength,
  tripOverlaps,
  windowBands,
} from "./rollingWindowExplorer";

let nextId = 0;
function trip(region: VisaRegion, entryDate: string, exitDate?: string): Trip {
  return { id: `t${nextId++}`, region, entryDate, exitDate };
}
function traveler(name: string, passportCode: string | null, trips: Trip[]): Traveler {
  return { id: name, name, passportCode, trips };
}

const ON = "2026-06-01";

describe("getRollingLimit", () => {
  it("resolves the passport's own window, not just the region's", () => {
    expect(getRollingLimit({ passportCode: "CA" }, VisaRegion.Schengen, ON)).toEqual({
      type: "rolling_window",
      days: 90,
      windowDays: 180,
    });
    expect(getRollingLimit({ passportCode: "RU" }, VisaRegion.Turkiye, ON)?.days).toBe(60);
  });

  it("is null when the passport has no rolling window there", () => {
    expect(getRollingLimit({ passportCode: "DE" }, VisaRegion.Schengen, ON)).toBeNull();
    expect(getRollingLimit({ passportCode: "CA" }, VisaRegion.UnitedKingdom, ON)).toBeNull();
  });
});

describe("listExplorerDestinations", () => {
  it("lists visited destinations, most trips first, and flags per-visit ones", () => {
    const travelers = [
      traveler("Ann", "CA", [
        trip(VisaRegion.UnitedKingdom, "2026-01-01", "2026-01-05"),
        trip(VisaRegion.Schengen, "2026-02-01", "2026-02-10"),
        trip(VisaRegion.Elsewhere, "2026-03-01", "2026-03-10"),
      ]),
      traveler("Bo", "CA", [trip(VisaRegion.Schengen, "2026-02-01", "2026-02-10")]),
    ];
    expect(listExplorerDestinations(travelers, ON)).toEqual([
      { region: VisaRegion.Schengen, tripCount: 2, supported: true },
      { region: VisaRegion.UnitedKingdom, tripCount: 1, supported: false },
    ]);
  });

  it("only counts trips inside the date range", () => {
    const travelers = [
      traveler("Ann", "CA", [
        trip(VisaRegion.UnitedKingdom, "2025-01-01", "2025-01-05"),
        trip(VisaRegion.Schengen, "2025-12-25", "2026-01-10"),
      ]),
    ];
    const bounds = { start: "2026-01-01", end: "2026-12-31" };
    expect(listExplorerDestinations(travelers, ON, bounds)).toEqual([
      { region: VisaRegion.Schengen, tripCount: 1, supported: true },
    ]);
    expect(countTripsOutside(travelers, bounds)).toBe(1);
  });
});

describe("tripOverlaps", () => {
  const bounds = { start: "2026-01-01", end: "2026-12-31" };
  it("counts a trip touching either edge", () => {
    expect(tripOverlaps(trip(VisaRegion.Schengen, "2025-12-01", "2026-01-01"), bounds)).toBe(true);
    expect(tripOverlaps(trip(VisaRegion.Schengen, "2026-12-31", "2027-01-05"), bounds)).toBe(true);
    expect(tripOverlaps(trip(VisaRegion.Schengen, "2025-12-01", "2025-12-31"), bounds)).toBe(false);
  });
});

describe("timelines and window bands", () => {
  const ann = traveler("Ann", "US", [
    trip(VisaRegion.Armenia, "2026-03-01", "2026-03-10"),
    trip(VisaRegion.Elsewhere, "2026-02-01", "2026-02-10"),
    trip(VisaRegion.Schengen, "2026-01-01", "2026-01-10"),
  ]);

  it("keeps every trip on the traveler's row, sorted", () => {
    const [timeline] = buildTravelerTimelines([ann], [VisaRegion.Schengen], ON);
    expect(timeline.trips.map((t) => t.region)).toEqual([
      VisaRegion.Schengen,
      VisaRegion.Elsewhere,
      VisaRegion.Armenia,
    ]);
    expect(timeline.jurisdictions.map((j) => j.region)).toEqual([VisaRegion.Schengen]);
  });

  it("draws one band per window length, longest first", () => {
    const [timeline] = buildTravelerTimelines(
      [ann],
      [VisaRegion.Schengen, VisaRegion.Armenia],
      ON,
    );
    const bands = windowBands(timeline, ON);
    expect(bands.map((b) => b.windowDays)).toEqual([365, 180]);
    expect(bands[0].members.map((m) => m.region)).toEqual([VisaRegion.Armenia]);
    expect(bands[1].members[0].stats.daysUsed).toBe(10);
    expect(bands.some((b) => b.over)).toBe(false);
  });

  it("skips destinations the traveler hasn't been to", () => {
    const [timeline] = buildTravelerTimelines([ann], [VisaRegion.Turkiye], ON);
    expect(timeline.jurisdictions[0].limit).not.toBeNull();
    expect(windowBands(timeline, ON)).toEqual([]);
  });

  it("finds the longest window among visited destinations", () => {
    expect(longestWindowDays([ann], ON)).toBe(365);
    expect(longestWindowDays([traveler("Bo", "CA", [])], ON)).toBe(180);
  });
});

describe("buildExplorerRows", () => {
  it("makes one row per destination × traveler, trips sorted, with reasons", () => {
    const travelers = [
      traveler("Ann", "CA", [
        trip(VisaRegion.Schengen, "2026-04-01", "2026-04-10"),
        trip(VisaRegion.Schengen, "2026-01-01", "2026-01-10"),
      ]),
      traveler("Dirk", "DE", []),
    ];
    const rows = buildExplorerRows(travelers, [VisaRegion.Schengen], ON);
    expect(rows.map((r) => r.key)).toEqual([
      `Ann:${VisaRegion.Schengen}`,
      `Dirk:${VisaRegion.Schengen}`,
    ]);
    expect(rows[0].trips.map((t) => t.entryDate)).toEqual(["2026-01-01", "2026-04-01"]);
    expect(rows[0].limit?.windowDays).toBe(180);
    expect(rows[1].limit).toBeNull();
    expect(rows[1].noLimitReason).toMatch(/free movement/i);
  });
});

describe("rowWindowStats", () => {
  const ann = traveler("Ann", "CA", [
    // 50 days: Jan 1 – Feb 19
    trip(VisaRegion.Schengen, "2026-01-01", "2026-02-19"),
    // 50 days: Apr 1 – May 20
    trip(VisaRegion.Schengen, "2026-04-01", "2026-05-20"),
  ]);
  const [row] = buildExplorerRows([ann], [VisaRegion.Schengen], ON);

  it("counts both trips when the window covers them", () => {
    // Window ending May 20 starts Nov 22 2025 (May 20 − 179).
    expect(rowWindowStats(row, "2026-05-20")).toEqual({
      windowStart: "2025-11-22",
      windowEnd: "2026-05-20",
      daysUsed: 100,
      allowance: 90,
      remaining: 0,
      over: true,
    });
  });

  it("drops days as they age out of the window", () => {
    // Window ending Jul 15 starts Jan 17: Jan 17 – Feb 19 is 34 days, + 50.
    const stats = rowWindowStats(row, "2026-07-15");
    expect(stats?.daysUsed).toBe(84);
    expect(stats?.remaining).toBe(6);
    expect(stats?.over).toBe(false);
  });

  it("is null for a row with no rolling window", () => {
    const [dirk] = buildExplorerRows([traveler("Dirk", "DE", [])], [VisaRegion.Schengen], ON);
    expect(rowWindowStats(dirk, ON)).toBeNull();
  });
});

describe("trip helpers", () => {
  const t = trip(VisaRegion.Schengen, "2026-01-01", "2026-01-31");

  it("counts entry and exit days", () => {
    expect(tripLength(t)).toBe(31);
  });

  it("clips a trip to the window", () => {
    expect(tripDaysInWindow(t, "2026-01-20", "2026-06-01")).toBe(12);
    expect(tripDaysInWindow(t, "2026-02-01", "2026-06-01")).toBe(0);
  });
});

describe("fitBounds", () => {
  const trips = [trip(VisaRegion.Schengen, "2026-03-15", "2026-04-10")];

  it("runs from a month before the first trip to a window after the last, snapped to months", () => {
    // Mar 15 − 30 = Feb 13 → Feb 1. Apr 10 + 180 = Oct 7 → Oct 31.
    expect(fitBounds(trips)).toEqual({ start: "2026-02-01", end: "2026-10-31" });
  });

  it("leaves room for a longer window", () => {
    // Apr 10 + 365 = Apr 10 2027 → Apr 30 2027.
    expect(fitBounds(trips, 365).end).toBe("2027-04-30");
  });
});

describe("clampDate", () => {
  it("keeps a date inside the bounds", () => {
    const b = { start: "2026-01-01", end: "2026-12-31" };
    expect(clampDate("2025-06-01", b)).toBe("2026-01-01");
    expect(clampDate("2027-06-01", b)).toBe("2026-12-31");
    expect(clampDate("2026-06-01", b)).toBe("2026-06-01");
  });
});
