import { describe, it, expect } from "vitest";
import { computeImpactBreakdown, getStatusVariant } from "./travelerStatus";
import { VisaRegion, type Trip } from "@/types";

function trip(id: string, entry: string, exit: string): Trip {
  return { id, entryDate: entry, exitDate: exit, region: VisaRegion.Schengen };
}

describe("getStatusVariant (rolling-window, days-from-overstay)", () => {
  it("is safe above two weeks of headroom", () => {
    expect(getStatusVariant(15)).toBe("safe");
    expect(getStatusVariant(90)).toBe("safe");
  });

  it("is caution from 4 to 14 days", () => {
    expect(getStatusVariant(14)).toBe("caution");
    expect(getStatusVariant(4)).toBe("caution");
  });

  it("is danger under 4 days, including overstay", () => {
    expect(getStatusVariant(3)).toBe("danger");
    expect(getStatusVariant(0)).toBe("danger");
    expect(getStatusVariant(-10)).toBe("danger");
  });
});

describe("computeImpactBreakdown", () => {
  it("remainingAfterTrip matches maxDays − previous + freed − thisTrip", () => {
    // 30-day trip, no history → 90 − 0 + 0 − 30 = 60.
    const b = computeImpactBreakdown("2025-06-01", "2025-06-30", []);
    expect(b.currentTripDays).toBe(30);
    expect(b.remainingAfterTrip).toBe(60);
    expect(b.daysRemainingRaw).toBe(60);
    expect(b.daysRemaining).toBe(60);
  });

  it("reports negative headroom on an overstay", () => {
    // 100-day trip, no history → exceeds the 90-day allowance by 10.
    const b = computeImpactBreakdown("2025-01-01", "2025-04-10", []);
    expect(b.currentTripDays).toBe(100);
    expect(b.daysRemainingRaw).toBe(-10);
    expect(b.remainingAfterTrip).toBe(-10);
    // daysRemaining stays clamped for display.
    expect(b.daysRemaining).toBe(0);
  });

  it("dates the roll-out of a previous trip freed during this trip", () => {
    // Previous trip 1–5 Jan 2025; each day leaves the 180-day window on
    // day + 180, so the last day (5 Jan) ages out on 4 Jul 2025.
    const history = [trip("p", "2025-01-01", "2025-01-05")];
    const b = computeImpactBreakdown("2025-06-25", "2025-07-31", history);

    const during = b.agingOutDuringTripTrips.find((c) => c.tripId === "p");
    expect(during).toBeDefined();
    expect(during!.daysAgingOutDuringTrip).toBe(5);
    expect(during!.agesOutDuringDate).toBe("2025-07-04");
  });
});
