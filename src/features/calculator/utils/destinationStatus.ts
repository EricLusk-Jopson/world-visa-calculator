/**
 * Generic per-destination status engine for traveler headers.
 *
 * Everything here works across all RegionRule types (rolling_window, per_visit,
 * officer_discretion) and all tracked regions (Schengen, UK, Ireland, Türkiye) —
 * it is the "one slider / one chip pair for every type of passport rule" layer
 * that TravelerColumnHeader (desktop) and TravelerViewSlider (mobile) render
 * from. It intentionally uses each region's own top-level RegionRule config
 * (not per-passport StayEntitlement stacking) for the window/allowance shown —
 * the same simplification the existing Schengen header already made — while
 * still deferring to assessStay/detectReentryRisk (which DO resolve
 * passport-specific limits) for per-visit day counts and cooldown risk.
 */

import { VisaRegion, VISA_REGION_LABELS } from "@/types";
import type { Traveler, Trip, RegionRule, PerVisitLimit } from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import { createRollingWindowCalculator } from "./rollingWindowCalculator";
import {
  assessStay,
  resolveStayLimits,
  perVisitApproxDays,
  perVisitLimitLabel,
  computeFixedWindowStatus,
  type StayVariant,
} from "./stayCalculator";
import {
  today,
  parseDate,
  formatDate,
  subDays,
  differenceInCalendarDays,
} from "./dates";
import type { BadgeVariant } from "@/components/ui/StatusBadge";
import {
  CHIP_TOOLTIP_UK_STAY_CAUTION,
  CHIP_TOOLTIP_UK_STAY_DANGER,
} from "./uk/chipTooltips";
import {
  CHIP_TOOLTIP_IRELAND_STAY_CAUTION,
  CHIP_TOOLTIP_IRELAND_STAY_DANGER,
} from "./ireland/chipTooltips";

/**
 * Rolling-window severity keyed on days-from-overstay (the extension headroom):
 * green > 14, amber 4–14, red < 4. Duplicated from travelerStatus.ts (rather
 * than imported) to keep this feature-level module independent of the
 * page-level travelerStatus module — travelerStatus re-exports the same
 * threshold for the Schengen-specific call sites that still use it directly.
 */
function getStatusVariant(daysRemaining: number): StayVariant {
  if (daysRemaining > 14) return "safe";
  if (daysRemaining >= 4) return "caution";
  return "danger";
}

// ─── Lookback window ────────────────────────────────────────────────────────

export const DESTINATION_LOOKBACK_DAYS = 365;

/** True when a trip's entry date is within `lookbackDays` of `refDate` (past-bounded only — future trips always qualify). */
export function isWithinLookback(
  trip: Trip,
  refDate: Date = today(),
  lookbackDays: number = DESTINATION_LOOKBACK_DAYS,
): boolean {
  return differenceInCalendarDays(refDate, parseDate(trip.entryDate)) <= lookbackDays;
}

/** Regions with a calculable rule engine — everything except the untracked "Elsewhere" bucket. */
function isTrackableRegion(region: VisaRegion): boolean {
  return getRegionDefinition(region) !== null;
}

/**
 * True when `refDateStr` falls within the trip's span — the traveler is
 * physically there right now. Covers both a genuinely open-ended trip (no
 * exit date recorded yet) AND a fully-dated trip that simply happens to
 * cover today — the latter is just as "current" and must not be mistaken
 * for a finished (past) trip.
 */
function isTripCurrent(trip: Trip, refDateStr: string): boolean {
  if (trip.entryDate > refDateStr) return false;
  return !trip.exitDate || trip.exitDate >= refDateStr;
}

// ─── Active-trip tiering ──────────────────────────────────────────────────────

export type DestinationTier = "ongoing" | "upcoming" | "past";

/**
 * Picks the "active trip" from a set of trips, in priority order:
 * 1. currently ongoing, 2. next planned, 3. most recent past trip.
 * Returns null if `trips` is empty.
 */
export function pickActiveTrip(
  trips: Trip[],
  refDate: Date = today(),
): { trip: Trip; tier: DestinationTier } | null {
  const refStr = formatDate(refDate);
  const sorted = [...trips].sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1));

  const ongoing = sorted.find((t) => isTripCurrent(t, refStr));
  if (ongoing) return { trip: ongoing, tier: "ongoing" };

  const upcoming = sorted.find((t) => t.entryDate > refStr);
  if (upcoming) return { trip: upcoming, tier: "upcoming" };

  // Most recent past trip — last by entry date (all remaining trips are completed and in the past).
  const past = sorted[sorted.length - 1];
  return past ? { trip: past, tier: "past" } : null;
}

