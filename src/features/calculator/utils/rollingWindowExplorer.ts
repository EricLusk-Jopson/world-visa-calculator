/**
 * Data for the rolling-window explorer (the desktop "Rolling Window" modal).
 *
 * The explorer shows one timeline row per traveler holding every trip they
 * made, greyed out, with the trips to the active destinations in that
 * destination's colour. Each active destination's rolling window is laid over
 * the row, ending on a date the user slides around. Window size and
 * allowance come from the traveler's own passport rule (resolved on the
 * window's end date), not from the region alone, since they can differ by
 * passport (Türkiye 60/180 vs 90/180, Armenia 180/365).
 *
 * Only rolling_window limits are drawn. A traveler whose passport gets a
 * different kind of limit (or none) keeps their row, with the reason.
 */

import type { PassportRule, RollingWindowLimit, Traveler, Trip } from "@/types";
import { VisaRegion } from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import { resolveStayLimits } from "./stayCalculator";
import { createRollingWindowCalculator } from "./rollingWindowCalculator";
import {
  addDays,
  countDaysInWindow,
  differenceInCalendarDays,
  formatDate,
  parseDate,
  subDays,
  today,
} from "./dates";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExplorerRow {
  /** `${travelerId}:${region}`, stable across renders. */
  key: string;
  travelerId: string;
  travelerName: string;
  region: VisaRegion;
  /** This traveler's trips to `region`, sorted by entry date. */
  trips: Trip[];
  /** The rolling window that applies on the window end date, if any. */
  limit: RollingWindowLimit | null;
  /** Why there is no rolling window to draw, when `limit` is null. */
  noLimitReason?: string;
}

export interface RowWindowStats {
  windowStart: string;
  windowEnd: string;
  daysUsed: number;
  allowance: number;
  remaining: number;
  over: boolean;
}

export interface DateBounds {
  start: string;
  end: string;
}

/** A traveler's row: all their trips, plus one entry per active destination. */
export interface TravelerTimeline {
  travelerId: string;
  travelerName: string;
  /** Every trip, any destination, sorted by entry date. */
  trips: Trip[];
  /** One per active destination, in the order the destinations were given. */
  jurisdictions: ExplorerRow[];
}

/** A window drawn over a traveler's row: one per distinct window length. */
export interface WindowBand {
  windowDays: number;
  windowStart: string;
  /** True when any destination using this window length is over its limit. */
  over: boolean;
  members: { region: VisaRegion; stats: RowWindowStats }[];
}

// ─── Destinations ─────────────────────────────────────────────────────────────

/** True when the region's headline rule is a rolling window (Schengen, Türkiye…). */
export function isRollingWindowRegion(region: VisaRegion): boolean {
  return getRegionDefinition(region)?.rule.type === "rolling_window";
}

export interface ExplorerDestination {
  region: VisaRegion;
  tripCount: number;
  /** False for regions with trips whose rule isn't a rolling window. */
  supported: boolean;
}

/**
 * Every destination with a trip inside `bounds` (Elsewhere excluded), most
 * visited first. With no bounds, every trip counts. A destination is
 * supported when its region rule, or at least one traveler's passport rule
 * there, is a rolling window.
 */
export function listExplorerDestinations(
  travelers: Traveler[],
  onDate: string,
  bounds?: DateBounds,
): ExplorerDestination[] {
  const counts = new Map<VisaRegion, number>();
  for (const t of travelers) {
    for (const trip of t.trips) {
      if (trip.region === VisaRegion.Elsewhere) continue;
      if (bounds && !tripOverlaps(trip, bounds)) continue;
      counts.set(trip.region, (counts.get(trip.region) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([region, tripCount]) => ({
      region,
      tripCount,
      supported:
        isRollingWindowRegion(region) ||
        travelers.some((t) => getRollingLimit(t, region, onDate) !== null),
    }))
    .sort((a, b) => b.tripCount - a.tripCount || a.region - b.region);
}

// ─── Limits ───────────────────────────────────────────────────────────────────

/** The traveler's rolling-window limit in `region` on `onDate`, or null. */
export function getRollingLimit(
  traveler: Pick<Traveler, "passportCode">,
  region: VisaRegion,
  onDate: string,
): RollingWindowLimit | null {
  const rule = getPassportRule(region, traveler.passportCode);
  const regionRule = getRegionDefinition(region)?.rule ?? null;
  const limits = resolveStayLimits(traveler.passportCode, rule, regionRule, onDate);
  return (
    limits?.find((l): l is RollingWindowLimit => l.type === "rolling_window") ??
    null
  );
}

function noLimitReason(rule: PassportRule): string {
  switch (rule.access) {
    case "free_movement":
      return "Free movement: no day limit";
    case "visa_required":
      return "Visa required: the visa sets the limit";
    default:
      return "Not a rolling-window rule for this passport";
  }
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

/**
 * One row per (destination, traveler) pair, grouped by destination in the
 * order given, then by traveler order. `onDate` is the window end date; the
 * limit is resolved on it so dated rule changes apply as the window moves.
 */
export function buildExplorerRows(
  travelers: Traveler[],
  regions: VisaRegion[],
  onDate: string,
): ExplorerRow[] {
  const rows: ExplorerRow[] = [];
  for (const region of regions) {
    for (const traveler of travelers) {
      const limit = getRollingLimit(traveler, region, onDate);
      rows.push({
        key: `${traveler.id}:${region}`,
        travelerId: traveler.id,
        travelerName: traveler.name,
        region,
        trips: traveler.trips
          .filter((t) => t.region === region)
          .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1)),
        limit,
        noLimitReason: limit
          ? undefined
          : noLimitReason(getPassportRule(region, traveler.passportCode)),
      });
    }
  }
  return rows;
}

/**
 * One row per traveler, in traveler order. `regions` are the active
 * destinations; `onDate` is the window end date, on which each limit is
 * resolved so dated rule changes apply as the window moves.
 */
export function buildTravelerTimelines(
  travelers: Traveler[],
  regions: VisaRegion[],
  onDate: string,
): TravelerTimeline[] {
  return travelers.map((traveler) => ({
    travelerId: traveler.id,
    travelerName: traveler.name,
    trips: [...traveler.trips].sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1)),
    jurisdictions: buildExplorerRows([traveler], regions, onDate),
  }));
}

