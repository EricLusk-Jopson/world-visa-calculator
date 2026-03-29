/**
 * Tests for computeAgingMarkers.
 *
 * All dates are fixed offsets from a stable anchor (2025-01-01) so tests are
 * deterministic and never depend on today's date.
 */

import { describe, it, expect } from "vitest";
import { computeAgingMarkers } from "./agingMarkers";
import { VisaRegion } from "../../../types";
import type { Traveler } from "../../../types";
import { parseDate, addDays, formatDate } from "./dates";
import { PX_PER_DAY } from "./timelineLayout";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TS = parseDate("2025-01-01"); // fixed timelineStart
const TE = parseDate("2025-12-31"); // fixed timelineEnd (~364 days after TS)

let _id = 0;
const uid = () => `${_id++}`;

function makeTraveler(trips: Traveler["trips"]): Traveler {
  return { id: uid(), name: "Test", trips };
}

/** Build a Schengen trip using day-offsets relative to TS. */
function schengenTrip(
  entryOffset: number,
  exitOffset: number,
  destination?: string,
): Traveler["trips"][number] {
  return {
    id: uid(),
    region: VisaRegion.Schengen,
    entryDate: formatDate(addDays(TS, entryOffset)),
    exitDate: formatDate(addDays(TS, exitOffset)),
    destination,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("computeAgingMarkers", () => {
  // ── Filtering — no markers produced ───────────────────────────────────────

  it("returns empty array for a traveler with no trips", () => {
    expect(computeAgingMarkers(makeTraveler([]), TS, TE)).toEqual([]);
  });

  it("ignores non-Schengen trips", () => {
    const traveler = makeTraveler([
      {
        id: uid(),
        region: VisaRegion.Elsewhere,
        entryDate: formatDate(addDays(TS, -200)),
        exitDate: formatDate(addDays(TS, -150)),
      },
    ]);
    expect(computeAgingMarkers(traveler, TS, TE)).toEqual([]);
  });

  it("ignores Schengen trips without an exit date (ongoing trips)", () => {
    const traveler = makeTraveler([
      {
        id: uid(),
        region: VisaRegion.Schengen,
        entryDate: formatDate(addDays(TS, -10)),
        // no exitDate
      },
    ]);
    expect(computeAgingMarkers(traveler, TS, TE)).toEqual([]);
  });

  it("excludes trips whose aging-start (entryDate + 180) falls before timelineStart", () => {
    // entryOffset = -200 → agingStart = -200 + 180 = -20 days (before TS)
    expect(
      computeAgingMarkers(makeTraveler([schengenTrip(-200, -150)]), TS, TE),
    ).toEqual([]);
  });

  it("excludes trips whose aging-start falls after timelineEnd", () => {
    // entryOffset = +200, TE ≈ +364 days; agingStart = +380 > TE
    expect(
      computeAgingMarkers(makeTraveler([schengenTrip(200, 220)]), TS, TE),
    ).toEqual([]);
  });

  // ── Boundary inclusion ────────────────────────────────────────────────────

  it("includes a marker when aging-start equals timelineStart", () => {
    // entryOffset = -180 → agingStart = TS exactly
    const markers = computeAgingMarkers(
      makeTraveler([schengenTrip(-180, -100)]),
      TS,
      TE,
    );
    expect(markers).toHaveLength(1);
    expect(markers[0].top).toBe(0); // agingStart == TS → 0 px offset
  });

  it("includes a marker when aging-start equals timelineEnd", () => {
    // TE = TS + 364 days → entryOffset = 364 - 180 = +184
    const markers = computeAgingMarkers(
      makeTraveler([schengenTrip(184, 200)]),
      TS,
      TE,
    );
    expect(markers).toHaveLength(1);
    expect(markers[0].top).toBe(364 * PX_PER_DAY);
  });

  // ── Historical trips (new behaviour) ─────────────────────────────────────

  it("emits a marker for a past trip whose aging-start falls within the timeline", () => {
    // Trip: entry = TS-150, exit = TS-101 (50 days).
    // agingStart = TS-150+180 = TS+30 — in the past relative to any real today,
    // but within [TS, TE].
    const markers = computeAgingMarkers(
      makeTraveler([schengenTrip(-150, -101, "Berlin")]),
      TS,
      TE,
    );
    expect(markers).toHaveLength(1);
    expect(markers[0].top).toBe(30 * PX_PER_DAY);
    expect(markers[0].tripDays).toBe(50); // 50-day trip
    expect(markers[0].destination).toBe("Berlin");
    expect(markers[0].entryDate).toBe(formatDate(addDays(TS, -150)));
    expect(markers[0].exitDate).toBe(formatDate(addDays(TS, -101)));
  });

  // ── Future trips ─────────────────────────────────────────────────────────

  it("emits a marker for a future trip whose aging-start falls within the timeline", () => {
    // Trip: entry = TS+10, exit = TS+40 (31 days).
    // agingStart = TS+10+180 = TS+190.
    const markers = computeAgingMarkers(
      makeTraveler([schengenTrip(10, 40, "Rome")]),
      TS,
      TE,
    );
    expect(markers).toHaveLength(1);
    expect(markers[0].top).toBe(190 * PX_PER_DAY);
    expect(markers[0].tripDays).toBe(31);
    expect(markers[0].destination).toBe("Rome");
  });

  // ── Multiple trips ────────────────────────────────────────────────────────

  it("returns one marker per qualifying trip", () => {
    const traveler = makeTraveler([
      schengenTrip(-150, -101), // agingStart = TS+30  ✓
      schengenTrip(10, 40), //    agingStart = TS+190 ✓
      schengenTrip(-200, -150), // agingStart = TS-20  ✗ (before TS)
    ]);
    expect(computeAgingMarkers(traveler, TS, TE)).toHaveLength(2);
  });

  // ── Default destination ───────────────────────────────────────────────────

  it("uses 'Trip' as the destination label when trip.destination is absent", () => {
    const traveler = makeTraveler([
      {
        id: uid(),
        region: VisaRegion.Schengen,
        entryDate: formatDate(addDays(TS, -150)),
        exitDate: formatDate(addDays(TS, -101)),
        // no destination field
      },
    ]);
    const markers = computeAgingMarkers(traveler, TS, TE);
    expect(markers[0].destination).toBe("Trip");
  });
});