export interface DestinationCandidate {
  region: VisaRegion;
  trip: Trip;
  tier: DestinationTier;
}

/**
 * One candidate per trackable region present in the traveler's 1-year lookback
 * window, ordered by: ongoing first, then upcoming (soonest entry first), then
 * past-only (most recent first).
 */
export function rankDestinationCandidates(
  traveler: Traveler,
  refDate: Date = today(),
  lookbackDays: number = DESTINATION_LOOKBACK_DAYS,
): DestinationCandidate[] {
  const lookbackTrips = traveler.trips.filter(
    (t) => isTrackableRegion(t.region) && isWithinLookback(t, refDate, lookbackDays),
  );

  const byRegion = new Map<VisaRegion, Trip[]>();
  for (const trip of lookbackTrips) {
    const list = byRegion.get(trip.region);
    if (list) list.push(trip);
    else byRegion.set(trip.region, [trip]);
  }

  const candidates: DestinationCandidate[] = [];
  for (const [region, trips] of byRegion) {
    const active = pickActiveTrip(trips, refDate);
    if (active) candidates.push({ region, trip: active.trip, tier: active.tier });
  }

  const tierRank: Record<DestinationTier, number> = { ongoing: 0, upcoming: 1, past: 2 };

  candidates.sort((a, b) => {
    if (tierRank[a.tier] !== tierRank[b.tier]) return tierRank[a.tier] - tierRank[b.tier];
    if (a.tier === "upcoming") return a.trip.entryDate < b.trip.entryDate ? -1 : 1;
    if (a.tier === "past") {
      const aKey = a.trip.exitDate ?? a.trip.entryDate;
      const bKey = b.trip.exitDate ?? b.trip.entryDate;
      return aKey > bKey ? -1 : 1; // most recent first
    }
    return 0; // ongoing: only one candidate per traveler can be "ongoing" across regions in practice
  });

  return candidates;
}

/**
 * Resolves the region a traveler's header should default to: the region of
 * their overall active trip (ongoing > next planned > last trip) across ALL
 * trackable regions in the lookback window. Falls back to Schengen when the
 * traveler has no trips at all yet (matches the historical empty-state).
 */
export function determineActiveRegion(
  traveler: Traveler,
  refDate: Date = today(),
  lookbackDays: number = DESTINATION_LOOKBACK_DAYS,
): VisaRegion {
  const candidates = rankDestinationCandidates(traveler, refDate, lookbackDays);
  return candidates[0]?.region ?? VisaRegion.Schengen;
}

/**
 * Resolves which region the desktop header should display: the traveler's
 * explicit override when it's a trackable region, otherwise falls back to
 * the computed active region. The override is no longer required to have
 * trip history — the destination select lets a traveler preview any region
 * the app tracks, visited or not.
 */
export function resolveDisplayRegion(
  traveler: Traveler,
  refDate: Date = today(),
  lookbackDays: number = DESTINATION_LOOKBACK_DAYS,
): VisaRegion {
  if (
    traveler.targetRegion !== undefined &&
    traveler.targetRegion !== null &&
    isTrackableRegion(traveler.targetRegion)
  ) {
    return traveler.targetRegion;
  }
  return determineActiveRegion(traveler, refDate, lookbackDays);
}

// ─── Full-region categorization (desktop select + mobile destination list) ────

export type DestinationCategory = "current" | "recent" | "upcoming" | "old" | "never";

export const DESTINATION_CATEGORY_ORDER: DestinationCategory[] = [
  "current",
  "recent",
  "upcoming",
  "old",
  "never",
];

export const DESTINATION_CATEGORY_LABELS: Record<DestinationCategory, string> = {
  current: "Current trip",
  recent: "Recently visited",
  upcoming: "Upcoming",
  old: "Old trip",
  never: "Never visited",
};

/** Every region the app can track an allowance for — excludes the untracked "Elsewhere" bucket. */
export function getAllTrackableRegions(): VisaRegion[] {
  return (Object.values(VisaRegion) as VisaRegion[]).filter(isTrackableRegion);
}

export interface CategorizedDestination {
  region: VisaRegion;
  category: DestinationCategory;
}

/**
 * Categorizes EVERY trackable region for a traveler by temporal relevance —
 * not just the ones with trips in the lookback window. Priority order is
 * current > recently visited > upcoming > old > never; a region matches
 * exactly one category, the first that applies (e.g. a region with both an
 * old trip and an upcoming one is "upcoming", never "old").
 *
 * Within "recent" and "upcoming", entries are ordered by proximity to today
 * (most recent / soonest first). "old" and "never" are ordered alphabetically
 * by region name. Used to group and order both the desktop destination
 * select and the mobile destination list identically.
 */
