/**
 * urlEncoding.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Encodes and decodes application state to/from a compact URL query string.
 *
 * FORMAT v2  (current — written by encodeState)
 * ──────────────────────────────────────────────
 * ?v=2&n=<names>&t=<tripBlock>,<tripBlock>,…
 *
 *   n  — comma-separated traveler names (alphabetical chars only, so commas
 *         are safe as separators)
 *   t  — comma-separated trip blocks, sorted by entry date
 *
 * tripBlock fields (colon-separated):
 *   [0]  DATES     — 6-char (entry+exit concatenated) or 3-char (entry only)
 *   [1]  REGION    — VisaRegion integer as a single digit
 *   [2]  MASK      — base36 bitmask: bit i = 1 means travelers[i] is on trip
 *   [3]  NAME      — optional, encodeURIComponent-encoded trip name
 *
 * Date encoding: days since 2000-01-01, base36, zero-padded to 3 chars.
 *   e.g. 2025-11-27 → "7au"   2026-04-18 → "7es"   2024-10-15 → "6zi"
 *   Range 2000–2127 fits in 3 chars (36³ = 46 656 > 45 000 days).
 *
 * Traveler bitmask (2 travelers, Eric=bit0, Louise=bit1):
 *   mask 1 ("1") → Eric only
 *   mask 2 ("2") → Louise only
 *   mask 3 ("3") → both
 *
 * Shared trips: identical (entry, exit, region, name) across travelers are
 * encoded once with a combined mask, never duplicated. When one traveler's
 * copy is edited, dates diverge and the next encode naturally splits them.
 *
 * vs. v1: ~35% shorter for typical 2-traveler histories with shared trips.
 *
 * FORMAT v1  (legacy — still decoded for backward compatibility)
 * ───────────────────────────────────────────────────────────────
 * ?v=1&t=<travelerBlock>|<travelerBlock>|…
 *   travelerBlock:  NAME~<tripBlock>,…
 *   tripBlock (4):  YYMMDD:YYMMDD:R:NAME
 *   tripBlock (3):  YYMMDD:YYMMDD:R        (parts[1].length === 6 → has exit)
 *                   YYMMDD:R:NAME          (parts[1].length < 6 → ongoing)
 *   tripBlock (2):  YYMMDD:R
 *
 * EXAMPLE (v2)
 * ─────────────
 * Eric (Malta) + Eric & Louise (Macronesia):
 *   ?v=2&n=Eric,Louise&t=6zi7au:0:3:Macronesia,7es7ex:0:1:Malta
 */

import { nanoid } from "nanoid";
import { VisaRegion } from "@/types";
import type { Traveler, Trip, ShareableState } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const V1 = "1";
const V2 = "2";
const CURRENT_VERSION = V2;

const PARAM_VERSION = "v";
const PARAM_NAMES = "n";
const PARAM_TRIPS = "t"; // used by both v1 (traveler blocks) and v2 (trip segments)

const V1_DELIM = {
  traveler: "|",
  nameTripSeparator: "~",
  trip: ",",
  field: ":",
} as const;

const V2_DELIM = {
  name: ",",
  trip: ",",
  field: ":",
} as const;

// ─── Name validation / sanitisation ──────────────────────────────────────────

/** Maximum allowed length for traveler names. */
export const TRAVELER_NAME_MAX_LENGTH = 30;

/** Regex pattern for valid traveler names (alphabetical only, 1–30 chars). */
export const TRAVELER_NAME_PATTERN = /^[a-zA-Z]{1,30}$/;

/**
 * Strips all non-alphabetical characters and trims to TRAVELER_NAME_MAX_LENGTH chars.
 * Returns null if the result is empty.
 */
export const sanitizeTravelerName = (raw: string): string | null => {
  const cleaned = raw.replace(/[^a-zA-Z]/g, "").slice(0, TRAVELER_NAME_MAX_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
};

/**
 * Returns true when the name is purely alphabetical and 1–TRAVELER_NAME_MAX_LENGTH chars long.
 */
export const isValidTravelerName = (name: string): boolean => {
  return TRAVELER_NAME_PATTERN.test(name);
};

// ─── Date helpers — v2 (base36 epoch days) ───────────────────────────────────

const EPOCH_MS = Date.UTC(2000, 0, 1);
const MS_PER_DAY = 86_400_000;

/**
 * Encodes an ISO date string (YYYY-MM-DD) as base36 days since 2000-01-01,
 * zero-padded to exactly 3 characters.
 * e.g. "2025-11-27" → "7au"
 */
export const encodeDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - EPOCH_MS) / MS_PER_DAY);
  return days.toString(36).padStart(3, "0");
};

