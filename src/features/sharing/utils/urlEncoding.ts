/**
 * urlEncoding.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Encodes and decodes application state to/from a compact URL query string.
 *
 * FORMAT (v1)
 * ───────────
 * ?v=1&t=<travelerBlock>|<travelerBlock>|…
 *
 * travelerBlock:  TRAVELER_NAME~<tripBlock>,<tripBlock>,…
 * tripBlock (4 parts):  YYMMDD:YYMMDD:R:TRIP_NAME  (entry:exit:region:name)
 * tripBlock (3 parts):  YYMMDD:YYMMDD:R            (entry:exit:region, no name — legacy)
 *                       YYMMDD:R:TRIP_NAME          (ongoing with name)
 *                       ↑ disambiguated by parts[1].length: 6 = date, 1 = region
 * tripBlock (2 parts):  YYMMDD:R                   (ongoing, no name — legacy)
 *
 * R is the VisaRegion integer value (0, 1, 2, …) — always 1 char.
 * Date segments are always 6 chars (YYMMDD). This lets the decoder distinguish
 * "entry:exit:region" from "entry:region:name" unambiguously by part[1].length.
 *
 * TRIP_NAME is encodeURIComponent-encoded so any character is safe within the
 * segment. URLSearchParams double-encodes the % signs; .get() reverses one
 * layer, and decodeURIComponent in the decoder reverses the inner layer.
 *
 * Delimiter summary:
 *   |  traveler separator
 *   ~  traveler name / trips separator
 *   ,  trip separator
 *   :  field separator within a trip
 *
 * Traveler names: alphabetical characters only (a-z A-Z), 1–30 chars.
 *
 * EXAMPLE
 * ───────
 * Emma (named Schengen trip) and Liam (ongoing Elsewhere, no name):
 *   ?v=1&t=Emma~240101:240301:0:Paris%20%26%20Lyon|Liam~240901:1
 */

import { nanoid } from "nanoid";
import { VisaRegion } from "@/types";
import type { Traveler, Trip, ShareableState } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_VERSION = "1";
const PARAM_VERSION = "v";
const PARAM_TRAVELERS = "t";

const DELIM = {
  traveler: "|",
  nameTripSeparator: "~",
  trip: ",",
  field: ":",
} as const;

// ─── Name validation / sanitisation ──────────────────────────────────────────

/**
 * Strips all non-alphabetical characters and trims to 30 chars.
 * Returns null if the result is empty.
 */
export const sanitizeTravelerName = (raw: string): string | null => {
  const cleaned = raw.replace(/[^a-zA-Z]/g, "").slice(0, 30);
  return cleaned.length > 0 ? cleaned : null;
};

/**
 * Returns true when the name is purely alphabetical and 1–30 chars long.
 */