export function categorizeAllDestinations(
  traveler: Traveler,
  refDate: Date = today(),
  lookbackDays: number = DESTINATION_LOOKBACK_DAYS,
): CategorizedDestination[] {
  const refStr = formatDate(refDate);

  const scored = getAllTrackableRegions().map((region) => {
    const trips = traveler.trips.filter((t) => t.region === region);

    if (trips.length === 0) {
      return { region, category: "never" as DestinationCategory, sortValue: 0 };
    }

    const current = trips.find((t) => isTripCurrent(t, refStr));
    if (current) {
      return {
        region,
        category: "current" as DestinationCategory,
        sortValue: parseDate(current.entryDate).getTime(),
      };
    }

    // Every non-current trip is either finished (has an exitDate < today) or
    // hasn't started yet (entryDate > today) — isTripCurrent covers every
    // other case, so this partition is exhaustive.
    const finished = trips
      .filter((t) => t.exitDate !== undefined && t.exitDate < refStr)
      .sort((a, b) => (a.exitDate! > b.exitDate! ? -1 : 1)); // most recent exit first
    const mostRecent = finished[0];
    const ageDays = mostRecent
      ? differenceInCalendarDays(refDate, parseDate(mostRecent.exitDate!))
      : Infinity;

    if (mostRecent && ageDays <= lookbackDays) {
      return { region, category: "recent" as DestinationCategory, sortValue: ageDays };
    }

    const future = trips
      .filter((t) => t.entryDate > refStr)
      .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1)); // soonest first
    const soonest = future[0];
    if (soonest) {
      const daysAway = differenceInCalendarDays(parseDate(soonest.entryDate), refDate);
      return { region, category: "upcoming" as DestinationCategory, sortValue: daysAway };
    }

    return { region, category: "old" as DestinationCategory, sortValue: 0 };
  });

  scored.sort((a, b) => {
    const catDiff =
      DESTINATION_CATEGORY_ORDER.indexOf(a.category) - DESTINATION_CATEGORY_ORDER.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    if (a.category === "old" || a.category === "never") {
      return VISA_REGION_LABELS[a.region].localeCompare(VISA_REGION_LABELS[b.region]);
    }
    return a.sortValue - b.sortValue;
  });

  return scored.map(({ region, category }) => ({ region, category }));
}

// ─── Status computation ───────────────────────────────────────────────────────

export interface DestinationChipData {
  label: string;
  variant: BadgeVariant;
  tooltip?: string;
}

export type DestinationRuleKind =
  | "rolling_window"
  | "per_visit"
  | "officer_discretion"
  | "fixed_window_from_entry";

export interface DestinationStatus {
  region: VisaRegion;
  regionName: string;
  ruleKind: DestinationRuleKind | null;
  /** False when the traveler's passport requires a visa for this region. */
  eligible: boolean;
  fillPct: number;
  variant: StayVariant;
  availableChip: DestinationChipData | null;
  secondChip: DestinationChipData | null;
  /** Short line under the region name, e.g. "42/90 used since 12 Jan". */
  summaryLine: string;
  /** Longer explanatory text — used as the mobile "note" in place of desktop tooltips. */
  note: string;
}

