import { describe, expect, it } from "vitest";
import { decodeState } from "@/features/sharing/utils/urlEncoding";
import { parseDate } from "@/features/calculator/utils/dates";
import { assignLanes, assignTravelerLanes } from "./mobileTripLayout";

const day = (n: number) => n * 3;

describe("assignTravelerLanes", () => {
  it("gives a lone card the full width", () => {
    expect(
      assignTravelerLanes([{ top: 0, height: 90, travelerIndices: [1] }]),
    ).toEqual([{ lane: 0, laneSpan: 1, laneCount: 1 }]);
  });

  it("keeps back-to-back trips of one traveler in their lane", () => {
    const placements = assignTravelerLanes([
      { top: day(0), height: day(100), travelerIndices: [0] },
      { top: day(0), height: day(45), travelerIndices: [1] },
      { top: day(45), height: day(45), travelerIndices: [1] },
      { top: day(90), height: day(45), travelerIndices: [1] },
    ]);
    expect(placements.map((p) => p.lane)).toEqual([0, 1, 1, 1]);
    expect(placements.every((p) => p.laneCount === 2)).toBe(true);
  });

  it("orders lanes by traveler, not by which trip starts first", () => {
    const placements = assignTravelerLanes([
      { top: day(10), height: day(30), travelerIndices: [0] },
      { top: day(0), height: day(30), travelerIndices: [1] },
    ]);
    expect(placements.map((p) => p.lane)).toEqual([0, 1]);
  });

  it("puts a traveler's own overlapping trips next to their home lane", () => {
    const placements = assignTravelerLanes([
      { top: day(0), height: day(60), travelerIndices: [0] },
      { top: day(10), height: day(20), travelerIndices: [0] },
      { top: day(0), height: day(60), travelerIndices: [1] },
    ]);
    expect(placements.map((p) => p.lane)).toEqual([0, 1, 2]);
    expect(placements.every((p) => p.laneCount === 3)).toBe(true);
  });

  it("spans a shared trip across its travelers' lanes", () => {
    const placements = assignTravelerLanes([
      { top: day(0), height: day(30), travelerIndices: [0, 1] },
      { top: day(0), height: day(60), travelerIndices: [2] },
    ]);
    expect(placements[0]).toEqual({ lane: 0, laneSpan: 2, laneCount: 3 });
    expect(placements[1]).toEqual({ lane: 2, laneSpan: 1, laneCount: 3 });
  });

  it("moves a traveler's trip beside a shared trip that overlaps it", () => {
    const placements = assignTravelerLanes([
      { top: day(0), height: day(30), travelerIndices: [0, 1] },
      { top: day(20), height: day(30), travelerIndices: [1] },
    ]);
    expect(placements[0]).toEqual({ lane: 0, laneSpan: 2, laneCount: 3 });
    expect(placements[1]).toEqual({ lane: 2, laneSpan: 1, laneCount: 3 });
  });

  it("falls back to a single lane when a shared trip's span is busy", () => {
    const placements = assignTravelerLanes([
      { top: day(0), height: day(60), travelerIndices: [1] },
      { top: day(10), height: day(20), travelerIndices: [0, 2] },
      { top: day(0), height: day(60), travelerIndices: [2] },
    ]);
    expect(placements.map((p) => [p.lane, p.laneSpan])).toEqual([
      [1, 1],
      [0, 1],
      [2, 1],
    ]);
  });

  it("compacts lanes per overlap group", () => {
    const placements = assignTravelerLanes([
      { top: day(0), height: day(30), travelerIndices: [0] },
      { top: day(10), height: day(30), travelerIndices: [2] },
      { top: day(100), height: day(30), travelerIndices: [2] },
    ]);
    expect(placements).toEqual([
      { lane: 0, laneSpan: 1, laneCount: 2 },
      { lane: 1, laneSpan: 1, laneCount: 2 },
      { lane: 0, laneSpan: 1, laneCount: 1 },
    ]);
  });
});

describe("assignLanes", () => {
  // Two travelers: one on 90-day trips, one on 45-day trips, alternating
  // Schengen and Türkiye back to back. The 45-day trips used to drift
  // between lanes and push the 90-day trips out of line.
  const url =
    "https://eurovisacalculator.com/app?v=2&n=DayShuffler%2CDayShuffler&t=7je7lv%3A0%3A1%3A90%2520Days%2520In%2520Schengen%2C7je7km%3A0%3A2%3A45%2520Days%2520In%2520Schengen%2C7km7lu%3A4%3A2%3A45%2520Days%2520In%2520Turkiye%2C7lu7n2%3A0%3A2%3A45%2520Days%2520In%2520Schengen%2C7lv7oc%3A4%3A1%3A90%2520Days%2520In%2520Turkiye%2C7n27oa%3A4%3A2%3A45%2520Days%2520In%2520Turkiye&p=US%2CUS&nosave";

  it("keeps each traveler's trips in one lane", () => {
    const decoded = decodeState(url);
    if (!decoded.ok) throw new Error(decoded.reason);
    const { travelers } = decoded.state;

    const positioned = assignLanes(
      travelers,
      [],
      parseDate("2026-09-01"),
      "2026-10-22",
    );

    expect(positioned).toHaveLength(6);
    for (const p of positioned) {
      expect(p.entries).toHaveLength(1);
      expect(p.lane).toBe(p.entries[0].travelerIndex);
      expect(p.laneSpan).toBe(1);
      expect(p.laneCount).toBe(2);
    }
  });

  it("drops hidden travelers' lanes", () => {
    const decoded = decodeState(url);
    if (!decoded.ok) throw new Error(decoded.reason);
    const { travelers } = decoded.state;

    const positioned = assignLanes(
      travelers,
      [travelers[0].id],
      parseDate("2026-09-01"),
      "2026-10-22",
    );

    expect(positioned).toHaveLength(4);
    expect(positioned.every((p) => p.lane === 0 && p.laneCount === 1)).toBe(
      true,
    );
  });
});
