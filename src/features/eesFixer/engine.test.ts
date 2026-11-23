/**
 * The spec's engine cases ("EES Record Fixer: Feature Spec", Test cases),
 * plus probe rescoring and a few edges. Dates are inclusive; `today` is fixed
 * per case so the phantom days of an unrecorded exit are reproducible.
 */
import { describe, expect, it } from "vitest";
import {
  diagnose,
  findProbe,
  predictChecker,
  remainingOnArrival,
  resolveTrips,
  type FixerTrip,
} from "./engine";

const trip = (
  id: string,
  entry: string,
  exit: string | null,
  country = "ES",
): FixerTrip => ({ id, entry, exit, entryCountry: country, exitCountry: country });

describe("diagnose: spec cases", () => {
  it("worked example: Spain 1-10 Jul 2026, 0 days on 2 Nov → missing exit, Spain", () => {
    const d = diagnose({
      trips: [trip("jul", "2026-07-01", "2026-07-10", "ES")],
      observations: [{ date: "2026-11-02", remaining: 0 }],
      today: "2026-10-20",
    });
    expect(d.mine).toBe(80);
    expect(d.verdict).toBe("MISSING_EXIT");
    expect(d.flagged?.trip.id).toBe("jul");
    expect(d.flagged?.match).toBe("CONSISTENT");
    expect(d.authorityCountry).toBe("ES");
    expect(d.letter).toBe("correction");
  });

  it("two trips, older exit missing: both are candidates, and a probe date separates them", () => {
    const trips = [
      trip("jun", "2026-06-01", "2026-06-10", "ES"),
      trip("aug", "2026-08-01", "2026-08-10", "IT"),
    ];
    const today = "2026-10-20";
    const arrival = { date: "2026-11-02", remaining: 0 };
    const d = diagnose({ trips, observations: [arrival], today });

    expect(d.verdict).toBe("AMBIGUOUS");
    expect(new Set(d.candidates.map((c) => c.trip.id))).toEqual(new Set(["jun", "aug"]));
    expect(d.letter).toBe("access");
    expect(d.probe).not.toBeNull();

    // Whichever trip is really wrong, the probe result singles it out.
    for (const truth of d.candidates) {
      const seen = predictChecker(truth.record, d.probe!);
      const again = diagnose({
        trips,
        observations: [arrival, { date: d.probe!, remaining: seen }],
        today,
      });
      expect(["MISSING_EXIT", "LATE_EXIT"]).toContain(again.verdict);
      expect(again.flagged?.trip.id).toBe(truth.trip.id);
      expect(again.authorityCountry).toBe(truth.trip.exitCountry);
    }
  });

  it("a trip spanning the EES start is a candidate with prior HIGH", () => {
    const d = diagnose({
      trips: [trip("fr", "2025-09-20", "2025-11-20", "FR")],
      observations: [{ date: "2026-03-01", remaining: 0 }],
      today: "2026-02-01",
    });
    expect(d.mine).toBe(28);
    expect(d.verdict).toBe("MISSING_EXIT");
    expect(d.flagged?.trip.id).toBe("fr");
    expect(d.flagged?.prior).toBe("HIGH");
    expect(d.authorityCountry).toBe("FR");
  });

  it("entirely pre-EES trip, checker shows more than mine → no discrepancy, with the pre-EES warning", () => {
    const d = diagnose({
      trips: [trip("de", "2025-08-01", "2025-08-30", "DE")],
      observations: [{ date: "2025-12-01", remaining: 90 }],
      today: "2025-11-15",
    });
    expect(d.mine).toBe(60);
    expect(d.verdict).toBe("NO_DISCREPANCY");
    expect(d.preEesWarning).toBe(true);
    expect(d.letter).toBeNull();
  });

  it("late exit: observed 30 below mine → LATE_EXIT with k = 30", () => {
    const d = diagnose({
      trips: [trip("jul", "2026-07-01", "2026-07-10", "PT")],
      observations: [{ date: "2026-11-02", remaining: 50 }],
      today: "2026-10-20",
    });
    expect(d.mine).toBe(80);
    expect(d.verdict).toBe("LATE_EXIT");
    expect(d.flagged?.lateDays).toBe(30);
    expect(d.flagged?.recordedExit).toBe("2026-08-09");
    expect(d.flagged?.match).toBe("EXACT");
    expect(d.authorityCountry).toBe("PT");
  });

  it("rule problem: 95 days in the window → RULE_PROBLEM, no letter", () => {
    const d = diagnose({
      trips: [trip("long", "2026-06-01", "2026-09-03")],
      observations: [{ date: "2026-10-01", remaining: 0 }],
      today: "2026-09-20",
    });
    expect(d.mine).toBe(0);
    expect(d.verdict).toBe("RULE_PROBLEM");
    expect(d.letter).toBeNull();
  });

  it("no discrepancy: observed equals mine", () => {
    const d = diagnose({
      trips: [trip("jul", "2026-07-01", "2026-07-10")],
      observations: [{ date: "2026-11-02", remaining: 80 }],
      today: "2026-10-20",
    });
    expect(d.verdict).toBe("NO_DISCREPANCY");
    expect(d.preEesWarning).toBe(false);
    expect(d.letter).toBeNull();
  });

  it("unexplained: no candidate matches a result below mine → access letter", () => {
    const d = diagnose({
      trips: [trip("oct", "2026-10-25", "2026-10-31")],
      observations: [{ date: "2026-11-02", remaining: 50 }],
      today: "2026-11-01",
    });
    expect(d.mine).toBe(83);
    expect(d.verdict).toBe("UNEXPLAINED");
    expect(d.candidates).toEqual([]);
    expect(d.letter).toBe("access");
  });

  it("open trip: counted as present to today, never a candidate", () => {
    const d = diagnose({
      trips: [trip("now", "2026-09-01", null)],
      observations: [{ date: "2026-10-15", remaining: 10 }],
      today: "2026-10-01",
    });
    expect(d.mine).toBe(59); // 1 Sep to 1 Oct
    expect(d.candidates).toEqual([]);
    expect(d.verdict).toBe("UNEXPLAINED");
  });
});