function fmtWindowDate(iso: string): string {
  // parseDate (date-fns parseISO) reads a date-only string as LOCAL midnight.
  // The native `new Date(iso)` constructor reads it as UTC midnight instead,
  // which .toLocaleDateString() then renders back in the browser's local
  // timezone — silently shifting the date by a day for anyone west of UTC.
  return parseDate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Tooltip for a near-max per-visit stay — the trip whose length may itself
 * trigger a cooldown before the traveler can re-enter. Only called for
 * caution/danger; there's nothing to say when the stay is comfortably safe.
 */
function stayLimitTooltip(region: VisaRegion, variant: "caution" | "danger"): string | undefined {
  if (region === VisaRegion.UnitedKingdom) {
    return variant === "danger" ? CHIP_TOOLTIP_UK_STAY_DANGER : CHIP_TOOLTIP_UK_STAY_CAUTION;
  }
  if (region === VisaRegion.Ireland) {
    return variant === "danger" ? CHIP_TOOLTIP_IRELAND_STAY_DANGER : CHIP_TOOLTIP_IRELAND_STAY_CAUTION;
  }
  return undefined;
}

function unavailableStatus(region: VisaRegion, note: string): DestinationStatus {
  return {
    region,
    regionName: VISA_REGION_LABELS[region],
    ruleKind: null,
    eligible: false,
    fillPct: 0,
    variant: "safe",
    availableChip: null,
    secondChip: null,
    summaryLine: "",
    note,
  };
}

/**
 * Computes the generic slider/chip/note data for a traveler + region, driven
 * by the region's own RegionRule type. `refDate` lets callers evaluate as of
 * "today" (default) for the header or as of a specific date for tests.
 */
export function computeDestinationStatus(
  traveler: Traveler,
  region: VisaRegion,
  refDate: Date = today(),
): DestinationStatus {
  const regionDef = getRegionDefinition(region);
  const regionName = VISA_REGION_LABELS[region];
  if (!regionDef) {
    return unavailableStatus(region, `Day tracking is not available for ${regionName}.`);
  }

  const passportCode = traveler.passportCode;
  const rule = getPassportRule(region, passportCode);

  if (rule.access === "visa_required") {
    return {
      ...unavailableStatus(
        region,
        `A visa is required to enter ${regionName} with this passport. Day tracking is not shown for visas — allowance depends on the visa granted.`,
      ),
      eligible: false,
    };
  }

  const refDateStr = formatDate(refDate);
  const regionTrips = traveler.trips.filter((t) => t.region === region);
  const regionRule: RegionRule = regionDef.rule;

  if (regionRule.type === "rolling_window") {
    const config = { maxDays: regionRule.allowanceDays, windowSize: regionRule.windowDays };
    const { getDaysUsedOnDate, calculateMaxStay } = createRollingWindowCalculator(config);

    const daysUsed = getDaysUsedOnDate(refDateStr, regionTrips);
    const daysRemaining = Math.max(0, config.maxDays - daysUsed);
    const variant = getStatusVariant(daysRemaining);
    const maxStayResult = calculateMaxStay(refDateStr, regionTrips);
    const maxStay = maxStayResult.canEnter ? maxStayResult.maxDays : 0;
    const windowStart = formatDate(subDays(refDate, config.windowSize - 1));
    const todayFmt = fmtWindowDate(refDateStr);
    const fillPct = Math.min(100, (daysUsed / config.maxDays) * 100);

    return {
      region,
      regionName,
      ruleKind: "rolling_window",
      eligible: true,
      fillPct,
      variant,
      availableChip: {
        label: `${daysRemaining}d avail`,
        variant,
        tooltip: `Your balance today, ${todayFmt}. Ticks up by one each time an earlier day rolls out of the ${config.windowSize}-day window.`,
      },
      secondChip: {
        label: `${maxStay}d max`,
        variant: maxStay > daysRemaining ? "safe" : variant,
        tooltip: `The longest stay you could start today, ${todayFmt}, in ${regionName}, including days that free up as you go.`,
      },
      summaryLine: `As of today, ${todayFmt}: ${daysUsed}/${config.maxDays} used`,
      note:
        daysUsed > 0
          ? `${config.maxDays}-day allowance in the rolling ${config.windowSize}-day window. As of today, ${todayFmt}, the window started ${fmtWindowDate(windowStart)}.`
          : `No ${regionName} days used in the rolling ${config.windowSize}-day window as of today, ${todayFmt}.`,
    };
  }

  if (regionRule.type === "per_visit") {
    // Resolve the traveler's ACTUAL entitlement limit (unit-aware — e.g. UK is
    // "6 months", calendar-anchored via addMonths, not a flat 180 days). The
    // region-level RegionRule.allowanceDays is only a rounded approximation
    // and must never drive the exit-date/day-count math.
    const limits = resolveStayLimits(passportCode, rule, regionRule);
    const perVisitLimit = limits?.find((l): l is PerVisitLimit => l.type === "per_visit") ?? null;
    const todayFmt = fmtWindowDate(refDateStr);

    if (!perVisitLimit) {
      return {
        region,
        regionName,
        ruleKind: "per_visit",
        eligible: true,
        fillPct: 0,
        variant: "safe",
        availableChip: null,
        secondChip: null,
        summaryLine: "No day limit",
        note:
          rule.access === "free_movement"
            ? `Free movement — no per-visit limit applies to this passport in ${regionName}.`
            : `No calculable per-visit limit for this passport in ${regionName}.`,
      };
    }

    const daysAllowed = perVisitApproxDays(perVisitLimit);
    const limitLabel = perVisitLimitLabel(perVisitLimit);

    // Allowances only make sense in the context of a trip happening right now.
    // A trip that's finished or hasn't started yet doesn't reflect the
    // traveler's current allowance — only a trip covering today does,
    // whether or not it already has a planned exit date on file.
    const ongoingTrip = regionTrips.find((t) => isTripCurrent(t, refDateStr));

    if (!ongoingTrip) {
      return {
        region,
        regionName,
        ruleKind: "per_visit",
        eligible: true,
        fillPct: 0,
        variant: "safe",
        availableChip: {
          label: `${daysAllowed}d avail`,
          variant: "safe",
          tooltip: `Full ${limitLabel} allowance for ${regionName} — there's no trip there happening today, ${todayFmt}.`,
        },
        secondChip: null,
        summaryLine: `Not there today, ${todayFmt} — full allowance available`,
        note: `${limitLabel} allowance per visit for ${regionName}, resetting on each departure and re-entry. The full allowance is shown because there's no trip there today, ${todayFmt}.`,
      };
    }

    const history = regionTrips.filter((t) => t.id !== ongoingTrip.id);
    const assessment = assessStay([perVisitLimit], history, ongoingTrip.entryDate, refDateStr);

    const tripDays = assessment?.tripDays ?? 0;
    const daysRemaining = Math.max(0, assessment?.daysRemaining ?? daysAllowed);
    const variant: StayVariant = assessment?.variant ?? "safe";
    const fillPct = Math.min(100, (tripDays / daysAllowed) * 100);

    // Cooldown is a boolean-ish state on the trip that might CAUSE one — a
    // near-max stay — not a lookup against a previous trip's re-entry gap.
    // Mirrors the trip modal's own duration alerts (safe/caution/danger);
    // hidden entirely when safe, per the same alerts never firing then.
    const stayTooltip =
      variant === "safe" ? undefined : stayLimitTooltip(region, variant);
    const secondChip: DestinationChipData | null =
      variant === "safe"
        ? null
        : {
            label: variant === "danger" ? "Cooldown risk" : "Cooldown ahead",
            variant,
            tooltip: stayTooltip,
          };

    return {
      region,
      regionName,
      ruleKind: "per_visit",
      eligible: true,
      fillPct,
      variant,
      availableChip: {
        label: `${daysRemaining}d avail`,
        variant,
        tooltip: `Days remaining in this stay before the ${limitLabel} per-visit limit for ${regionName} is reached.`,
      },
      secondChip,
      summaryLine: `Day ${Math.min(tripDays, daysAllowed)} of ${limitLabel} visit — as of today, ${todayFmt}`,
      note:
        stayTooltip ??
        `${limitLabel} allowance per visit for ${regionName}, resetting on each departure and re-entry.`,
    };
  }

  if (regionRule.type === "fixed_window_from_entry") {
    const config = { days: regionRule.allowanceDays, windowDays: regionRule.windowDays };
    const status = computeFixedWindowStatus(config, regionTrips, refDateStr);
    const variant = getStatusVariant(status.daysRemaining);
    const todayFmt = fmtWindowDate(refDateStr);
    const fillPct = Math.min(100, (status.daysUsed / config.days) * 100);

    return {
      region,
      regionName,
      ruleKind: "fixed_window_from_entry",
      eligible: true,
      fillPct,
      variant,
      availableChip: {
        label: `${status.daysRemaining}d avail`,
        variant,
        tooltip: `Your balance today, ${todayFmt}, within the current ${config.windowDays}-day window (${fmtWindowDate(status.windowStart)}–${fmtWindowDate(status.windowEnd)}).`,
      },
      secondChip: {
        label: `${status.maxStay}d max`,
        variant: status.maxStay > status.daysRemaining ? "safe" : variant,
        tooltip: `The longest stay you could start today, ${todayFmt}, in ${regionName}, bounded by the window's end (${fmtWindowDate(status.windowEnd)}).`,
      },
      summaryLine: `As of today, ${todayFmt}: ${status.daysUsed}/${config.days} used`,
      note:
        status.daysUsed > 0
          ? `${config.days}-day allowance within a ${config.windowDays}-day window anchored to first entry. As of today, ${todayFmt}, the current window started ${fmtWindowDate(status.windowStart)}.`
          : `No ${regionName} days used in the current window as of today, ${todayFmt}.`,
    };
  }

  // officer_discretion — no calculable limit.
  const infoDays = regionRule.informationalDays;
  return {
    region,
    regionName,
    ruleKind: "officer_discretion",
    eligible: true,
    fillPct: 0,
    variant: "safe",
    availableChip: null,
    secondChip: null,
    summaryLine: "No fixed limit",
    note:
      regionRule.notes?.[0]?.text ??
      (infoDays
        ? `Stay duration is at officer discretion; ${infoDays} days is informational only.`
        : "Stay duration is at the discretion of the immigration officer."),
  };
}

export { perVisitApproxDays };
