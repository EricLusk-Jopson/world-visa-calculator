import { describe, it, expect } from "vitest";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import { addDays, formatDate, parseDate } from "../dates";
import {
  computeWindowMarkers,
  computeReturnMarkers,
  computeAgingMarkers,
  resolveRollingWindow,
  thresholdsFor,
  assignRegionMarkerColours,
  assignChipSlots,
  markerRegions,
  REGION_MARKER_PALETTE,
} from ".";

const START = parseDate("2026-01-01");
const END = parseDate("2026-12-31");
const iso = (offset: number) => formatDate(addDays(START, offset));

function trip(id: string, region: VisaRegion, entry: string, exit?: string): Trip {
  return { id, region, entryDate: entry, exitDate: exit };
}

function traveler(passportCode: string | null, trips: Trip[]): Traveler {
  return { id: "t1", name: "Alex", passportCode, trips };
}

describe("resolveRollingWindow", () => {
  it("gives the passport's own window, not just Schengen's", () => {
    expect(resolveRollingWindow(VisaRegion.Schengen, "US", iso(0))).toEqual({
      maxDays: 90,
      windowSize: 180,
    });
    expect(resolveRollingWindow(VisaRegion.Turkiye, "US", iso(0))).toEqual({
      maxDays: 90,
      windowSize: 180,
    });
    expect(resolveRollingWindow(VisaRegion.Armenia, "US", iso(0))).toEqual({
      maxDays: 180,
      windowSize: 365,
    });
  });

  it("is null where a visa is required", () => {
    expect(resolveRollingWindow(VisaRegion.Schengen, "IN", iso(0))).toBeNull();
  });

  it("is null for regions without a rolling window", () => {
    expect(resolveRollingWindow(VisaRegion.UnitedKingdom, "US", iso(0))).toBeNull();
    expect(resolveRollingWindow(VisaRegion.Elsewhere, "US", iso(0))).toBeNull();
  });

  it("carries a stacked per-visit cap", () => {
    expect(resolveRollingWindow(VisaRegion.Serbia, "BY", iso(0))).toEqual({
      maxDays: 90,
      windowSize: 180,
      perVisitCap: 30,
    });
  });
});

describe("thresholdsFor", () => {
  it("steps in sixths of the allowance", () => {
    expect(thresholdsFor(90)).toEqual([15, 30, 45, 60, 75, 90]);
    expect(thresholdsFor(180)).toEqual([30, 60, 90, 120, 150, 180]);
    expect(thresholdsFor(30)).toEqual([5, 10, 15, 20, 25, 30]);
  });
});

describe("computeWindowMarkers", () => {
  it("marks Schengen as before: aging at entry + 180, milestones to 90", () => {
    const t = traveler("US", [
      trip("a", VisaRegion.Schengen, iso(10), iso(99)), // 90 days
    ]);
    const { returnMarkers, agingMarkers } = computeWindowMarkers(t, START, END);

    expect(agingMarkers).toHaveLength(1);
    expect(agingMarkers[0].region).toBe(VisaRegion.Schengen);
    expect(formatDate(agingMarkers[0].date)).toBe(iso(190));
    expect(agingMarkers[0].tripDays).toBe(90);

    // The whole trip frees up at once, so only the highest milestone gets a
    // chip — not six stacked on the same date.
    const after = returnMarkers.filter((m) => !m.isCurrent);
    expect(after.map((m) => m.days)).toEqual([90]);
    expect(formatDate(after[0].date)).toBe(iso(190));
  });

  it("gives staggered trips a chip per milestone they open up", () => {
    const t = traveler("US", [
      trip("a", VisaRegion.Schengen, iso(10), iso(39)), // 30 days
      trip("b", VisaRegion.Schengen, iso(100), iso(159)), // 60 days
    ]);
    const after = computeReturnMarkers(t, VisaRegion.Schengen, START, END)
      .filter((m) => !m.isCurrent);
    const days = after.map((m) => m.days);
    expect(days.length).toBeGreaterThan(1);
    expect(days).toEqual([...days].sort((x, y) => x - y));
    expect(new Set(after.map((m) => formatDate(m.date))).size).toBe(after.length);
    expect(days[days.length - 1]).toBe(90);
  });

  it("marks every rolling-window destination the traveller visits", () => {
    const t = traveler("US", [
      trip("s", VisaRegion.Schengen, iso(10), iso(99)),
      trip("t", VisaRegion.Turkiye, iso(110), iso(199)),
      trip("m", VisaRegion.Montenegro, iso(5), iso(30)),
      trip("u", VisaRegion.UnitedKingdom, iso(220), iso(230)),
    ]);
    const markers = computeWindowMarkers(t, START, END);
    const regions = markerRegions([markers]);

    expect(regions).toEqual(
      new Set([VisaRegion.Schengen, VisaRegion.Turkiye, VisaRegion.Montenegro]),
    );
    const turkiyeAging = markers.agingMarkers.find(
      (m) => m.region === VisaRegion.Turkiye,
    )!;
    expect(formatDate(turkiyeAging.date)).toBe(iso(290));
  });

  it("uses the passport's window length for aging (Armenia 180-in-365)", () => {
    const t = traveler("US", [
      trip("a", VisaRegion.Armenia, "2025-11-01", "2026-04-29"), // 180 days
    ]);
    const aging = computeAgingMarkers(t, VisaRegion.Armenia, START, END);
    expect(aging).toHaveLength(1);
    expect(formatDate(aging[0].date)).toBe("2026-11-01");

    const thresholds = computeReturnMarkers(t, VisaRegion.Armenia, START, END)
      .filter((m) => !m.isCurrent)
      .map((m) => m.days);
    expect(thresholds).toEqual([180]);
  });

  it("never offers more than a stacked per-visit cap", () => {
    const t = traveler("BY", [trip("a", VisaRegion.Serbia, iso(10), iso(39))]);
    const markers = computeReturnMarkers(t, VisaRegion.Serbia, START, END);
    expect(markers.length).toBeGreaterThan(0);
    expect(Math.max(...markers.map((m) => m.days))).toBeLessThanOrEqual(30);
    expect(markers.every((m) => m.allowance === 30)).toBe(true);
  });

  it("draws nothing where the passport needs a visa", () => {
    const t = traveler("IN", [trip("a", VisaRegion.Schengen, iso(10), iso(40))]);
    const { returnMarkers, agingMarkers } = computeWindowMarkers(t, START, END);
    expect(returnMarkers).toEqual([]);
    expect(agingMarkers).toEqual([]);
  });
});

describe("assignRegionMarkerColours", () => {
  it("hands out the palette in canonical order, Schengen first", () => {
    const colours = assignRegionMarkerColours([
      VisaRegion.Albania,
      VisaRegion.Turkiye,
      VisaRegion.Schengen,
    ]);
    expect(colours.get(VisaRegion.Schengen)).toBe(REGION_MARKER_PALETTE[0]);
    expect(colours.get(VisaRegion.Turkiye)).toBe(REGION_MARKER_PALETTE[1]);
    expect(colours.get(VisaRegion.Albania)).toBe(REGION_MARKER_PALETTE[2]);
  });
});

describe("assignChipSlots", () => {
  it("moves chips that would overlap into the next slot", () => {
    expect(assignChipSlots([100, 105, 300, 108, 200], 15)).toEqual([
      0, 1, 0, 2, 0,
    ]);
  });
});
