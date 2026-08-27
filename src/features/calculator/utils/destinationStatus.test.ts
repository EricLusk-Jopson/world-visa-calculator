/**
 * Tests for the generic per-destination status engine.
 * Uses a Canadian passport ("CA") — entitled in every tracked region.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import {
  rankDestinationCandidates,
  determineActiveRegion,
  resolveDisplayRegion,
  computeDestinationStatus,
  isWithinLookback,
  categorizeAllDestinations,
  getAllTrackableRegions,
} from "./destinationStatus";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import { addDays, addMonths, differenceInCalendarDays, formatDate, parseDate } from "./dates";

const iso = (anchor: Date, offset: number) => formatDate(addDays(anchor, offset));

function trip(id: string, region: VisaRegion, entry: string, exit?: string): Trip {
  return { id, region, entryDate: entry, exitDate: exit };
}

function traveler(trips: Trip[], overrides: Partial<Traveler> = {}): Traveler {
  return { id: "t1", name: "Alex", passportCode: "CA", trips, ...overrides };
}

const REF = parseDate("2026-06-15");

describe("isWithinLookback", () => {
  it("includes a trip from 200 days ago", () => {
    const t = trip("a", VisaRegion.Schengen, iso(REF, -200));
    expect(isWithinLookback(t, REF)).toBe(true);
  });

  it("excludes a trip from 400 days ago", () => {
    const t = trip("a", VisaRegion.Schengen, iso(REF, -400));
    expect(isWithinLookback(t, REF)).toBe(false);
  });

  it("always includes future trips", () => {
    const t = trip("a", VisaRegion.Schengen, iso(REF, 400));
    expect(isWithinLookback(t, REF)).toBe(true);
  });
});

describe("rankDestinationCandidates / determineActiveRegion", () => {
  it("prioritises an ongoing trip over an upcoming one", () => {
    const trav = traveler([
      trip("upcoming", VisaRegion.UnitedKingdom, iso(REF, 10)),
      trip("ongoing", VisaRegion.Schengen, iso(REF, -5)), // no exitDate = ongoing
    ]);
    const candidates = rankDestinationCandidates(trav, REF);
    expect(candidates[0].region).toBe(VisaRegion.Schengen);
    expect(candidates[0].tier).toBe("ongoing");
    expect(determineActiveRegion(trav, REF)).toBe(VisaRegion.Schengen);
  });

  it("falls back to the soonest upcoming trip when nothing is ongoing", () => {
    const trav = traveler([
      trip("later", VisaRegion.Ireland, iso(REF, 30), iso(REF, 35)),
      trip("sooner", VisaRegion.UnitedKingdom, iso(REF, 10), iso(REF, 20)),
    ]);
    const candidates = rankDestinationCandidates(trav, REF);
    expect(candidates[0].region).toBe(VisaRegion.UnitedKingdom);
    expect(candidates[1].region).toBe(VisaRegion.Ireland);
  });

  it("falls back to the most recent past trip when nothing is ongoing or upcoming", () => {
    const trav = traveler([
      trip("older", VisaRegion.Ireland, iso(REF, -100), iso(REF, -90)),
      trip("recent", VisaRegion.UnitedKingdom, iso(REF, -20), iso(REF, -10)),
    ]);
    expect(determineActiveRegion(trav, REF)).toBe(VisaRegion.UnitedKingdom);
  });

  it("defaults to Schengen for a traveler with no trips", () => {
    expect(determineActiveRegion(traveler([]), REF)).toBe(VisaRegion.Schengen);
  });

  it("excludes Elsewhere trips and trips outside the lookback window", () => {
    const trav = traveler([
      trip("elsewhere", VisaRegion.Elsewhere, iso(REF, -5)),
      trip("stale", VisaRegion.Ireland, iso(REF, -400), iso(REF, -390)),
    ]);
    expect(rankDestinationCandidates(trav, REF)).toHaveLength(0);
  });
});

describe("resolveDisplayRegion", () => {
  it("honours an explicit override that is still within the lookback window", () => {
    const trav = traveler(
      [
        trip("ongoing", VisaRegion.Schengen, iso(REF, -5)),
        trip("upcoming", VisaRegion.UnitedKingdom, iso(REF, 10), iso(REF, 20)),
      ],
      { targetRegion: VisaRegion.UnitedKingdom },
    );
    expect(resolveDisplayRegion(trav, REF)).toBe(VisaRegion.UnitedKingdom);
  });

  it("honours an override even with no trip history there — any trackable region is previewable", () => {
    const trav = traveler(
      [trip("ongoing", VisaRegion.Schengen, iso(REF, -5))],
      { targetRegion: VisaRegion.Ireland }, // no Ireland trips at all
    );
    expect(resolveDisplayRegion(trav, REF)).toBe(VisaRegion.Ireland);
  });

  it("falls back to the active region for a non-trackable override (e.g. stale Elsewhere data)", () => {
    const trav = traveler(
      [trip("ongoing", VisaRegion.Schengen, iso(REF, -5))],
      { targetRegion: VisaRegion.Elsewhere },
    );
    expect(resolveDisplayRegion(trav, REF)).toBe(VisaRegion.Schengen);
  });
});

describe("computeDestinationStatus — rolling_window (Schengen)", () => {
  it("computes days used/remaining and a max-stay chip", () => {
    const trav = traveler([
      trip("a", VisaRegion.Schengen, iso(REF, -30), iso(REF, -10)), // 21 days, well within window
    ]);
    const status = computeDestinationStatus(trav, VisaRegion.Schengen, REF);
    expect(status.eligible).toBe(true);
    expect(status.ruleKind).toBe("rolling_window");
    expect(status.availableChip?.label).toBe("69d avail"); // 90 - 21
    expect(status.secondChip?.label).toMatch(/d max$/);
    expect(status.fillPct).toBeCloseTo((21 / 90) * 100, 5);
  });

  it("marks visa-required passports ineligible with no chips", () => {
    const trav = traveler([trip("a", VisaRegion.Schengen, iso(REF, -5))], {
      passportCode: "AF", // visa-required for Schengen
    });
    const status = computeDestinationStatus(trav, VisaRegion.Schengen, REF);
    expect(status.eligible).toBe(false);
    expect(status.availableChip).toBeNull();
    expect(status.secondChip).toBeNull();
  });
});

describe("computeDestinationStatus — per_visit (UK / Ireland)", () => {
  it("uses calendar months for the UK's 6-month limit, not a flat 180 days (regression)", () => {
    // Entering 1 Jul, the real limit is addMonths(entry, 6) = 1 Jan — 184
    // calendar days later. The old bug used a flat 180-day count instead,
    // which would report this traveler overstaying (negative days remaining)
    // 3 days before they actually run out of allowance.
    const entry = "2026-07-01";
    const checkDate = parseDate(iso(parseDate(entry), 182)); // day 183 of the stay
    const trav = traveler([trip("uk", VisaRegion.UnitedKingdom, entry)]);

    const status = computeDestinationStatus(trav, VisaRegion.UnitedKingdom, checkDate);

    const maxExit = addMonths(parseDate(entry), 6); // 2027-01-01
    const expectedDaysRemaining = differenceInCalendarDays(maxExit, checkDate);
    expect(expectedDaysRemaining).toBeGreaterThan(0); // sanity: still within the real limit

    expect(status.variant).not.toBe("danger");
    expect(status.availableChip?.label).toBe(`${expectedDaysRemaining}d avail`);
  });

  it("hides the cooldown chip for an ongoing trip that's comfortably within the limit", () => {
    const trav = traveler([trip("a", VisaRegion.UnitedKingdom, iso(REF, -10))]); // ongoing, short so far
    const status = computeDestinationStatus(trav, VisaRegion.UnitedKingdom, REF);
    expect(status.ruleKind).toBe("per_visit");
    expect(status.secondChip).toBeNull();
  });

  it("shows a cooldown chip (no day count) when the ongoing trip is itself near the limit", () => {
    // Ireland: 90-day limit, caution threshold = floor(90*5/6) = 75.
    const trav = traveler([trip("a", VisaRegion.Ireland, iso(REF, -80))]); // 81 days in, ongoing
    const status = computeDestinationStatus(trav, VisaRegion.Ireland, REF);
    expect(status.secondChip).not.toBeNull();
    expect(status.secondChip?.variant).toBe("caution");
    expect(status.secondChip?.label).not.toMatch(/\d/); // boolean-ish state, no day count
  });

  it("ignores a past trip and shows full availability when there's no current trip", () => {
    const trav = traveler([
      trip("prev", VisaRegion.Ireland, iso(REF, -100), iso(REF, -20)), // 81-day stay, long finished
    ]);
    const status = computeDestinationStatus(trav, VisaRegion.Ireland, REF);
    expect(status.variant).toBe("safe");
    expect(status.secondChip).toBeNull();
    expect(status.fillPct).toBe(0);
    expect(status.availableChip?.variant).toBe("safe");
  });

  it("ignores an upcoming trip and shows full availability until it starts", () => {
    const trav = traveler([trip("next", VisaRegion.UnitedKingdom, iso(REF, 10), iso(REF, 20))]);
    const status = computeDestinationStatus(trav, VisaRegion.UnitedKingdom, REF);
    expect(status.variant).toBe("safe");
    expect(status.secondChip).toBeNull();
    expect(status.fillPct).toBe(0);
  });

  it("treats a fully-dated trip that spans today as current, not full availability (regression)", () => {
    // Entry and exit both on file, today falls in between — this is exactly
    // as "there right now" as an open-ended trip with no exit date yet.
    const trav = traveler([
      trip("uk", VisaRegion.UnitedKingdom, iso(REF, -5), iso(REF, 20)),
    ]);
    const status = computeDestinationStatus(trav, VisaRegion.UnitedKingdom, REF);
    expect(status.summaryLine).not.toMatch(/not there today/i);
    expect(status.summaryLine).toMatch(/^Day 6 of/); // 6 days elapsed (entry..today inclusive)
    expect(status.fillPct).toBeGreaterThan(0);
  });
});

describe("pickActiveTrip — fully-dated current trips", () => {
  it("classifies a trip with both dates set that spans today as 'ongoing', not 'past'", () => {
    const trav = traveler([
      trip("uk", VisaRegion.UnitedKingdom, iso(REF, -5), iso(REF, 20)),
    ]);
    const candidates = rankDestinationCandidates(trav, REF);
    expect(candidates[0].tier).toBe("ongoing");
    expect(determineActiveRegion(trav, REF)).toBe(VisaRegion.UnitedKingdom);
  });
});

describe("categorizeAllDestinations", () => {
  it("includes every trackable region even with zero trips, as 'never', alphabetically", () => {
    const trav = traveler([]);
    const result = categorizeAllDestinations(trav, REF);
    expect(result).toHaveLength(getAllTrackableRegions().length);
    expect(result.every((d) => d.category === "never")).toBe(true);
    expect(result.map((d) => d.region)).toEqual([
      VisaRegion.Ireland,
      VisaRegion.Schengen,
      VisaRegion.Turkiye,
      VisaRegion.UnitedKingdom,
    ]);
  });

  it("categorizes a fully-dated trip spanning today as 'current'", () => {
    const trav = traveler([trip("uk", VisaRegion.UnitedKingdom, iso(REF, -5), iso(REF, 20))]);
    const result = categorizeAllDestinations(trav, REF);
    expect(result.find((d) => d.region === VisaRegion.UnitedKingdom)?.category).toBe("current");
  });

  it("puts a trip finished within the lookback window in 'recent', beyond it in 'old'", () => {
    const recentTrav = traveler([
      trip("a", VisaRegion.Ireland, iso(REF, -100), iso(REF, -90)), // 90 days ago
    ]);
    expect(
      categorizeAllDestinations(recentTrav, REF).find((d) => d.region === VisaRegion.Ireland)
        ?.category,
    ).toBe("recent");

    const oldTrav = traveler([
      trip("a", VisaRegion.Ireland, iso(REF, -500), iso(REF, -480)), // way beyond 365-day lookback
    ]);
    expect(
      categorizeAllDestinations(oldTrav, REF).find((d) => d.region === VisaRegion.Ireland)
        ?.category,
    ).toBe("old");
  });

  it("orders 'recent' by increasing age (most recently ended first)", () => {
    const trav = traveler([
      trip("older", VisaRegion.Ireland, iso(REF, -200), iso(REF, -190)),
      trip("newer", VisaRegion.UnitedKingdom, iso(REF, -50), iso(REF, -40)),
    ]);
    const recent = categorizeAllDestinations(trav, REF).filter((d) => d.category === "recent");
    expect(recent.map((d) => d.region)).toEqual([VisaRegion.UnitedKingdom, VisaRegion.Ireland]);
  });

  it("orders 'upcoming' by soonest entry first", () => {
    const trav = traveler([
      trip("later", VisaRegion.Ireland, iso(REF, 60)),
      trip("sooner", VisaRegion.UnitedKingdom, iso(REF, 10)),
    ]);
    const upcoming = categorizeAllDestinations(trav, REF).filter((d) => d.category === "upcoming");
    expect(upcoming.map((d) => d.region)).toEqual([VisaRegion.UnitedKingdom, VisaRegion.Ireland]);
  });

  it("prefers 'recent' over 'upcoming' when a region has both (first-match priority)", () => {
    const trav = traveler([
      trip("past", VisaRegion.Ireland, iso(REF, -30), iso(REF, -20)), // recent
      trip("future", VisaRegion.Ireland, iso(REF, 30)), // also upcoming
    ]);
    expect(
      categorizeAllDestinations(trav, REF).find((d) => d.region === VisaRegion.Ireland)?.category,
    ).toBe("recent");
  });

  it("prefers 'upcoming' over 'old' when a region has both", () => {
    const trav = traveler([
      trip("past", VisaRegion.Ireland, iso(REF, -500), iso(REF, -480)), // old
      trip("future", VisaRegion.Ireland, iso(REF, 30)), // upcoming
    ]);
    expect(
      categorizeAllDestinations(trav, REF).find((d) => d.region === VisaRegion.Ireland)?.category,
    ).toBe("upcoming");
  });
});

describe("date formatting — timezone safety (regression)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("doesn't shift the displayed date in a timezone behind UTC", () => {
    // A date-only ISO string must render as the SAME calendar day regardless
    // of the runtime's timezone. Parsing it with the native `new Date(iso)`
    // constructor reads it as UTC midnight, which then displays a day early
    // anywhere west of UTC (e.g. the Americas) — exactly the bug reported.
    vi.stubEnv("TZ", "America/Los_Angeles");
    const trav = traveler([trip("uk", VisaRegion.UnitedKingdom, "2026-08-05", "2026-09-30")]);
    const refDate = parseDate("2026-08-26");
    const status = computeDestinationStatus(trav, VisaRegion.UnitedKingdom, refDate);
    expect(status.summaryLine).toContain("26 Aug 2026");
    expect(status.summaryLine).not.toContain("25 Aug 2026");
  });
});

describe("computeDestinationStatus — unavailable region", () => {
  it("returns an ineligible status for Elsewhere", () => {
    const trav = traveler([trip("a", VisaRegion.Elsewhere, iso(REF, -5))]);
    const status = computeDestinationStatus(trav, VisaRegion.Elsewhere, REF);
    expect(status.eligible).toBe(false);
    expect(status.ruleKind).toBeNull();
  });
});