/**
 * Decodes a 3-char base36 day-offset back to an ISO date string (YYYY-MM-DD).
 */
export const decodeDate = (compact: string): string => {
  if (compact.length !== 3)
    throw new Error(`Invalid v2 compact date: "${compact}"`);
  const days = parseInt(compact, 36);
  if (isNaN(days) || days < 0)
    throw new Error(`Non-numeric base36 date: "${compact}"`);
  const date = new Date(EPOCH_MS + days * MS_PER_DAY);
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  const da = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
};

// ─── Date helpers — v1 (YYMMDD, legacy decode only) ──────────────────────────

const decodeDateV1 = (compact: string): string => {
  if (compact.length !== 6) throw new Error(`Invalid v1 date: "${compact}"`);
  const yy = compact.slice(0, 2);
  const mm = compact.slice(2, 4);
  const dd = compact.slice(4, 6);
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31)
    throw new Error(`Out-of-range date: "${compact}"`);
  return `20${yy}-${mm}-${dd}`;
};

// ─── Region helpers ───────────────────────────────────────────────────────────

const encodeRegion = (region: VisaRegion): string => String(region);

const decodeRegion = (raw: string): VisaRegion => {
  const value = parseInt(raw, 10);
  const valid = Object.values(VisaRegion) as number[];
  if (isNaN(value) || !valid.includes(value))
    throw new Error(`Unknown VisaRegion: "${raw}"`);
  return value as VisaRegion;
};

// ─── v2 shared trip segment ───────────────────────────────────────────────────

/** Internal shape used only during encode/decode; never exported. */
interface SharedTripSegment {
  entryDate: string;
  exitDate?: string;
  region: VisaRegion;
  name?: string;
  /** Bitmask: bit i = 1 means travelers[i] is on this trip. */
  travelerMask: number;
}

/**
 * Encodes a SharedTripSegment.
 *
 * Format: DATES:REGION:MASK[:NAME]
 *   DATES = 6 chars (entry+exit, no separator) for completed trips
 *           3 chars (entry only) for ongoing trips
 */
const encodeSegmentV2 = (seg: SharedTripSegment): string => {
  const entry = encodeDate(seg.entryDate);
  const dates = seg.exitDate ? entry + encodeDate(seg.exitDate) : entry;
  const region = encodeRegion(seg.region);
  const mask = seg.travelerMask.toString(36);
  const name = seg.name?.trim() ? encodeURIComponent(seg.name.trim()) : null;

  return name
    ? `${dates}${V2_DELIM.field}${region}${V2_DELIM.field}${mask}${V2_DELIM.field}${name}`
    : `${dates}${V2_DELIM.field}${region}${V2_DELIM.field}${mask}`;
};

/**
 * Decodes a v2 trip segment string.
 * parts[0].length === 6 → completed; === 3 → ongoing.
 */
const decodeSegmentV2 = (raw: string): SharedTripSegment => {
  const parts = raw.trim().split(V2_DELIM.field);
  if (parts.length < 3) throw new Error(`Malformed v2 trip segment: "${raw}"`);

  const dates = parts[0];
  let entryDate: string;
  let exitDate: string | undefined;

  if (dates.length === 6) {
    entryDate = decodeDate(dates.slice(0, 3));
    exitDate = decodeDate(dates.slice(3, 6));
    if (exitDate < entryDate)
      throw new Error(
        `Exit date ${exitDate} before entry ${entryDate} in "${raw}"`,
      );
  } else if (dates.length === 3) {
    entryDate = decodeDate(dates);
  } else {
    throw new Error(`Invalid dates field length (${dates.length}) in "${raw}"`);
  }

  const region = decodeRegion(parts[1]);
  const travelerMask = parseInt(parts[2], 36);
  if (isNaN(travelerMask) || travelerMask <= 0)
    throw new Error(`Invalid traveler mask "${parts[2]}" in "${raw}"`);

  const name = parts[3] ? decodeURIComponent(parts[3]) : undefined;
  return { entryDate, exitDate, region, travelerMask, name };
};

