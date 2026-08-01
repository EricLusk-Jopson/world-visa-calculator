/**
 * Tests for the generic, StayLimit-driven stay calculator.
 *
 * Expected values are derived from first principles below each test, not from
 * running the code. A Canadian passport ("CA") is used as the baseline traveler
 * because Canada is visa-free/entitled in every region we model:
 *
 *   Schengen        rolling_window 90 / 180
 *   United Kingdom  per_visit 6 months  (via ETA)
 *   Ireland         per_visit 90 days
 *   Türkiye         rolling_window 90 / 180
 *
 * so the same nationality exercises both limit families.
 */

import { describe, it, expect } from "vitest";
import {
  assessStay,
  detectReentryRisk,
  resolveStayLimits,
  perVisitApproxDays,
  assessRegionTripStay,
} from "./stayCalculator";
import { getPassportRule } from "@/data/regions";
import { VisaRegion, type Trip, type StayLimit } from "@/types";
import { addDays, addMonths, formatDate, parseDate } from "./dates";

// ─── Helpers ────────────────────────────────────────────────────────────────

const iso = (anchor: Date, offset: number) => formatDate(addDays(anchor, offset));

/** The limits a Canadian traveler gets for a region, from the real data. */
function caLimits(region: VisaRegion): [StayLimit, ...StayLimit[]] {
  const rule = getPassportRule(region, "CA");
  const limits = resolveStayLimits("CA", rule, null);
  if (!limits) throw new Error(`expected CA to have limits for region ${region}`);
  return limits;
}

function completedTrip(region: VisaRegion, entry: string, exit: string): Trip {
  return { id: `${entry}-${exit}`, region, entryDate: entry, exitDate: exit };
}

// ─── Rolling-window regions (Schengen & Türkiye) ──────────────────────────────

describe("assessStay — rolling_window (Canadian, no history)", () => {
  for (const region of [VisaRegion.Schengen, VisaRegion.Turkiye] as const) {
    const label = region === VisaRegion.Schengen ? "Schengen" : "Türkiye";

    it(`${label}: a 100-day trip overstays the 90-day allowance`, () => {
      // No history → maxDays = 90, maxExit = entry+89.
      // 100-day trip (entry..entry+99): daysRemaining = 90 − 100 = −10 → danger.
      const anchor = parseDate("2024-01-01");
      const result = assessStay(caLimits(region), [], "2024-01-01", iso(anchor, 99));

      expect(result).not.toBeNull();
      expect(result!.limitType).toBe("rolling_window");
      expect(result!.daysAllowed).toBe(90);
      expect(result!.tripDays).toBe(100);
      expect(result!.daysRemaining).toBe(-10);
      expect(result!.variant).toBe("danger");
    });

    it(`${label}: a 30-day trip is well within the allowance`, () => {
      // tripDays = 30, daysRemaining = 90 − 30 = 60 → safe.
      const anchor = parseDate("2024-01-01");
      const result = assessStay(caLimits(region), [], "2024-01-01", iso(anchor, 29));

      expect(result!.tripDays).toBe(30);
      expect(result!.daysRemaining).toBe(60);
      expect(result!.variant).toBe("safe");
    });

    it(`${label}: an 80-day trip is caution (≥ 75)`, () => {
      // caution threshold = floor(90 × 5/6) = 75. tripDays = 80 ≥ 75,
      // daysRemaining = 90 − 80 = 10 (≥ 0, not danger) → caution.
      const anchor = parseDate("2024-01-01");
      const result = assessStay(caLimits(region), [], "2024-01-01", iso(anchor, 79));

      expect(result!.tripDays).toBe(80);
      expect(result!.variant).toBe("caution");
    });
  }
});

// ─── UK — per_visit measured in calendar months ───────────────────────────────

describe("assessStay — UK per_visit (6 calendar months)", () => {
  it("resolves the max exit date by calendar month, not fixed days", () => {
    // 6 months from Jan 15 → Jul 15 (addMonths, no −1). This is the key
    // behavior the `unit: 'months'` field preserves.
    const result = assessStay(caLimits(VisaRegion.UnitedKingdom), [], "2024-01-15", "2024-02-14");

    expect(result!.limitType).toBe("per_visit");
    expect(result!.limitLabel).toBe("6-month");
    expect(result!.maxExitDate).toBe(formatDate(addMonths(parseDate("2024-01-15"), 6)));
    expect(result!.maxExitDate).toBe("2024-07-15");
  });

  it("a stay one day past the 6-month date overstays", () => {
    // maxExit = Jul 15. Exit Jul 16 → daysRemaining = −1 → danger.
    const result = assessStay(caLimits(VisaRegion.UnitedKingdom), [], "2024-01-15", "2024-07-16");

    expect(result!.daysRemaining).toBe(-1);
    expect(result!.variant).toBe("danger");
  });

  it("a short visit is safe", () => {
    // Jan 15 → Feb 14 = 31 days (< 150 caution), exit well before Jul 15.
    const result = assessStay(caLimits(VisaRegion.UnitedKingdom), [], "2024-01-15", "2024-02-14");

    expect(result!.tripDays).toBe(31);
    expect(result!.variant).toBe("safe");
  });
});

