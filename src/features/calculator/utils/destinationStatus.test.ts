/**
 * Tests for the generic per-destination status engine.
 * Uses a Canadian passport ("CA") — entitled in every tracked region.
 */

import { describe, it, expect } from "vitest";
import {
  rankDestinationCandidates,
  determineActiveRegion,
  resolveDisplayRegion,
  computeDestinationStatus,
  isWithinLookback,
} from "./destinationStatus";
import { VisaRegion, type Traveler, type Trip } from "@/types";
import { addDays, formatDate, parseDate } from "./dates";

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

  it("falls back to the active region when the override drops out of the lookback window", () => {
    const trav = traveler(
      [trip("ongoing", VisaRegion.Schengen, iso(REF, -5))],
      { targetRegion: VisaRegion.Ireland }, // no Ireland trips at all
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
  it("shows a 'no cooldown risk' chip when there is no prior long stay", () => {
    const trav = traveler([trip("a", VisaRegion.UnitedKingdom, iso(REF, -10))]); // ongoing, short so far
    const status = computeDestinationStatus(trav, VisaRegion.UnitedKingdom, REF);
    expect(status.ruleKind).toBe("per_visit");
    expect(status.secondChip?.variant).toBe("neutral");
    expect(status.secondChip?.label).toBe("No cooldown risk");
  });

  it("flags cooldown risk after a near-maximum-length prior visit followed by a quick re-entry", () => {
    const trav = traveler([
      trip("prev", VisaRegion.Ireland, iso(REF, -100), iso(REF, -20)), // 81-day stay, close to 90
      trip("next", VisaRegion.Ireland, iso(REF, -5)), // re-entered 15 days after exit
    ]);
    const status = computeDestinationStatus(trav, VisaRegion.Ireland, REF);
    expect(status.secondChip?.variant).toBe("danger");
    expect(status.secondChip?.label).toMatch(/cooldown$/);
    expect(status.note.length).toBeGreaterThan(0);
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
