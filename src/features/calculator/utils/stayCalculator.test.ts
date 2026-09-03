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
  selectEntitlement,
  computeFixedWindowStatus,
} from "./stayCalculator";
import { getPassportRule } from "@/data/regions";
import { VisaRegion, type Trip, type StayLimit, type EntitledRule } from "@/types";
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

// ─── Fixed window from first entry ─────────────────────────────────────────────
//
// Reserved infrastructure: no active region currently uses this shape.
// Türkiye's superficially similar "from first entry" MFA wording is
// deliberately classified as rolling_window instead (Law No. 6458 Art.
// 11(1) caps every exemption at 90-in-180 regardless of wording), and an
// earlier version of montenegro.ts used fixed_window_from_entry but was
// reverted to rolling_window — a fixed window anchored to first entry and
// reset by any windowDays-or-more gap permits up to 180 of 182 consecutive
// days by timing re-entry against the anchor, which no source we've
// encountered actually intends. Kept and tested here for a future region
// where a primary source explicitly confirms genuine reset behavior.

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

describe("computeFixedWindowStatus (region-level status card math)", () => {
  const config = { days: 90, windowDays: 180 };

  it("computes days used/remaining and a max-stay figure with a single trip in the window", () => {
    const ref = "2026-06-15";
    const trips = [completedTrip(VisaRegion.Turkiye, iso(parseDate(ref), -30), iso(parseDate(ref), -10))]; // 21 days
    const status = computeFixedWindowStatus(config, trips, ref);
    expect(status.daysUsed).toBe(21);
    expect(status.daysRemaining).toBe(69);
    expect(status.maxStay).toBe(69); // window end is far off, no truncation
    expect(status.canEnter).toBe(true);
  });

  it("does not let a later trip reset the budget within the same 180-day window", () => {
    const ref = "2026-06-15";
    const trips = [
      completedTrip(VisaRegion.Turkiye, iso(parseDate(ref), -100), iso(parseDate(ref), -90)), // 11 days
      completedTrip(VisaRegion.Turkiye, iso(parseDate(ref), -9), iso(parseDate(ref), -1)), // 9 days
    ];
    const status = computeFixedWindowStatus(config, trips, ref);
    expect(status.daysRemaining).toBe(70); // 90 - (11 + 9)
  });

  it("resets the window once a gap of at least windowDays passes", () => {
    const ref = "2026-06-15";
    const trips = [completedTrip(VisaRegion.Turkiye, iso(parseDate(ref), -300), iso(parseDate(ref), -290))]; // stale
    const status = computeFixedWindowStatus(config, trips, ref);
    expect(status.daysRemaining).toBe(90); // stale trip aged out of the window
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

// ─── selectEntitlement (temporalWindows-gated entitlement selection) ─────────

describe("selectEntitlement", () => {
  it("matches a plain unconditional entitlement with isOverride: false", () => {
    const rule: EntitledRule = {
      access: "entitled",
      entitlements: [{ limits: [{ type: "per_visit", value: 90, unit: "days" }] }],
    };
    const selection = selectEntitlement(rule, "2026-06-01");
    expect(selection).not.toBeNull();
    expect(selection!.isOverride).toBe(false);
    expect(selection!.baseEntitlement).toBeUndefined();
  });

  it("selects a seasonal entitlement inside its window and surfaces the unconditional fallback as baseEntitlement", () => {
    const seasonal: EntitledRule = {
      access: "entitled",
      entitlements: [
        {
          temporalWindows: [{
            validFrom: "2026-05-01",
            validUntil: "2026-10-01",
            description: "Seasonal waiver",
          }],
          limits: [{ type: "per_visit", value: 30, unit: "days" }],
        },
        { limits: [{ type: "per_visit", value: 90, unit: "days" }] }, // unconditional fallback
      ],
    };

    const inSeason = selectEntitlement(seasonal, "2026-06-15");
    expect(inSeason).not.toBeNull();
    expect(inSeason!.isOverride).toBe(true);
    expect(inSeason!.baseEntitlement).toBe(seasonal.entitlements[1]);
    expect(inSeason!.activeWindow).toBe(seasonal.entitlements[0].temporalWindows![0]);
    expect((inSeason!.selected.limits[0] as { value: number }).value).toBe(30);

    // Outside the window, the unconditional fallback matches directly —
    // no override, since the fallback itself carries no temporalWindows.
    const outOfSeason = selectEntitlement(seasonal, "2026-12-01");
    expect(outOfSeason).not.toBeNull();
    expect(outOfSeason!.isOverride).toBe(false);
    expect(outOfSeason!.activeWindow).toBeUndefined();
    expect((outOfSeason!.selected.limits[0] as { value: number }).value).toBe(90);
  });

  it("returns null when no entitlement's temporal window matches and there is no unconditional fallback", () => {
    const seasonalOnly: EntitledRule = {
      access: "entitled",
      entitlements: [{
        temporalWindows: [{
          validFrom: "2026-05-01",
          validUntil: "2026-10-01",
          description: "Seasonal waiver",
        }],
        limits: [{ type: "per_visit", value: 30, unit: "days" }],
      }],
    };
    expect(selectEntitlement(seasonalOnly, "2026-12-01")).toBeNull();
  });

  it("treats validFrom/validUntil as inclusive boundaries", () => {
    const rule: EntitledRule = {
      access: "entitled",
      entitlements: [{
        temporalWindows: [{
          validFrom: "2026-05-01",
          validUntil: "2026-10-01",
          description: "Seasonal waiver",
        }],
        limits: [{ type: "per_visit", value: 30, unit: "days" }],
      }],
    };
    expect(selectEntitlement(rule, "2026-05-01")).not.toBeNull();
    expect(selectEntitlement(rule, "2026-10-01")).not.toBeNull();
    expect(selectEntitlement(rule, "2026-04-30")).toBeNull();
    expect(selectEntitlement(rule, "2026-10-02")).toBeNull();
  });

  it("a window with no stated validFrom matches an entry date far in the past — the placeholder-date bug this replaces", () => {
    // This is the literal regression test for the reported bug: Turkey's
    // waiver source states only an end date, so validFrom must never be
    // filled in with "today" or any other placeholder — a trip booked
    // well before the window was even recorded should still resolve as
    // entitled, since the waiver was almost certainly already in effect.
    const rule: EntitledRule = {
      access: "entitled",
      entitlements: [{
        temporalWindows: [{ validUntil: "2026-10-31", description: "Temporary waiver" }],
        limits: [{ type: "per_visit", value: 30, unit: "days" }],
      }],
    };
    const selection = selectEntitlement(rule, "2020-01-01");
    expect(selection).not.toBeNull();
    expect(selection!.isOverride).toBe(true);
    expect(selection!.activeWindow?.validUntil).toBe("2026-10-31");
  });

  it("chains a second window (no stated validFrom) to start the day after the first window's validUntil", () => {
    const rule: EntitledRule = {
      access: "entitled",
      entitlements: [{
        temporalWindows: [
          { validUntil: "2026-06-30", description: "First waiver" },
          { validUntil: "2026-10-31", description: "Renewed waiver" }, // no validFrom — chains from above
        ],
        limits: [{ type: "per_visit", value: 30, unit: "days" }],
      }],
    };
    // Well before the first window — still matches it (unbounded past).
    expect(selectEntitlement(rule, "2020-01-01")!.activeWindow?.description).toBe("First waiver");
    // On the boundary — 30 June still belongs to the first window...
    expect(selectEntitlement(rule, "2026-06-30")!.activeWindow?.description).toBe("First waiver");
    // ...and 1 July (the very next day) already belongs to the second, chained window.
    expect(selectEntitlement(rule, "2026-07-01")!.activeWindow?.description).toBe("Renewed waiver");
    expect(selectEntitlement(rule, "2026-10-31")!.activeWindow?.description).toBe("Renewed waiver");
    // Past both windows entirely.
    expect(selectEntitlement(rule, "2026-11-01")).toBeNull();
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
