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
import type { Trip, Traveler, ShareableState } from "@/types";

// ─── Mock window for buildShareableUrl ───────────────────────────────────────

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

const trip = (entryDate: string, exitDate?: string): Trip => ({
  entryDate,
  exitDate,
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
    expect(() => decodeDate("241301")).toThrow(); // month 13
    expect(() => decodeDate("240100")).toThrow(); // day 0
  });
});

// ─── Trip encoding ────────────────────────────────────────────────────────────

describe("encodeTrip / decodeTrip", () => {
  it("encodes a trip with exit", () => {
    expect(encodeTrip(trip("2024-01-01", "2024-03-31"))).toBe("240101:240331");
  });
  it("encodes an ongoing trip", () => {
    expect(encodeTrip(trip("2024-01-01"))).toBe("240101");
  });
  it("decodes a trip with exit", () => {
    const t = decodeTrip("240101:240331");
    expect(t.entryDate).toBe("2024-01-01");
    expect(t.exitDate).toBe("2024-03-31");
  });
  it("decodes an ongoing trip", () => {
    const t = decodeTrip("240101");
    expect(t.entryDate).toBe("2024-01-01");
    expect(t.exitDate).toBeUndefined();
  });
  it("throws when exit is before entry", () => {
    expect(() => decodeTrip("240301:240101")).toThrow(/before entry/);
  });
  it("round-trips correctly", () => {
    const cases = [
      trip("2024-01-01", "2024-03-31"),
      trip("2024-06-01"),
      trip("2025-03-15", "2025-04-15"),
    ];
    cases.forEach((t) => {
      const decoded = decodeTrip(encodeTrip(t));
      expect(decoded.entryDate).toBe(t.entryDate);
      expect(decoded.exitDate).toBe(t.exitDate);
    });
  });
});

// ─── Traveler encoding ────────────────────────────────────────────────────────

describe("encodeTraveler / decodeTraveler", () => {
  it("encodes a traveler with multiple trips", () => {
    const t = traveler("Emma", [
      trip("2024-01-01", "2024-03-31"),
      trip("2024-06-01"),
    ]);
    expect(encodeTraveler(t)).toBe("Emma~240101:240331,240601");
  });
  it("encodes a traveler with no trips", () => {
    expect(encodeTraveler(traveler("Liam", []))).toBe("Liam~");
  });
  it("decodes a traveler block", () => {
    const t = decodeTraveler("Emma~240101:240331,240601");
    expect(t?.name).toBe("Emma");
    expect(t?.trips).toHaveLength(2);
    expect(t?.trips[0].entryDate).toBe("2024-01-01");
    expect(t?.trips[1].exitDate).toBeUndefined();
  });
  it("returns null when separator is missing", () => {
    expect(decodeTraveler("NoSeparatorHere")).toBeNull();
  });
  it("returns null when name is all non-alphabetical", () => {
    expect(decodeTraveler("123~240101")).toBeNull();
  });
  it("skips malformed trip segments gracefully", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const t = decodeTraveler("Emma~240101:240331,BADDATE,240601");
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
          trip("2024-01-01", "2024-03-31"),
          trip("2024-06-01"),
        ]),
        traveler("Liam", [trip("2024-01-15", "2024-04-15")]),
      ],
    };
    const result = decodeState(encodeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].name).toBe("Emma");
    expect(result.state.travelers[0].trips).toHaveLength(2);
    expect(result.state.travelers[1].name).toBe("Liam");
  });

  it("fails gracefully on bad version", () => {
    expect(decodeState("v=99&t=Emma~240101").ok).toBe(false);
    expect(decodeState("t=Emma~240101").ok).toBe(false);
  });

  it("fails gracefully when t param is missing", () => {
    expect(decodeState("v=1").ok).toBe(false);
  });

  it("accepts a full URL (not just query string)", () => {
    const url = "https://eurovisacalculator.com/?v=1&t=Emma~240101%3A240331";
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
    const url = buildShareableUrl({ travelers: [] });
    expect(url).toBe("https://eurovisacalculator.com/");
  });
  it("round-trips via URL", () => {
    const state: ShareableState = {
      travelers: [traveler("Emma", [trip("2024-01-01", "2024-03-31")])],
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
          trip("2024-01-01", "2024-03-31"),
          trip("2024-06-01", "2024-08-31"),
        ]),
        traveler("Liam", [
          trip("2024-01-15", "2024-04-15"),
          trip("2024-07-01"),
        ]),
      ],
    };
    expect(buildShareableUrl(state).length).toBeLessThan(200);
  });
});
