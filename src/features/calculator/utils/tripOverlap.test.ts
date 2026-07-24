import { describe, it, expect } from "vitest";
import { blockedTripRanges, hasBlockingOverlap, isDateBlocked } from "./tripOverlap";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import { parseDate } from "./dates";

function trip(id: string, entry: string, exit: string, region = VisaRegion.Turkiye): Trip {
  return { id, entryDate: entry, exitDate: exit, region };
}

function traveler(id: string, trips: Trip[]): Traveler {
  return { id, name: id, passportCode: null, trips };
}

const T = [traveler("t1", [trip("a", "2026-09-01", "2026-09-30")])];

describe("hasBlockingOverlap", () => {
  it("flags an identical trip", () => {
    expect(hasBlockingOverlap(T, ["t1"], "2026-09-01", "2026-09-30")).toBe(true);
  });

  it("flags an interior overlap", () => {
    // Sep 15–Oct 15 shares Sep 15–30 (16 days) with the existing trip.
    expect(hasBlockingOverlap(T, ["t1"], "2026-09-15", "2026-10-15")).toBe(true);
  });

  it("allows a single touching day (entry on the other trip's exit)", () => {
    // New trip starts Sep 30 (existing exit) → 1-day overlap, allowed.
    expect(hasBlockingOverlap(T, ["t1"], "2026-09-30", "2026-10-15")).toBe(false);
  });

  it("allows a single touching day (exit on the other trip's entry)", () => {
    expect(hasBlockingOverlap(T, ["t1"], "2026-08-15", "2026-09-01")).toBe(false);
  });

  it("allows a fully separate trip", () => {
    expect(hasBlockingOverlap(T, ["t1"], "2026-10-05", "2026-10-20")).toBe(false);
  });

  it("excludes the trip being edited", () => {
    expect(hasBlockingOverlap(T, ["t1"], "2026-09-01", "2026-09-30", "a")).toBe(false);
  });

  it("checks every selected traveler", () => {
    const two = [
      traveler("t1", []),
      traveler("t2", [trip("b", "2026-09-01", "2026-09-30")]),
    ];
    expect(hasBlockingOverlap(two, ["t1", "t2"], "2026-09-10", "2026-09-20")).toBe(true);
  });
});

describe("blockedTripRanges / isDateBlocked", () => {
  it("blocks interior days but leaves the first and last day open", () => {
    const ranges = blockedTripRanges(T, ["t1"]);
    expect(isDateBlocked(parseDate("2026-09-01"), ranges)).toBe(false); // first day
    expect(isDateBlocked(parseDate("2026-09-02"), ranges)).toBe(true); // interior
    expect(isDateBlocked(parseDate("2026-09-29"), ranges)).toBe(true); // interior
    expect(isDateBlocked(parseDate("2026-09-30"), ranges)).toBe(false); // last day
    expect(isDateBlocked(parseDate("2026-10-01"), ranges)).toBe(false); // outside
  });

  it("contributes nothing for a trip shorter than three days", () => {
    const short = [traveler("t1", [trip("a", "2026-09-01", "2026-09-02")])];
    expect(blockedTripRanges(short, ["t1"])).toHaveLength(0);
  });

  it("excludes the trip being edited", () => {
    expect(blockedTripRanges(T, ["t1"], "a")).toHaveLength(0);
  });
});