// ─── v2 State encode helpers ──────────────────────────────────────────────────

/**
 * Groups all trips from all travelers into SharedTripSegments.
 * Trips that are identical (entry, exit, region, name) across travelers are
 * merged into one segment with a combined bitmask.
 * Sorted chronologically by entry date.
 */
const buildSharedSegments = (travelers: Traveler[]): SharedTripSegment[] => {
  const map = new Map<string, SharedTripSegment>();

  travelers.forEach((traveler, idx) => {
    const bit = 1 << idx;
    traveler.trips.forEach((trip) => {
      const key = [
        trip.entryDate,
        trip.exitDate ?? "",
        trip.region,
        trip.destination ?? "",
      ].join("|");

      const existing = map.get(key);
      if (existing) {
        existing.travelerMask |= bit;
      } else {
        map.set(key, {
          entryDate: trip.entryDate,
          exitDate: trip.exitDate,
          region: trip.region,
          name: trip.destination,
          travelerMask: bit,
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) =>
    a.entryDate.localeCompare(b.entryDate),
  );
};

// ─── v2 State decode helpers ──────────────────────────────────────────────────

/**
 * Expands SharedTripSegments + traveler names back into per-traveler Traveler
 * objects. Each trip gets a fresh nanoid() per session (IDs are not stored in
 * the URL; they only need to be stable while the page is open).
 */
const expandSharedSegments = (
  names: string[],
  segments: SharedTripSegment[],
): Traveler[] => {
  const travelers: Traveler[] = names.map((name) => ({
    id: nanoid(),
    name,
    trips: [] as Trip[],
  }));

  segments.forEach((seg) => {
    names.forEach((_, idx) => {
      if (seg.travelerMask & (1 << idx)) {
        travelers[idx].trips.push({
          id: nanoid(),
          entryDate: seg.entryDate,
          exitDate: seg.exitDate,
          region: seg.region,
          destination: seg.name,
        });
      }
    });
  });

  // Restore chronological order within each traveler
  travelers.forEach((t) => {
    t.trips.sort((a, b) => a.entryDate.localeCompare(b.entryDate));
  });

  return travelers;
};

// ─── v1 Decode (legacy) ───────────────────────────────────────────────────────

const decodeTripV1 = (raw: string): Trip => {
  const parts = raw.trim().split(V1_DELIM.field);

  if (parts.length === 2) {
    return {
      id: nanoid(),
      entryDate: decodeDateV1(parts[0]),
      region: decodeRegion(parts[1]),
    };
  }

  if (parts.length === 3) {
    if (parts[1].length === 6) {
      const entryDate = decodeDateV1(parts[0]);
      const exitDate = decodeDateV1(parts[1]);
      if (exitDate < entryDate)
        throw new Error(
          `Exit ${exitDate} before entry ${entryDate} in "${raw}"`,
        );
      return {
        id: nanoid(),
        entryDate,
        exitDate,
        region: decodeRegion(parts[2]),
      };
    } else {
      return {
        id: nanoid(),
        entryDate: decodeDateV1(parts[0]),
        region: decodeRegion(parts[1]),
        destination: decodeURIComponent(parts[2]),
      };
    }
  }

  if (parts.length === 4) {
    const entryDate = decodeDateV1(parts[0]);
    const exitDate = decodeDateV1(parts[1]);
    if (exitDate < entryDate)
      throw new Error(`Exit ${exitDate} before entry ${entryDate} in "${raw}"`);
    return {
      id: nanoid(),
      entryDate,
      exitDate,
      region: decodeRegion(parts[2]),
      destination: decodeURIComponent(parts[3]),
    };
  }

  throw new Error(`Malformed v1 trip segment: "${raw}"`);
};

const decodeTravelerV1 = (block: string): Traveler | null => {
  const sep = block.indexOf(V1_DELIM.nameTripSeparator);
  if (sep === -1) return null;
  const name = sanitizeTravelerName(block.slice(0, sep));
  if (!name) return null;

  const tripsString = block.slice(sep + 1);
  const trips: Trip[] = tripsString
    ? tripsString
        .split(V1_DELIM.trip)
        .filter(Boolean)
        .reduce<Trip[]>((acc, seg) => {
          try {
            acc.push(decodeTripV1(seg));
          } catch {
            console.warn(`[urlEncoding] Skipping malformed v1 trip: "${seg}"`);
          }
          return acc;
        }, [])
    : [];

  return { id: nanoid(), name, trips };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Encodes the full shareable state into a URL query string (without leading ?).
 * Always emits v2 format.
 */
export const encodeState = (state: ShareableState): string => {
  if (state.travelers.length === 0) return "";

  const names = state.travelers.map((t) => t.name).join(V2_DELIM.name);
  const segments = buildSharedSegments(state.travelers);
  const tripsParam = segments.map(encodeSegmentV2).join(V2_DELIM.trip);

  return new URLSearchParams({
    [PARAM_VERSION]: CURRENT_VERSION,
    [PARAM_NAMES]: names,
    [PARAM_TRIPS]: tripsParam,
  }).toString();
};

/**
 * Builds a full shareable URL from state using the current page origin + path.
 */
export const buildShareableUrl = (state: ShareableState): string => {
  const qs = encodeState(state);
  const base = `${window.location.origin}${window.location.pathname}`;
  return qs ? `${base}?${qs}` : base;
};

export type DecodeResult =
  | { ok: true; state: ShareableState }
  | { ok: false; reason: string };

/**
 * Decodes a URL query string (or full URL) into application state.
 * Supports both v1 (legacy) and v2 (current) formats.
 * Never throws — malformed segments are skipped with a console warning.
 */
export const decodeState = (input: string): DecodeResult => {
  try {
    const queryString = input.includes("?") ? input.split("?")[1] : input;
    const params = new URLSearchParams(queryString);

    const version = params.get(PARAM_VERSION);
    if (!version) return { ok: false, reason: "Missing version parameter" };

    // ── v1 legacy ───────────────────────────────────────────────────────────
    if (version === V1) {
      const travelersParam = params.get(PARAM_TRIPS);
      if (!travelersParam)
        return { ok: false, reason: "v1: Missing travelers parameter" };

      const travelers: Traveler[] = travelersParam
        .split(V1_DELIM.traveler)
        .filter(Boolean)
        .reduce<Traveler[]>((acc, block) => {
          const t = decodeTravelerV1(block);
          if (t) {
            acc.push(t);
          } else {
            console.warn(
              `[urlEncoding] Skipping malformed v1 traveler block: "${block}"`,
            );
          }
          return acc;
        }, []);

      return { ok: true, state: { travelers } };
    }

    // ── v2 ──────────────────────────────────────────────────────────────────
    if (version === V2) {
      const namesParam = params.get(PARAM_NAMES);
      if (!namesParam)
        return { ok: false, reason: "v2: Missing names parameter" };

      const names = namesParam
        .split(V2_DELIM.name)
        .map((n) => sanitizeTravelerName(n))
        .filter((n): n is string => n !== null);

      if (names.length === 0)
        return { ok: false, reason: "v2: No valid traveler names" };

      const tripsParam = params.get(PARAM_TRIPS);
      if (!tripsParam)
        return { ok: false, reason: "v2: Missing trips parameter" };

      const segments: SharedTripSegment[] = tripsParam
        .split(V2_DELIM.trip)
        .filter(Boolean)
        .reduce<SharedTripSegment[]>((acc, raw) => {
          try {
            acc.push(decodeSegmentV2(raw));
          } catch (e) {
            console.warn(
              `[urlEncoding] Skipping malformed v2 trip segment: "${raw}"`,
              e,
            );
          }
          return acc;
        }, []);

      const travelers = expandSharedSegments(names, segments);
      return { ok: true, state: { travelers } };
    }

    return { ok: false, reason: `Unsupported URL version: ${version}` };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "Unknown decode error",
    };
  }
};

/**
 * Reads the current page's URL and returns decoded state.
 */
export const decodeCurrentUrl = (): DecodeResult => {
  return decodeState(window.location.search);
};
