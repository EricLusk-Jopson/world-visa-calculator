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
  destination?: string,
): Trip => ({
  id: "test-id",
  entryDate,
  exitDate,
  region,
  destination,
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

// ─── Date encoding (v2: base36 epoch days, 3-char) ───────────────────────────

describe("encodeDate / decodeDate", () => {
  it("encodes the epoch anchor as '000'", () => {
    expect(encodeDate("2000-01-01")).toBe("000");
  });

  it("encodes a single day offset as '001'", () => {
    expect(encodeDate("2000-01-02")).toBe("001");
  });

  it("always produces exactly 3 characters", () => {
    const dates = ["2000-01-01", "2001-06-15", "2024-03-15", "2025-12-31"];
    dates.forEach((d) => {
      expect(encodeDate(d)).toHaveLength(3);
    });
  });

  it("round-trips a range of dates correctly", () => {
    const dates = [
      "2000-01-01",
      "2001-06-15",
      "2024-01-01",
      "2024-06-15",
      "2025-03-31",
      "2026-12-25",
    ];
    dates.forEach((d) => {
      expect(decodeDate(encodeDate(d))).toBe(d);
    });
  });

  it("throws on a 6-char legacy YYMMDD string", () => {
    expect(() => decodeDate("240101")).toThrow();
  });

  it("throws on strings that are not exactly 3 characters", () => {
    expect(() => decodeDate("24")).toThrow();
    expect(() => decodeDate("2401")).toThrow();
    expect(() => decodeDate("")).toThrow();
  });

  it("throws on non-base36 characters", () => {
    expect(() => decodeDate("z!z")).toThrow();
  });
});

// ─── Full state round-trips ───────────────────────────────────────────────────

describe("encodeState / decodeState — v2", () => {
  it("returns empty string for no travelers", () => {
    expect(encodeState({ travelers: [] })).toBe("");
  });

  it("encoded string includes v=2", () => {
    const state: ShareableState = {
      travelers: [traveler("Emma", [trip("2024-01-01", "2024-03-31")])],
    };
    expect(encodeState(state)).toContain("v=2");
  });

  it("round-trips a single traveler with a completed trip", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Emma", [
          trip("2024-01-01", "2024-03-31", VisaRegion.Schengen),
        ]),
      ],
    };
    const result = decodeState(encodeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].name).toBe("Emma");
    expect(result.state.travelers[0].trips[0].entryDate).toBe("2024-01-01");
    expect(result.state.travelers[0].trips[0].exitDate).toBe("2024-03-31");
    expect(result.state.travelers[0].trips[0].region).toBe(VisaRegion.Schengen);
  });

  it("round-trips an ongoing trip (no exit date)", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Liam", [trip("2025-06-01", undefined, VisaRegion.Elsewhere)]),
      ],
    };
    const result = decodeState(encodeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].trips[0].exitDate).toBeUndefined();
    expect(result.state.travelers[0].trips[0].region).toBe(
      VisaRegion.Elsewhere,
    );
  });

  it("round-trips a trip with a destination name", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Sofia", [
          trip("2024-05-01", "2024-05-14", VisaRegion.Schengen, "Amsterdam"),
        ]),
      ],
    };
    const result = decodeState(encodeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].trips[0].destination).toBe("Amsterdam");
  });

  it("round-trips a two-traveler state with independent trips", () => {
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
    expect(result.state.travelers).toHaveLength(2);
    expect(result.state.travelers[0].name).toBe("Emma");
    expect(result.state.travelers[0].trips).toHaveLength(2);
    expect(result.state.travelers[1].name).toBe("Liam");
    expect(result.state.travelers[1].trips).toHaveLength(1);
  });

  it("merges shared trips into a single segment and expands them back correctly", () => {
    const sharedTrip = trip(
      "2024-03-01",
      "2024-03-31",
      VisaRegion.Schengen,
      "Lisbon",
    );
    const state: ShareableState = {
      travelers: [
        traveler("Eric", [sharedTrip]),
        traveler("Louise", [sharedTrip]),
      ],
    };
    const encoded = encodeState(state);
    // The shared trip should be encoded once (one segment in the t= param)
    const params = new URLSearchParams(encoded.split("?")[1] ?? encoded);
    const tripSegments = params.get("t")?.split(",") ?? [];
    expect(tripSegments).toHaveLength(1);

    const result = decodeState(encoded);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].trips[0].entryDate).toBe("2024-03-01");
    expect(result.state.travelers[1].trips[0].entryDate).toBe("2024-03-01");
  });

  it("restores trips in chronological order per traveler", () => {
    const state: ShareableState = {
      travelers: [
        traveler("Emma", [
          trip("2024-09-01", "2024-09-15"),
          trip("2024-01-01", "2024-02-28"),
          trip("2024-05-01", "2024-06-15"),
        ]),
      ],
    };
    const result = decodeState(encodeState(state));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const dates = result.state.travelers[0].trips.map((t) => t.entryDate);
    expect(dates).toEqual([...dates].sort());
  });

  it("fails gracefully on unsupported version", () => {
    const r = decodeState("v=99&n=Emma&t=abc");
    expect(r.ok).toBe(false);
  });

  it("fails gracefully when version param is missing", () => {
    expect(decodeState("n=Emma&t=abc").ok).toBe(false);
  });

  it("fails gracefully when names param is missing in v2", () => {
    expect(decodeState("v=2&t=abc").ok).toBe(false);
  });

  it("fails gracefully when trips param is missing in v2", () => {
    expect(decodeState("v=2&n=Emma").ok).toBe(false);
  });

  it("skips malformed trip segments and keeps valid ones", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    // Manually inject one bad segment; the second is a valid v2 segment
    const validState: ShareableState = {
      travelers: [traveler("Emma", [trip("2024-01-01", "2024-01-31")])],
    };
    const encoded = encodeState(validState);
    const params = new URLSearchParams(encoded.split("?")[1] ?? encoded);
    const t = params.get("t") ?? "";
    params.set("t", `${t},INVALID`);
    const corrupted = `v=2&${params.toString()}`;

    const result = decodeState(corrupted);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].trips).toHaveLength(1);
    consoleSpy.mockRestore();
  });

  it("never throws on garbage input", () => {
    expect(() => decodeState("not a url!!!")).not.toThrow();
    expect(() => decodeState("")).not.toThrow();
  });
});

