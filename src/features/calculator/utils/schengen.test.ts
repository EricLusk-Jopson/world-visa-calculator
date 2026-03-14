/**
 * All expected values are derived from first principles below each test,
 * not from running the code.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMaxStay,
  SCHENGEN_MAX_DAYS,
  SCHENGEN_WINDOW_SIZE,
} from "./schengen";
import { VisaRegion, type Trip } from "../../../types";
import { addDays, formatDate, parseDate } from "./dates";

// ─── Helper ────────────────────────────────────────────────────────────────────

/** Build a completed Trip whose dates are expressed as offsets from `anchor`. */
function makeTrip(anchor: Date, startOffset: number, endOffset: number): Trip {
  return {
    region: VisaRegion.Schengen,
    entryDate: formatDate(addDays(anchor, startOffset)),
    exitDate: formatDate(addDays(anchor, endOffset)),
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("calculateMaxStay", () => {
  // ── Constants ────────────────────────────────────────────────────────────────

  it("exports the correct rule constants", () => {
    expect(SCHENGEN_MAX_DAYS).toBe(90);
    expect(SCHENGEN_WINDOW_SIZE).toBe(180);
  });

  // ── No history ───────────────────────────────────────────────────────────────

  it("allows a full 90-day stay when there is no prior history", () => {
    // Window on entry (day 0): [day -179, day -1]. Historical = 0.
    // At each candidate D: proposed = D+1, historical = 0.
    // First invalid: D=90 → proposed=91 > 90. So maxExit = day 89. maxDays = 90.
    const anchor = parseDate("2024-01-01");
    const result = calculateMaxStay("2024-01-01", []);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
    expect(result.maxExitDate).toBe(formatDate(addDays(anchor, 89)));
  });

  // ── Cannot enter ─────────────────────────────────────────────────────────────

  it("returns canEnter=false when exactly 90 days have been used", () => {
    // History: day -90 to day -1 (90 days). Window [day -179, day -1] → 90 days.
    // previousStay = 90 ≥ 90 → cannot enter.
    const anchor = parseDate("2024-04-01");
    const result = calculateMaxStay("2024-04-01", [makeTrip(anchor, -90, -1)]);

    expect(result.canEnter).toBe(false);
    expect(result.maxExitDate).toBeNull();
    expect(result.maxDays).toBe(0);
  });

  it("returns canEnter=false when 90 days are spread across multiple trips", () => {
    // Trip A: day -90 to day -46 (45 days) + Trip B: day -45 to day -1 (45 days) = 90.
    const anchor = parseDate("2024-04-01");
    const history = [makeTrip(anchor, -90, -46), makeTrip(anchor, -45, -1)];
    const result = calculateMaxStay("2024-04-01", history);

    expect(result.canEnter).toBe(false);
  });

  // ── Simple remainder — history stays in window throughout ────────────────────

  it("allows exactly 30 days when 60 recent days will not roll off", () => {
    // History: day -60 to day -1 (60 days).
    // For all candidate D ≤ 89: window start = D-179 ≤ -90 < -60 → trip fully inside.
    // At each D: historical = 60, proposed = D+1, total = D+61.
    // First invalid: D+61 = 91 → D = 30. So maxExit = day 29. maxDays = 30.
    const anchor = parseDate("2024-04-01");
    const result = calculateMaxStay("2024-04-01", [makeTrip(anchor, -60, -1)]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(30);
    expect(result.maxExitDate).toBe(formatDate(addDays(anchor, 29)));
  });

  it("allows exactly 1 day when 89 days have been used", () => {
    // History: day -89 to day -1 (89 days). previousStay = 89.
    // At D=0 (candidate day 1 of trip): historical in [-179,0] = 89. proposed=1. total=90. ✓
    // At D=1: window=[-178,1]. Trip [-89,-1] still fully inside. historical=89. proposed=2. total=91. ✗
    // maxExit = day 0 = entry. maxDays = 1.
    const anchor = parseDate("2024-04-01");
    const result = calculateMaxStay("2024-04-01", [makeTrip(anchor, -89, -1)]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(1);
    expect(result.maxExitDate).toBe("2024-04-01");
  });

  // ── Extension: history rolls off during the trip ──────────────────────────────

  it("extends to 90 days when old history falls completely off the window", () => {
    // History: day -175 to day -116 (60 days).
    // Initial window [day -179, day -1]: trip fully inside → previousStay = 60.
    // Naive answer: 30 days. But the trip ends at day -116.
    //
    // Trip falls out when: D - 179 > -116 → D > 63.
    // At D=64: window=[-115,64]. Trip [-175,-116]: max(-175,-115)=-115 > -116=min(-116,64)?
    //   No: overlap = [max(-175,-115), min(-116,64)] = [-115, -116].
    //   -115 > -116, so overlap is empty → 0 days. proposed=65. total=65. ✓
    // From D=64: historical=0, total = D+1. Stops at D=89 (total=90).
    // D=90 would give 91. maxDays = 90.
    const anchor = parseDate("2024-04-01");
    const result = calculateMaxStay("2024-04-01", [
      makeTrip(anchor, -175, -116),
    ]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
  });

  it("partially extends when one old trip falls off but another stays in window", () => {
    // Trip A: day -170 to day -151 (20 days) — falls off around D=28
    // Trip B: day -60 to day -1 (60 days)   — stays in window for all D ≤ 89
    // previousStay = 20 + 60 = 80. Remaining = 10. Naive answer: 10 days.
    //
    // Trip A ends at -151. Falls out when D-179 > -151 → D > 28.
    // At D=28: window=[-151,28]. Trip A overlap=[-151,-151]=1 day. Trip B=60. proposed=29. total=90. ✓
    // At D=29: window=[-150,29]. Trip A=0. Trip B=60. proposed=30. total=90. ✓
    // At D=30: Trip B=60. proposed=31. total=91. ✗
    // maxDays = 30.
    const anchor = parseDate("2024-04-01");
    const history = [makeTrip(anchor, -170, -151), makeTrip(anchor, -60, -1)];
    const result = calculateMaxStay("2024-04-01", history);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(30);
    expect(result.maxExitDate).toBe(formatDate(addDays(anchor, 29)));
  });

  // ── Straddling the initial window boundary ────────────────────────────────────

  it("counts only the in-window portion of a trip that straddles the window start", () => {
    // History: day -200 to day -150 (51 days).
    // Initial window [day -179, day -1]: overlap = [day -179, day -150] = 30 days.
    // previousStay = 30.
    //
    // Trip ends at -150. Falls out when D > 29.
    // From D=30: historical=0, total=D+1. Stops at D=89. maxDays = 90.
    const anchor = parseDate("2024-04-01");
    const result = calculateMaxStay("2024-04-01", [
      makeTrip(anchor, -200, -150),
    ]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
  });

  it("returns canEnter=false when a straddling trip plus another hit 90 days", () => {
    // History: day -200 to day -110 → overlap with initial window = [day-179, day-110] = 70 days.
    //          day -60 to day -41 = 20 days.
    // previousStay = 70 + 20 = 90. canEnter = false.
    const anchor = parseDate("2024-04-01");
    const history = [makeTrip(anchor, -200, -110), makeTrip(anchor, -60, -41)];
    const result = calculateMaxStay("2024-04-01", history);

    expect(result.canEnter).toBe(false);
  });

  // ── History entirely outside window ──────────────────────────────────────────

  it("ignores trips that ended before the window started", () => {
    // History: day -200 to day -180 (21 days, before window start day -179).
    // Overlap with [day -179, day -1] = 0 days. previousStay = 0. Full 90 days.
    const anchor = parseDate("2024-04-01");
    const result = calculateMaxStay("2024-04-01", [
      makeTrip(anchor, -200, -180),
    ]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
  });

  // ── Real-world scenarios ─────────────────────────────────────────────────────

  it("scenario: first trip to Europe, no history", () => {
    // Sep 1 + 89 days = Nov 29 (Sep:30 days left=29, Oct:31, Nov:29 → 29+31+29=89 more → Nov 29)
    const result = calculateMaxStay("2024-09-01", []);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
    expect(result.maxExitDate).toBe("2024-11-29");
  });

  it("scenario: digital nomad — 60 days used 100+ days ago, gets full 90 days", () => {
    // History: day -160 to day -101 (60 days). previousStay = 60. Naive: 30 days.
    // Trip ends at -101. Falls out when D > 78.
    // From D=79: historical=0. Continues to D=89. maxDays=90.
    const anchor = parseDate("2024-06-01");
    const result = calculateMaxStay("2024-06-01", [
      makeTrip(anchor, -160, -101),
    ]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
  });

  it("scenario: re-entry after a previous stay that is now rolling off", () => {
    // History: day -180 to day -91 (90 days).
    // Initial window [day -179, day -1]: overlap = [day -179, day -91] = 89 days.
    // previousStay = 89. Can enter.
    //
    // At each candidate D, the old trip loses one day from the window for every
    // new day the proposed trip gains — total stays at 90 — until the old trip
    // is fully gone at D=88 (window start = -91, last old day = -91).
    // At D=89: window=[-90,89]. Old trip: max(-180,-90)=-90 > min(-91,89)=-91 → 0 days.
    //   proposed=90. total=90. Valid.
    // At D=90: proposed=91. Stop. maxDays = 90.
    const anchor = parseDate("2024-07-01");
    const result = calculateMaxStay("2024-07-01", [
      makeTrip(anchor, -180, -91),
    ]);

    expect(result.canEnter).toBe(true);
    expect(result.maxDays).toBe(90);
  });
});