// ─── Ireland — per_visit measured in days ─────────────────────────────────────

describe("assessStay — Ireland per_visit (90 days)", () => {
  it("a 91-day stay overstays the 90-day permission", () => {
    // maxExit = entry+89. A 91-day trip (entry..entry+90):
    // daysRemaining = 89 − 90 = −1 → danger.
    const anchor = parseDate("2024-01-01");
    const result = assessStay(caLimits(VisaRegion.Ireland), [], "2024-01-01", iso(anchor, 90));

    expect(result!.limitLabel).toBe("90-day");
    expect(result!.maxExitDate).toBe(iso(anchor, 89));
    expect(result!.tripDays).toBe(91);
    expect(result!.daysRemaining).toBe(-1);
    expect(result!.variant).toBe("danger");
  });

  it("a 30-day stay is safe", () => {
    const anchor = parseDate("2024-01-01");
    const result = assessStay(caLimits(VisaRegion.Ireland), [], "2024-01-01", iso(anchor, 29));

    expect(result!.tripDays).toBe(30);
    expect(result!.variant).toBe("safe");
  });
});

// ─── Fixed window from first entry (Türkiye — Albania et al.) ─────────────────

describe("assessStay — fixed_window_from_entry (90 in 180 from entry)", () => {
  const limits: [StayLimit] = [
    { type: "fixed_window_from_entry", days: 90, windowDays: 180 },
  ];
  const anchor = parseDate("2026-08-01");

  it("gives a fresh 90-day budget with no history", () => {
    // No prior trips → window anchored at entry, maxExit = entry+89.
    // A 31-day trip (entry..entry+30) leaves 59 days.
    const r = assessStay(limits, [], "2026-08-01", iso(anchor, 30));
    expect(r!.limitType).toBe("fixed_window_from_entry");
    expect(r!.tripDays).toBe(31);
    expect(r!.maxExitDate).toBe(iso(anchor, 89));
    expect(r!.daysRemaining).toBe(59);
    expect(r!.variant).toBe("safe");
  });

  it("subtracts days already used earlier in the same window", () => {
    // Prior 30-day trip (Jun 1–30) sits in the same 180-day window as the Aug 1
    // entry (61 days later) → budget 60, so a 31-day trip leaves 29 days.
    const prior = completedTrip(VisaRegion.Turkiye, "2026-06-01", iso(parseDate("2026-06-01"), 29));
    const r = assessStay(limits, [prior], "2026-08-01", iso(anchor, 30));
    expect(r!.daysRemaining).toBe(29);
  });

  it("resets the window once a gap of at least windowDays passes", () => {
    // Prior trip in early January is >180 days before the Aug entry, so the
    // window resets and the full 90-day budget is available again.
    const prior = completedTrip(VisaRegion.Turkiye, "2026-01-01", "2026-03-01");
    const r = assessStay(limits, [prior], "2026-08-01", iso(anchor, 30));
    expect(r!.daysRemaining).toBe(59);
  });
});

// ─── Calendar-period limit (Türkiye — Belarus: 90 per calendar year) ──────────

describe("assessStay — calendar_period (90 per calendar year)", () => {
  const limits: [StayLimit] = [{ type: "calendar_period", days: 90, periodDays: 365 }];

  it("counts only days within the entry's calendar year", () => {
    // 40 days already used in Feb → budget 50; a 10-day Aug trip leaves 40.
    const prior = completedTrip(VisaRegion.Turkiye, "2026-02-01", iso(parseDate("2026-02-01"), 39));
    const entry = parseDate("2026-08-01");
    const r = assessStay(limits, [prior], "2026-08-01", iso(entry, 9));
    expect(r!.limitType).toBe("calendar_period");
    expect(r!.maxExitDate).toBe(iso(entry, 49));
    expect(r!.daysRemaining).toBe(40);
  });

  it("ignores days used in a different calendar year", () => {
    // A trip in the previous year does not count against this year's budget.
    const prior = completedTrip(VisaRegion.Turkiye, "2025-11-01", "2025-12-15");
    const entry = parseDate("2026-08-01");
    const r = assessStay(limits, [prior], "2026-08-01", iso(entry, 9));
    expect(r!.daysRemaining).toBe(80); // full 90 budget, 10-day trip → 80 left
  });
});

