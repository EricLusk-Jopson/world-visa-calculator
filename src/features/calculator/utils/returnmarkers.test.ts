/**
 * Tests for computeReturnMarkers.
 *
 * All dates are fixed offsets from a stable anchor (2025-01-01) so tests are
 * deterministic and never depend on today's date.
 *
 * Expected values are derived from first principles below each test, following
 * the same convention as schengen.test.ts.
 */

import { describe, it, expect } from "vitest";
import { computeReturnMarkers } from "./returnmarkers";
import { VisaRegion } from "../../../types";
import type { Traveler } from "../../../types";
import { parseDate, addDays, formatDate } from "./dates";
import { PX_PER_DAY } from "./timelineLayout";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TS = parseDate("2025-01-01"); // fixed timelineStart
const TE = parseDate("2025-12-31"); // fixed timelineEnd (364 days after TS)

let _id = 0;
const uid = () => `${_id++}`;

function makeTraveler(trips: Traveler["trips"]): Traveler {
  return { id: uid(), name: "Test", trips };
}

/** Build a Schengen trip using day-offsets relative to TS. */
function schengenTrip(
  entryOffset: number,
  exitOffset: number | null,
): Traveler["trips"][number] {
  return {
    id: uid(),
    region: VisaRegion.Schengen,
    entryDate: formatDate(addDays(TS, entryOffset)),
    exitDate:
      exitOffset !== null ? formatDate(addDays(TS, exitOffset)) : undefined,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeReturnMarkers", () => {
  // ── Phase building ────────────────────────────────────────────────────────

  it("emits a single isCurrent snapshot with days=90 when there are no Schengen trips", () => {
    // No history → calculateMaxStay returns canEnter=true, maxDays=90.
    // Phase 0: TS → TE. One snapshot, no thresholds above 90.
    const markers = computeReturnMarkers(makeTraveler([]), TS, TE);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({ isCurrent: true, days: 90, top: 0 });
  });

  it("returns no markers when the traveler is currently inside Schengen (no exitDate)", () => {
    // insideSchengenAtStart = true → Phase 0 skipped; no other phases.
    const markers = computeReturnMarkers(
      makeTraveler([schengenTrip(-10, null)]),
      TS,
      TE,
    );
    expect(markers).toHaveLength(0);
  });

  it("ignores non-Schengen trips (treats timeline as trip-free)", () => {
    // Elsewhere trip should not create phases or historical data.
    const traveler = makeTraveler([
      {
        id: uid(),
        region: VisaRegion.Elsewhere,
        entryDate: formatDate(addDays(TS, -100)),
        exitDate: formatDate(addDays(TS, -50)),
      },
    ]);
    const markers = computeReturnMarkers(traveler, TS, TE);
    // Equivalent to no-trips case: single isCurrent at TS with days=90.
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({ isCurrent: true, days: 90 });
  });

  it("skips Phase 0 when a trip straddles timelineStart, emitting the first marker after exit", () => {
    // Trip: entry = TS-20, exit = TS+30.
    // Phase 0 end = day before entry = TS-21, which is < TS → guard skips Phase 0.
    // Phase 1 starts at TS+31 (tripExit + 1 day).
    const markers = computeReturnMarkers(
      makeTraveler([schengenTrip(-20, 30)]),
      TS,
      TE,
    );
    // No marker at TS.
    const atTS = markers.find((m) => m.date.getTime() === TS.getTime());
    expect(atTS).toBeUndefined();
    // First marker is the Phase 1 snapshot at TS+31.
    expect(markers[0]).toMatchObject({
      isCurrent: true,
      date: addDays(TS, 31),
    });
  });

  it("emits isCurrent markers at the start of each phase for a past trip entirely within the timeline", () => {
    // Trip: entry = TS+10, exit = TS+39 (30 days).
    // Phase 0: TS → TS+9,  historical = []
    //   → calculateMaxStay(TS, []) → maxDays = 90.
    // Phase 1: TS+40 → TE, historical = [trip]
    //   → window [TS-139, TS+39]; trip fully inside → 30 historical days.
    //   → day i: total = (i+1)+30; first invalid at i=60 (61+30=91). maxDays = 60.
    const markers = computeReturnMarkers(
      makeTraveler([schengenTrip(10, 39)]),
      TS,
      TE,
    );
    const currentMarkers = markers.filter((m) => m.isCurrent);
    expect(currentMarkers).toHaveLength(2);
    expect(currentMarkers[0]).toMatchObject({
      date: TS,
      days: 90,
      top: 0,
    });
    expect(currentMarkers[1]).toMatchObject({
      date: addDays(TS, 40),
      days: 60,
      top: 40 * PX_PER_DAY,
    });
  });

  // ── Threshold markers ─────────────────────────────────────────────────────

  it("emits threshold markers when maxStay crosses 15-day milestones", () => {
    // Trip: 60-day stay [TS-60, TS-1], ending 1 day before TS.
    // On TS: window [TS-179, TS-1]; trip fully inside → 60 historical days.
    //   calculateMaxStay(TS, trip): day i total = (i+1)+60; first invalid i=30.
    //   maxAtStart = 30. pending = [45, 60, 75, 90].
    //
    // Trip entry TS-60 exits the window when D-179 > TS-60 → D > TS+119.
    // For entry dates TS through TS+89 the trip stays fully in window during
    // any ≤30-day proposed stay (trip entry TS-60 needs i ≥ 120-k to age out;
    // for k < 90 the invalid day i=30 arrives first → maxDays = 30).
    //
    // At entry TS+90 (k=90):
    //   Day i=30: k+i=120 > 119 → trip partial. historical = 179-90-30 = 59.
    //   total = 31+59 = 90. ≤ 90. ✓
    //   The aging offset keeps total constant at 90 through i=89; then at i=90:
    //   total = 91. maxDays = 90.
    //   All four remaining thresholds (45, 60, 75, 90) are crossed at once.
    const markers = computeReturnMarkers(
      makeTraveler([schengenTrip(-60, -1)]),
      TS,
      TE,
    );
    const thresholdMarkers = markers.filter((m) => !m.isCurrent);
    expect(thresholdMarkers).toHaveLength(4);
    // All cross on the same day (TS+90).
    for (const m of thresholdMarkers) {
      expect(m.date).toEqual(addDays(TS, 90));
      expect(m.top).toBe(90 * PX_PER_DAY);
    }
    expect(thresholdMarkers.map((m) => m.days)).toEqual([45, 60, 75, 90]);
  });

  it("omits threshold markers when timeline ends before any threshold is reached", () => {
    // Same 60-day trip — first threshold (45) crosses at TS+90.
    // Clip timeline to TS+89 so no threshold is ever reached.
    const te = addDays(TS, 89);
    const markers = computeReturnMarkers(
      makeTraveler([schengenTrip(-60, -1)]),
      TS,
      te,
    );
    expect(markers.filter((m) => !m.isCurrent)).toHaveLength(0);
  });

  // ── top (pixel offset) ────────────────────────────────────────────────────

  it("sets top correctly relative to timelineStart", () => {
    // Phase 1 starts at TS+40; its top should be 40 * PX_PER_DAY.
    const markers = computeReturnMarkers(
      makeTraveler([schengenTrip(10, 39)]),
      TS,
      TE,
    );
    const phase1 = markers.find(
      (m) => m.isCurrent && m.date.getTime() === addDays(TS, 40).getTime(),
    );
    expect(phase1?.top).toBe(40 * PX_PER_DAY);
  });
});