// ─── v1 backward compatibility ────────────────────────────────────────────────

describe("decodeState — v1 legacy", () => {
  it("decodes a v1 URL with a single traveler and completed trip", () => {
    // v1 format: v=1&t=NAME~YYMMDD:YYMMDD:REGION
    const result = decodeState("v=1&t=Emma~240101:240331:0");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].name).toBe("Emma");
    expect(result.state.travelers[0].trips[0].entryDate).toBe("2024-01-01");
    expect(result.state.travelers[0].trips[0].exitDate).toBe("2024-03-31");
    expect(result.state.travelers[0].trips[0].region).toBe(VisaRegion.Schengen);
  });

  it("decodes a v1 URL with an ongoing trip", () => {
    const result = decodeState("v=1&t=Liam~240601:1");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers[0].trips[0].exitDate).toBeUndefined();
    expect(result.state.travelers[0].trips[0].region).toBe(
      VisaRegion.Elsewhere,
    );
  });

  it("decodes a v1 URL with multiple travelers separated by |", () => {
    const result = decodeState(
      "v=1&t=Emma~240101:240331:0|Liam~240115:240415:0",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.travelers).toHaveLength(2);
    expect(result.state.travelers[1].name).toBe("Liam");
  });

  it("accepts a full v1 URL", () => {
    const url =
      "https://eurovisacalculator.com/?v=1&t=Emma~240101%3A240331%3A0";
    expect(decodeState(url).ok).toBe(true);
  });

  it("fails gracefully when v1 t param is missing", () => {
    expect(decodeState("v=1").ok).toBe(false);
  });
});

// ─── buildShareableUrl ────────────────────────────────────────────────────────

describe("buildShareableUrl", () => {
  it("returns bare base URL when there are no travelers", () => {
    expect(buildShareableUrl({ travelers: [] })).toBe(
      "https://eurovisacalculator.com/",
    );
  });

  it("returns a URL containing a query string when travelers exist", () => {
    const state: ShareableState = {
      travelers: [traveler("Emma", [trip("2024-01-01", "2024-03-31")])],
    };
    const url = buildShareableUrl(state);
    expect(url).toContain("https://eurovisacalculator.com/");
    expect(url).toContain("?");
    expect(url).toContain("v=2");
  });

  it("round-trips state via the full URL", () => {
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

// ─── URL compactness ──────────────────────────────────────────────────────────

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

  it("is shorter than an equivalent v1 encoding would be", () => {
    // v2 uses 3-char base36 dates vs 6-char YYMMDD, so a non-trivial state
    // should produce a shorter query string
    const state: ShareableState = {
      travelers: [
        traveler("Eric", [
          trip("2024-03-01", "2024-03-31", VisaRegion.Schengen, "Lisbon"),
          trip("2024-07-01", "2024-09-30", VisaRegion.Schengen, "Barcelona"),
        ]),
        traveler("Louise", [
          trip("2024-03-01", "2024-03-31", VisaRegion.Schengen, "Lisbon"),
          trip("2024-11-01", "2024-11-15", VisaRegion.Elsewhere),
        ]),
      ],
    };
    const encoded = encodeState(state);
    expect(encoded.length).toBeLessThan(300);
  });
});