describe("diagnose: edges", () => {
  it("leaves out trips that start after today: plans aren't in the EES", () => {
    const d = diagnose({
      trips: [
        trip("jul", "2026-07-01", "2026-07-10"),
        trip("plan", "2026-10-25", "2026-10-30"),
      ],
      observations: [{ date: "2026-11-02", remaining: 80 }],
      today: "2026-10-20",
    });
    expect(d.excludedFutureTrips).toBe(1);
    expect(d.mine).toBe(80);
    expect(d.verdict).toBe("NO_DISCREPANCY");
  });

  it("never flags a trip that ended before the EES started", () => {
    const d = diagnose({
      trips: [trip("old", "2025-09-01", "2025-09-20"), trip("new", "2026-07-01", "2026-07-10")],
      observations: [{ date: "2026-11-02", remaining: 0 }],
      today: "2026-10-20",
    });
    expect(d.candidates.every((c) => c.trip.id === "new")).toBe(true);
  });

  it("flags the one trip that can explain a non-zero result", () => {
    // The October trip ends two days before today: no error on it can cost
    // 30 days. A June exit recorded 26 days late can.
    const d = diagnose({
      trips: [trip("jun", "2026-06-01", "2026-06-10", "ES"), trip("oct", "2026-10-15", "2026-10-18", "IT")],
      observations: [{ date: "2026-11-02", remaining: 50 }],
      today: "2026-10-20",
    });
    expect(d.mine).toBe(76);
    expect(d.verdict).toBe("LATE_EXIT");
    expect(d.flagged?.trip.id).toBe("jun");
    expect(d.flagged?.lateDays).toBe(26);
  });

  it("does not count a late exit dated today as different from a missing one", () => {
    const d = diagnose({
      trips: [trip("jul", "2026-07-01", "2026-07-10")],
      observations: [{ date: "2026-11-02", remaining: 0 }],
      today: "2026-10-20",
    });
    expect(d.candidates.map((c) => c.kind)).toEqual(["MISSING_EXIT_OPEN"]);
  });

  it("stops asking for probes after two", () => {
    const trips = [trip("jun", "2026-06-01", "2026-06-10"), trip("aug", "2026-08-01", "2026-08-10")];
    const d = diagnose({
      trips,
      observations: [
        { date: "2026-11-02", remaining: 0 },
        { date: "2026-10-20", remaining: 0 },
        { date: "2026-10-21", remaining: 0 },
      ],
      today: "2026-10-20",
    });
    expect(d.verdict).toBe("AMBIGUOUS");
    expect(d.probe).toBeNull();
  });
});

describe("helpers", () => {
  it("remainingOnArrival leaves the arrival day out", () => {
    // 1 Jul to 10 Jul, arriving 11 Jul: all ten days count.
    expect(remainingOnArrival([{ entry: "2026-07-01", exit: "2026-07-10" }], "2026-07-11")).toBe(80);
    // Arriving 10 Jul: the 10th itself isn't in the window yet.
    expect(remainingOnArrival([{ entry: "2026-07-01", exit: "2026-07-10" }], "2026-07-10")).toBe(81);
  });

  it("predictChecker ignores days before 12 Oct 2025", () => {
    const { record } = resolveTrips([trip("x", "2025-10-01", "2025-10-20")], "2026-01-01");
    // Only 12 to 20 Oct is visible: 9 days.
    expect(predictChecker(record, "2025-12-01")).toBe(81);
  });

  it("findProbe returns null when every candidate is the same trip", () => {
    const d = diagnose({
      trips: [trip("jul", "2026-07-01", "2026-07-10")],
      observations: [{ date: "2026-11-02", remaining: 0 }],
      today: "2026-10-20",
    });
    expect(findProbe(d.candidates, "2026-10-20")).toBeNull();
  });
});