/**
 * The windows to draw over a traveler's row on `windowEnd`, longest first so
 * shorter ones stack on top. Destinations sharing a window length share a
 * band (all windows end on the same date, so equal lengths coincide).
 * Destinations the traveler has never been to get no band.
 */
export function windowBands(timeline: TravelerTimeline, windowEnd: string): WindowBand[] {
  const byLength = new Map<number, WindowBand>();
  for (const row of timeline.jurisdictions) {
    const stats = rowWindowStats(row, windowEnd);
    if (!row.limit || !stats || row.trips.length === 0) continue;
    const band = byLength.get(row.limit.windowDays) ?? {
      windowDays: row.limit.windowDays,
      windowStart: stats.windowStart,
      over: false,
      members: [],
    };
    band.members.push({ region: row.region, stats });
    band.over ||= stats.over;
    byLength.set(row.limit.windowDays, band);
  }
  return [...byLength.values()].sort((a, b) => b.windowDays - a.windowDays);
}

/** Days used and left in the row's window ending on `windowEnd` (inclusive). */
export function rowWindowStats(
  row: ExplorerRow,
  windowEnd: string,
): RowWindowStats | null {
  if (!row.limit) return null;
  const { days, windowDays } = row.limit;
  const daysUsed = createRollingWindowCalculator({
    maxDays: days,
    windowSize: windowDays,
  }).getDaysUsedOnDate(windowEnd, row.trips);
  return {
    windowStart: formatDate(subDays(parseDate(windowEnd), windowDays - 1)),
    windowEnd,
    daysUsed,
    allowance: days,
    remaining: Math.max(0, days - daysUsed),
    over: daysUsed > days,
  };
}

/** The trip's exit date, or today for an ongoing trip (as the calculator does). */
export function tripEnd(trip: Trip): string {
  return trip.exitDate ?? formatDate(today());
}

/** Length of the whole trip, entry and exit days included. */
export function tripLength(trip: Trip): number {
  return differenceInCalendarDays(parseDate(tripEnd(trip)), parseDate(trip.entryDate)) + 1;
}

/** Days of the trip inside [windowStart, windowEnd], both inclusive. */
export function tripDaysInWindow(
  trip: Trip,
  windowStart: string,
  windowEnd: string,
): number {
  return countDaysInWindow(
    parseDate(trip.entryDate),
    parseDate(tripEnd(trip)),
    parseDate(windowStart),
    parseDate(windowEnd),
  );
}

// ─── Date bounds ──────────────────────────────────────────────────────────────

const LEAD_DAYS = 30;
const DEFAULT_WINDOW_DAYS = 180;

/** True when the trip has at least one day inside the bounds. */
export function tripOverlaps(trip: Trip, bounds: DateBounds): boolean {
  return trip.entryDate <= bounds.end && tripEnd(trip) >= bounds.start;
}

/** How many of the travelers' trips fall wholly outside the bounds. */
export function countTripsOutside(travelers: Traveler[], bounds: DateBounds): number {
  return travelers.reduce(
    (n, t) => n + t.trips.filter((trip) => !tripOverlaps(trip, bounds)).length,
    0,
  );
}

/**
 * The longest rolling window any traveler has in any destination they've
 * been to, as of `onDate` (at least 180 days).
 */
export function longestWindowDays(travelers: Traveler[], onDate: string): number {
  let longest = DEFAULT_WINDOW_DAYS;
  for (const t of travelers) {
    for (const region of new Set(t.trips.map((trip) => trip.region))) {
      longest = Math.max(longest, getRollingLimit(t, region, onDate)?.windowDays ?? 0);
    }
  }
  return longest;
}

/**
 * The default visible range: from a month before the first trip to one
 * window length after the last, so the last trip can be watched ageing out.
 * Snapped to whole months. With no trips, a window either side of today.
 */
export function fitBounds(trips: Trip[], windowDays = DEFAULT_WINDOW_DAYS): DateBounds {
  let first: Date;
  let last: Date;
  if (trips.length === 0) {
    first = subDays(today(), windowDays);
    last = today();
  } else {
    first = parseDate(trips.reduce((m, t) => (t.entryDate < m ? t.entryDate : m), trips[0].entryDate));
    last = parseDate(trips.map(tripEnd).reduce((m, d) => (d > m ? d : m)));
  }

  const start = subDays(first, LEAD_DAYS);
  const end = addDays(last, windowDays);
  return {
    start: formatDate(new Date(start.getFullYear(), start.getMonth(), 1)),
    end: formatDate(new Date(end.getFullYear(), end.getMonth() + 1, 0)),
  };
}

/** `date` clamped into [bounds.start, bounds.end]. ISO strings compare as dates. */
export function clampDate(date: string, bounds: DateBounds): string {
  if (date < bounds.start) return bounds.start;
  if (date > bounds.end) return bounds.end;
  return date;
}