// ─── Re-entry risk (proportional thresholds, Ireland allowance = 90) ──────────

describe("detectReentryRisk", () => {
  // caution trigger = floor(90 × 5/6) = 75 days.
  // cooldown bands: danger < 67, caution < 135, safe < 180 (else null).
  const anchor = parseDate("2024-01-01");
  const maxTrip = completedTrip(VisaRegion.Ireland, "2024-01-01", iso(anchor, 89)); // 90 days

  it("flags danger when a max-duration stay is followed by immediate re-entry", () => {
    // Exit = entry+89. Re-enter 10 days later → daysSinceExit 10 < 67 → danger.
    const proposed = iso(anchor, 89 + 10);
    const risk = detectReentryRisk(90, [maxTrip], proposed);

    expect(risk).not.toBeNull();
    expect(risk!.lastTripDays).toBe(90);
    expect(risk!.daysSinceExit).toBe(10);
    expect(risk!.variant).toBe("danger");
  });

  it("is caution when re-entry falls in the middle cooldown band", () => {
    // 100 days after exit → 67 ≤ 100 < 135 → caution.
    const proposed = iso(anchor, 89 + 100);
    expect(detectReentryRisk(90, [maxTrip], proposed)!.variant).toBe("caution");
  });

  it("returns null once enough time has passed", () => {
    // 200 days after exit → ≥ 180 → no risk.
    const proposed = iso(anchor, 89 + 200);
    expect(detectReentryRisk(90, [maxTrip], proposed)).toBeNull();
  });

  it("returns null for a short previous trip (below the caution trigger)", () => {
    const shortTrip = completedTrip(VisaRegion.Ireland, "2024-01-01", iso(anchor, 29)); // 30 days
    const proposed = iso(anchor, 29 + 5);
    expect(detectReentryRisk(90, [shortTrip], proposed)).toBeNull();
  });
});

// ─── Unit conversion ──────────────────────────────────────────────────────────

describe("perVisitApproxDays", () => {
  it("converts each unit to an approximate day count", () => {
    expect(perVisitApproxDays({ type: "per_visit", value: 90, unit: "days" })).toBe(90);
    expect(perVisitApproxDays({ type: "per_visit", value: 3, unit: "weeks" })).toBe(21);
    expect(perVisitApproxDays({ type: "per_visit", value: 6, unit: "months" })).toBe(180);
    expect(perVisitApproxDays({ type: "per_visit", value: 2, unit: "years" })).toBe(730);
  });
});

// ─── Limit resolution & eligibility ──────────────────────────────────────────

describe("resolveStayLimits", () => {
  it("returns the entitlement limits for an entitled passport", () => {
    const rule = getPassportRule(VisaRegion.UnitedKingdom, "CA");
    const limits = resolveStayLimits("CA", rule, null);
    expect(limits).toEqual([{ type: "per_visit", value: 6, unit: "months" }]);
  });

  it("returns null for free_movement (no calculable per-visit cap)", () => {
    // German passport in Schengen → free_movement.
    const rule = getPassportRule(VisaRegion.Schengen, "DE");
    expect(resolveStayLimits("DE", rule, null)).toBeNull();
  });

  it("returns null for a visa-required passport", () => {
    // "ZZ" hits the region defaultRule (visa_required) in every region.
    const rule = getPassportRule(VisaRegion.UnitedKingdom, "ZZ");
    expect(resolveStayLimits("ZZ", rule, null)).toBeNull();
  });
});

// ─── High-level per-trip helper ───────────────────────────────────────────────

describe("assessRegionTripStay", () => {
  it("assesses a Canadian UK trip", () => {
    const trip = completedTrip(VisaRegion.UnitedKingdom, "2024-01-15", "2024-07-16");
    const info = assessRegionTripStay(VisaRegion.UnitedKingdom, "CA", trip, [trip]);

    expect(info).not.toBeNull();
    expect(info!.stayVariant).toBe("danger"); // one day past the 6-month date
  });

  it("returns null for a visa-required traveler", () => {
    const trip = completedTrip(VisaRegion.UnitedKingdom, "2024-01-15", "2024-02-15");
    expect(assessRegionTripStay(VisaRegion.UnitedKingdom, "ZZ", trip, [trip])).toBeNull();
  });

  it("returns null for the Elsewhere region", () => {
    const trip = completedTrip(VisaRegion.Elsewhere, "2024-01-15", "2024-02-15");
    expect(assessRegionTripStay(VisaRegion.Elsewhere, "CA", trip, [trip])).toBeNull();
  });
});