export const isValidTravelerName = (name: string): boolean => {
  return /^[a-zA-Z]{1,30}$/.test(name);
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Encodes an ISO date string (YYYY-MM-DD) to compact YYMMDD.
 * e.g. "2024-03-15" → "240315"
 */
export const encodeDate = (iso: string): string => {
  return iso.slice(2, 4) + iso.slice(5, 7) + iso.slice(8, 10);
};

/**
 * Decodes a compact YYMMDD string back to a full ISO date (YYYY-MM-DD).
 * Years 00–99 are mapped to 2000–2099.
 */
export const decodeDate = (compact: string): string => {
  if (compact.length !== 6) {
    throw new Error(`Invalid compact date: "${compact}"`);
  }
  const yy = compact.slice(0, 2);
  const mm = compact.slice(2, 4);
  const dd = compact.slice(4, 6);

  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Out-of-range date components in "${compact}"`);
  }

  return `20${yy}-${mm}-${dd}`;
};

// ─── Region helpers ───────────────────────────────────────────────────────────

const encodeRegion = (region: VisaRegion): string => String(region);

const decodeRegion = (raw: string): VisaRegion => {
  const value = parseInt(raw, 10);
  const validValues = Object.values(VisaRegion) as number[];
  if (isNaN(value) || !validValues.includes(value)) {
    throw new Error(`Unknown VisaRegion value: "${raw}"`);
  }
  return value as VisaRegion;
};

// ─── Trip encode / decode ─────────────────────────────────────────────────────

/**
 * Encodes a single Trip.
 *   With exit + name:    "240101:240201:0:Paris%20%26%20Lyon"
 *   With exit, no name:  "240101:240201:0"
 *   Ongoing with name:   "240101:0:Rome"
 *   Ongoing, no name:    "240101:0"
 */
export const encodeTrip = (trip: Trip): string => {
  const entry = encodeDate(trip.entryDate);
  const exit = trip.exitDate ? encodeDate(trip.exitDate) : null;
  const region = encodeRegion(trip.region);
  // Encode the name so any character (spaces, colons, etc.) is safe within
  // the segment. Empty / missing names are omitted to keep URLs compact.
  const name =
    trip.destination && trip.destination.trim()
      ? encodeURIComponent(trip.destination.trim())
      : null;

  if (exit) {
    return name
      ? `${entry}${DELIM.field}${exit}${DELIM.field}${region}${DELIM.field}${name}`
      : `${entry}${DELIM.field}${exit}${DELIM.field}${region}`;
  } else {
    return name
      ? `${entry}${DELIM.field}${region}${DELIM.field}${name}`
      : `${entry}${DELIM.field}${region}`;
  }
};

/**
 * Decodes a compact trip string back to a Trip object.
 *
 * Part-count dispatch:
 *   2 parts — entry:region          (ongoing, no name — legacy)
 *   3 parts — entry:exit:region     (with exit, no name — legacy)  [parts[1].length === 6]
 *             entry:region:name     (ongoing with name — new)       [parts[1].length < 6]
 *   4 parts — entry:exit:region:name
 *
 * IDs are assigned with nanoid() so the decoded trip can be matched and edited
 * within the session (ids are not encoded in the URL).
 */
export const decodeTrip = (raw: string): Trip => {
  const parts = raw.trim().split(DELIM.field);

  // ── 2 parts: legacy ongoing, no name ──────────────────────────────────────
  if (parts.length === 2) {
    return {
      id: nanoid(),
      entryDate: decodeDate(parts[0]),
      region: decodeRegion(parts[1]),
    };
  }

  // ── 3 parts: disambiguate by parts[1].length ──────────────────────────────
  if (parts.length === 3) {
    if (parts[1].length === 6) {
      // Legacy: entry:exit:region (no name)
      const entryDate = decodeDate(parts[0]);
      const exitDate = decodeDate(parts[1]);
      const region = decodeRegion(parts[2]);

      if (exitDate < entryDate) {
        throw new Error(
          `Exit date ${exitDate} is before entry date ${entryDate} in segment "${raw}"`,
        );
      }

      return { id: nanoid(), entryDate, exitDate, region };
    } else {
      // New: entry:region:destination (ongoing with name)
      return {
        id: nanoid(),
        entryDate: decodeDate(parts[0]),
        region: decodeRegion(parts[1]),
        destination: decodeURIComponent(parts[2]),
      };
    }
  }

  // ── 4 parts: entry:exit:region:name ───────────────────────────────────────
  if (parts.length === 4) {
    const entryDate = decodeDate(parts[0]);
    const exitDate = decodeDate(parts[1]);
    const region = decodeRegion(parts[2]);
    const destination = decodeURIComponent(parts[3]);

    if (exitDate < entryDate) {
      throw new Error(
        `Exit date ${exitDate} is before entry date ${entryDate} in segment "${raw}"`,
      );
    }

    return { id: nanoid(), entryDate, exitDate, region, destination };
  }

  throw new Error(`Malformed trip segment: "${raw}"`);
};

// ─── Traveler encode / decode ─────────────────────────────────────────────────

/**
 * Encodes a Traveler into its compact block string.
 * e.g. "Emma~240101:240201:0,240601:1"
 */
export const encodeTraveler = (traveler: Traveler): string => {
  const tripSegments = traveler.trips.map(encodeTrip).join(DELIM.trip);
  return `${traveler.name}${DELIM.nameTripSeparator}${tripSegments}`;
};

/**
 * Decodes a traveler block string back to a Traveler object.
 * Returns null if the block is unparseable.
 */
export const decodeTraveler = (block: string): Traveler | null => {
  const separatorIndex = block.indexOf(DELIM.nameTripSeparator);
  if (separatorIndex === -1) return null;

  const rawName = block.slice(0, separatorIndex);
  const tripsString = block.slice(separatorIndex + 1);

  const name = sanitizeTravelerName(rawName);
  if (!name) return null;

  const trips: Trip[] = tripsString
    ? tripsString
        .split(DELIM.trip)
        .filter(Boolean)
        .reduce<Trip[]>((acc, segment) => {
          try {
            acc.push(decodeTrip(segment));
          } catch {
            console.warn(`[urlEncoding] Skipping malformed trip: "${segment}"`);
          }
          return acc;
        }, [])
    : [];

  return { id: nanoid(), name, trips };
};

// ─── State to URL ─────────────────────────────────────────────────────────────

/**
 * Encodes the full shareable state into a URL query string (without leading ?).
 */
export const encodeState = (state: ShareableState): string => {
  if (state.travelers.length === 0) return "";

  const travelersParam = state.travelers
    .map(encodeTraveler)
    .join(DELIM.traveler);

  return new URLSearchParams({
    [PARAM_VERSION]: CURRENT_VERSION,
    [PARAM_TRAVELERS]: travelersParam,
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

// ─── URL to State ─────────────────────────────────────────────────────────────

export type DecodeResult =
  | { ok: true; state: ShareableState }
  | { ok: false; reason: string };

/**
 * Decodes a URL query string (or full URL) into application state.
 * Never throws — malformed blocks and trips are skipped with a console warning.
 */
export const decodeState = (input: string): DecodeResult => {
  try {
    const queryString = input.includes("?") ? input.split("?")[1] : input;
    const params = new URLSearchParams(queryString);

    const version = params.get(PARAM_VERSION);
    if (!version) return { ok: false, reason: "Missing version parameter" };
    if (version !== CURRENT_VERSION)
      return { ok: false, reason: `Unsupported URL version: ${version}` };

    const travelersParam = params.get(PARAM_TRAVELERS);
    if (!travelersParam)
      return { ok: false, reason: "Missing travelers parameter" };

    const travelers: Traveler[] = travelersParam
      .split(DELIM.traveler)
      .filter(Boolean)
      .reduce<Traveler[]>((acc, block) => {
        const traveler = decodeTraveler(block);
        if (traveler) {
          acc.push(traveler);
        } else {
          console.warn(
            `[urlEncoding] Skipping malformed traveler block: "${block}"`,
          );
        }
        return acc;
      }, []);

    return { ok: true, state: { travelers } };
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
