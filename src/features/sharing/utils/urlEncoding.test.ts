/**
 * urlEncoding.test.ts
 * Run with: npx vitest run
 */

import { describe, it, expect, vi, beforeAll } from "vitest";
import {
  sanitizeTravelerName,
  isValidTravelerName,
  encodeDate,
  decodeDate,
  encodeTrip,
  decodeTrip,
  encodeTraveler,
  decodeTraveler,
  encodeState,
  decodeState,
  buildShareableUrl,
} from "./urlEncoding";
import { VisaRegion } from "../../../types";
import type { Trip, Traveler, ShareableState } from "../../../types";

// ─── Mock window ──────────────────────────────────────────────────────────────

beforeAll(() => {
  Object.defineProperty(window, "location", {
    value: {
      origin: "https://eurovisacalculator.com",
      pathname: "/",
      search: "",
    },
    writable: true,
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const trip = (
  entryDate: string,
  exitDate?: string,
  region: VisaRegion = VisaRegion.Schengen,
): Trip => ({
  entryDate,
  exitDate,
  region,
});

const traveler = (name: string, trips: Trip[]): Traveler => ({
  id: "test-id",
  name,
  trips,
});

// ─── Name validation ──────────────────────────────────────────────────────────

describe("sanitizeTravelerName", () => {
  it("strips non-alphabetical characters", () => {
    expect(sanitizeTravelerName("Emma-Rose!")).toBe("EmmaRose");
  });
  it("strips digits", () => {
    expect(sanitizeTravelerName("L1am")).toBe("Lam");
  });
  it("strips spaces", () => {
    expect(sanitizeTravelerName("Mr Chen")).toBe("MrChen");
  });
  it("trims to 30 characters", () => {
    expect(sanitizeTravelerName("A".repeat(40))).toHaveLength(30);
  });
  it("returns null for empty result", () => {
    expect(sanitizeTravelerName("123!@#")).toBeNull();
    expect(sanitizeTravelerName("")).toBeNull();
  });
});

describe("isValidTravelerName", () => {
  it("accepts purely alphabetical names", () => {
    expect(isValidTravelerName("Emma")).toBe(true);
    expect(isValidTravelerName("MrChen")).toBe(true);
  });
  it("rejects names with spaces, digits, or special chars", () => {
    expect(isValidTravelerName("Mr Chen")).toBe(false);
    expect(isValidTravelerName("L1am")).toBe(false);
    expect(isValidTravelerName("")).toBe(false);
  });
  it("rejects names over 30 chars, accepts exactly 30", () => {
    expect(isValidTravelerName("A".repeat(31))).toBe(false);
    expect(isValidTravelerName("A".repeat(30))).toBe(true);
  });
});

// ─── Date encoding ────────────────────────────────────────────────────────────

describe("encodeDate / decodeDate", () => {
  it("encodes YYYY-MM-DD to YYMMDD", () => {
    expect(encodeDate("2024-01-01")).toBe("240101");
    expect(encodeDate("2025-12-31")).toBe("251231");
  });
  it("decodes YYMMDD to YYYY-MM-DD", () => {
    expect(decodeDate("240101")).toBe("2024-01-01");
    expect(decodeDate("251231")).toBe("2025-12-31");
  });
  it("round-trips correctly", () => {
    ["2024-01-01", "2024-06-15", "2025-03-31", "2026-12-25"].forEach((d) => {
      expect(decodeDate(encodeDate(d))).toBe(d);
    });
  });
  it("throws on invalid input", () => {
    expect(() => decodeDate("2401")).toThrow();
    expect(() => decodeDate("241301")).toThrow();
    expect(() => decodeDate("240100")).toThrow();
  });
});

// ─── Trip encoding ────────────────────────────────────────────────────────────

describe("encodeTrip / decodeTrip", () => {
  it("encodes a Schengen trip with exit", () => {
    expect(
      encodeTrip(trip("2024-01-01", "2024-03-31", VisaRegion.Schengen)),
    ).toBe("240101:240331:0");
  });
  it("encodes an ongoing Elsewhere trip", () => {
    expect(
      encodeTrip(trip("2024-01-01", undefined, VisaRegion.Elsewhere)),
    ).toBe("240101:1");
  });
  it("decodes a trip with exit", () => {
    const t = decodeTrip("240101:240331:0");
    expect(t.entryDate).toBe("2024-01-01");
    expect(t.exitDate).toBe("2024-03-31");
    expect(t.region).toBe(VisaRegion.Schengen);
  });
  it("decodes an ongoing trip", () => {
    const t = decodeTrip("240101:1");
    expect(t.entryDate).toBe("2024-01-01");
    expect(t.exitDate).toBeUndefined();
    expect(t.region).toBe(VisaRegion.Elsewhere);
  });
  it("throws when exit is before entry", () => {
    expect(() => decodeTrip("240301:240101:0")).toThrow(/before entry/);
  });
  it("throws on unknown region value", () => {
    expect(() => decodeTrip("240101:240331:99")).toThrow(/VisaRegion/);
  });
  it("throws on malformed segment", () => {
    expect(() => decodeTrip("240101")).toThrow(); // missing region
    expect(() => decodeTrip("240101:240201:0:extra")).toThrow();
  });
  it("round-trips correctly", () => {
    const cases = [
      trip("2024-01-01", "2024-03-31", VisaRegion.Schengen),
      trip("2024-06-01", undefined, VisaRegion.Elsewhere),
      trip("2025-03-15", "2025-04-15", VisaRegion.Schengen),
    ];
    cases.forEach((t) => {
      const decoded = decodeTrip(encodeTrip(t));
      expect(decoded.entryDate).toBe(t.entryDate);
      expect(decoded.exitDate).toBe(t.exitDate);
      expect(decoded.region).toBe(t.region);
    });
  });
});

// ─── Traveler encoding ────────────────────────────────────────────────────────

describe("encodeTraveler / decodeTraveler", () => {
  it("encodes a traveler with multiple trips", () => {
    const t = traveler("Emma", [
      trip("2024-01-01", "2024-03-31", VisaRegion.Schengen),
      trip("2024-06-01", undefined, VisaRegion.Elsewhere),
    ]);
    expect(encodeTraveler(t)).toBe("Emma~240101:240331:0,240601:1");
  });
  it("encodes a traveler with no trips", () => {
    expect(encodeTraveler(traveler("Liam", []))).toBe("Liam~");
  });
  it("decodes a traveler block", () => {
    const t = decodeTraveler("Emma~240101:240331:0,240601:1");
    expect(t?.name).toBe("Emma");
    expect(t?.trips).toHaveLength(2);
    expect(t?.trips[0].region).toBe(VisaRegion.Schengen);
    expect(t?.trips[1].region).toBe(VisaRegion.Elsewhere);
    expect(t?.trips[1].exitDate).toBeUndefined();
  });
  it("returns null when separator is missing", () => {
    expect(decodeTraveler("NoSeparatorHere")).toBeNull();
  });
  it("returns null when name is all non-alphabetical", () => {
    expect(decodeTraveler("123~240101:0")).toBeNull();
  });
  it("skips malformed trip segments gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const t = decodeTraveler("Emma~240101:240331:0,BADDATE,240601:1");
    expect(t?.trips).toHaveLength(2);
    consoleSpy.mockRestore();
  });
});

// ─── Full state round-trip ────────────────────────────────────────────────────

describe("encodeState / decodeState", () => {
  it("returns empty string for no travelers", () => {
    expect(encodeState({ travelers: [] })).toBe("");
  });

  it("round-trips a two-traveler state", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Emma", [
          trip("2024-01-01", "2024-03-31", VisaRegion.Schengen),
          trip("2024-06-01", undefined, VisaRegion.Elsewhere),
        ]),
        traveler("Liam", [
          trip("2024-01-15", "2024-04-15", VisaRegion.Schengen),
        ]),
      ],
    };
    const result = decodeState(encodeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].name).toBe("Emma");
    expect(result.state.travelers[0].trips[0].region).toBe(VisaRegion.Schengen);
    expect(result.state.travelers[0].trips[1].region).toBe(
      VisaRegion.Elsewhere,
    );
    expect(result.state.travelers[1].name).toBe("Liam");
  });

  it("fails gracefully on bad version", () => {
    expect(decodeState("v=99&t=Emma~240101:0").ok).toBe(false);
    expect(decodeState("t=Emma~240101:0").ok).toBe(false);
  });

  it("fails gracefully when t param is missing", () => {
    expect(decodeState("v=1").ok).toBe(false);
  });

  it("accepts a full URL", () => {
    const url =
      "https://eurovisacalculator.com/?v=1&t=Emma~240101%3A240331%3A0";
    expect(decodeState(url).ok).toBe(true);
  });

  it("never throws on garbage input", () => {
    expect(() => decodeState("not a url!!!")).not.toThrow();
    expect(() => decodeState("")).not.toThrow();
  });
});

// ─── buildShareableUrl ────────────────────────────────────────────────────────

describe("buildShareableUrl", () => {
  it("returns base URL with no travelers", () => {
    expect(buildShareableUrl({ travelers: [] })).toBe(
      "https://eurovisacalculator.com/",
    );
  });
  it("round-trips via URL", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Emma", [
          trip("2024-01-01", "2024-03-31", VisaRegion.Schengen),
        ]),
      ],
    };
    const result = decodeState(buildShareableUrl(state));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state.travelers[0].name).toBe("Emma");
  });
});

// ─── URL length sanity check ──────────────────────────────────────────────────

describe("URL compactness", () => {
  it("keeps a 2-person 4-trip URL under 200 chars", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Emma", [
          trip("2024-01-01", "2024-03-31", VisaRegion.Schengen),
          trip("2024-06-01", "2024-08-31", VisaRegion.Schengen),
        ]),
        traveler("Liam", [
          trip("2024-01-15", "2024-04-15", VisaRegion.Schengen),
          trip("2024-07-01", undefined, VisaRegion.Elsewhere),
        ]),
      ],
    };
    expect(buildShareableUrl(state).length).toBeLessThan(200);
  });
});
