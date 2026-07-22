/**
 * Per-traveler duration computation shared by the desktop Duration Status panel
 * and the mobile duration frame.
 *
 * Rolling-window regions (Schengen AND Türkiye and any rolling limit) run
 * through the same rolling-window breakdown so the full "days in window"
 * calculation is available. Per-visit regions (UK, Ireland) use the stay
 * assessment. Visa-required travelers are represented as untracked entries.
 */

import { VisaRegion } from "@/types";
import type { Traveler, PerVisitLimit, RollingWindowLimit } from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import {
  resolveStayLimits,
  assessStay,
  detectReentryRisk,
  perVisitApproxDays,
} from "@/features/calculator/utils/stayCalculator";
import type {
  StayAssessment,
  ReentryRisk,
  StayVariant,
} from "@/features/calculator/utils/stayCalculator";
import {
  computeImpactBreakdown,
  getStatusVariant,
} from "../travelers/travelerStatus";
import type { ImpactBreakdown } from "../travelers/travelerStatus";
import { createRollingWindowCalculator } from "@/features/calculator/utils/rollingWindowCalculator";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { parseDate, formatDate } from "@/features/calculator/utils/dates";

export const VISA_REQUIRED_DURATION_NOTE =
  "Visa required — the day allowance depends on the specific visa granted, so it can't be tracked automatically.";

/** Rolling-window status (days used / remaining in the window) for a traveler. */
export interface RollingStatus {
  daysUsed: number;
  daysRemaining: number;
  maxDays: number;
}

export interface TravelerDuration {
  id: string;
  name: string;
  color: string;
  /**
   * False for visa-required travelers: there is no calculable day allowance,
   * so the bar / chip fields are placeholders and `note` explains why.
   */
  tracked: boolean;
  /** Explanatory note shown when `tracked` is false. */
  note?: string;
  /** Stay-duration status, drives the bar / chip colour (only when tracked). */
  variant: StayVariant;
  /**
   * Overall status for the status icon / counts: the worse of the stay variant
   * and any re-entry risk. caution = approaching overstay (amber), danger = over
   * or refused (red).
   */
  severity: StayVariant;
  /** Bar fill, 0–100. */
  fillPct: number;
  /** Chip text, e.g. "34d left" or "over by 3d". */
  chipLabel: string;
  /** True when this traveler has a stay overstay or re-entry concern. */
  hasIssue: boolean;
  // ── Rolling-window detail (Schengen, Türkiye, …) ──
  rollingStatus?: RollingStatus;
  rollingBreakdown?: ImpactBreakdown;
  // ── Per-visit detail (UK, Ireland) ──
  assessment?: StayAssessment;
  reentry?: ReentryRisk | null;
}

function untrackedEntry(id: string, name: string, color: string): TravelerDuration {
  return {
    id,
    name,
    color,
    tracked: false,
    note: VISA_REQUIRED_DURATION_NOTE,
    variant: "safe",
    severity: "safe",
    fillPct: 0,
    chipLabel: "",
    hasIssue: false,
  };
}

const SEVERITY_RANK: Record<StayVariant, number> = { safe: 0, caution: 1, danger: 2 };

/** The worse of two variants (danger > caution > safe). */
function worseVariant(a: StayVariant, b: StayVariant | undefined): StayVariant {
  return b && SEVERITY_RANK[b] > SEVERITY_RANK[a] ? b : a;
}

export interface ComputeTravelerDurationsParams {
  region: VisaRegion;
  travelers: Traveler[];
  travelerIds: string[];
  entryDate: string;
  exitDate: string;
  destination: string;
  /** Trip being edited — excluded from each traveler's history. */
  excludeTripId?: string;
}

function chipFor(daysRemaining: number): string {
  return daysRemaining >= 0
    ? `${daysRemaining}d left`
    : `over by ${Math.abs(daysRemaining)}d`;
}

/** Build a rolling-window duration entry (Schengen / Türkiye rolling limits). */
function buildRolling(
  id: string,
  traveler: Traveler,
  color: string,
  region: VisaRegion,
  params: ComputeTravelerDurationsParams,
  maxDays: number,
  windowDays: number,
): TravelerDuration {
  const { entryDate, exitDate, destination, excludeTripId } = params;

  const regionTrips = traveler.trips.filter(
    (t) => t.region === region && t.id !== excludeTripId,
  );
  const withPreview = regionTrips.concat([
    { id: "__preview__", entryDate, exitDate: exitDate || undefined, region, destination },
  ]);

  const { getDaysUsedOnDate } = createRollingWindowCalculator({
    maxDays,
    windowSize: windowDays,
  });
  const refDate = exitDate ? parseDate(exitDate) : new Date();
  const daysUsed = getDaysUsedOnDate(formatDate(refDate), withPreview);
  const daysRemainingRaw = Math.max(0, maxDays - daysUsed);

  const breakdown = exitDate
    ? computeImpactBreakdown(entryDate, exitDate || undefined, regionTrips, {
        maxDays,
        windowDays,
      })
    : undefined;

  // The breakdown's extendable figure accounts for days rolling off the window,
  // so it is the truer "days remaining" when available.
  const daysRemaining = breakdown ? breakdown.daysRemaining : daysRemainingRaw;
  const variant = getStatusVariant(daysRemaining);
  const fillPct = Math.min(100, (Math.max(0, daysUsed) / maxDays) * 100);

  return {
    id,
    name: traveler.name,
    color,
    tracked: true,
    variant,
    severity: variant,
    fillPct,
    chipLabel: chipFor(daysRemaining),
    hasIssue: variant !== "safe",
    rollingStatus: { daysUsed, daysRemaining: daysRemainingRaw, maxDays },
    rollingBreakdown: breakdown,
  };
}

export function computeTravelerDurations(
  params: ComputeTravelerDurationsParams,
): TravelerDuration[] {
  const { region, travelers, travelerIds, entryDate, exitDate, excludeTripId } = params;
  if (!entryDate || region === VisaRegion.Elsewhere) return [];

  const result: TravelerDuration[] = [];

  for (const tid of travelerIds) {
    const traveler = travelers.find((t) => t.id === tid);
    if (!traveler) continue;
    const color = getTravelerColor(travelers.findIndex((t) => t.id === tid));

    // Schengen — rolling 90/180. Visa-required holders are untracked.
    if (region === VisaRegion.Schengen) {
      if (
        traveler.passportCode &&
        getPassportRule(VisaRegion.Schengen, traveler.passportCode).access ===
          "visa_required"
      ) {
        result.push(untrackedEntry(tid, traveler.name, color));
        continue;
      }
      result.push(buildRolling(tid, traveler, color, region, params, 90, 180));
      continue;
    }

    // ── Per-visit / rolling regions (UK, Ireland, Türkiye) ──
    const regionRule = getRegionDefinition(region)?.rule ?? null;
    const rule = getPassportRule(region, traveler.passportCode);

    // Visa-required (with a passport set) → untracked. No-passport travelers
    // fall through to the permissive region default below.
    if (traveler.passportCode && rule.access === "visa_required") {
      result.push(untrackedEntry(tid, traveler.name, color));
      continue;
    }

    const limits = resolveStayLimits(traveler.passportCode, rule, regionRule);
    if (!limits) continue; // free-movement → no day limit

    const perVisit = limits.find((l): l is PerVisitLimit => l.type === "per_visit");

    // A rolling-window limit with no per-visit cap (e.g. Türkiye 90/180) uses
    // the rolling breakdown (aging-out calculation). Everything else — per-visit,
    // fixed-window-from-entry, calendar-period, or a stacked combination — uses
    // the precise stay assessment, most restrictive limit governing.
    if (!perVisit) {
      const rolling = limits.find(
        (l): l is RollingWindowLimit => l.type === "rolling_window",
      );
      if (rolling) {
        result.push(
          buildRolling(tid, traveler, color, region, params, rolling.days, rolling.windowDays),
        );
        continue;
      }
    }

    const tripHistory = traveler.trips.filter(
      (t) => t.region === region && t.id !== excludeTripId,
    );
    const assessment = assessStay(limits, tripHistory, entryDate, exitDate || undefined);
    if (!assessment) continue;

    let reentry: ReentryRisk | null = null;
    if (perVisit) {
      const completed = traveler.trips.filter(
        (t) => t.region === region && t.exitDate && t.id !== excludeTripId,
      );
      reentry = detectReentryRisk(perVisitApproxDays(perVisit), completed, entryDate);
    }

    const fillPct = Math.min(100, (assessment.tripDays / assessment.daysAllowed) * 100);
    const severity = worseVariant(assessment.variant, reentry?.variant);

    result.push({
      id: tid,
      name: traveler.name,
      color,
      tracked: true,
      variant: assessment.variant,
      severity,
      fillPct,
      chipLabel: chipFor(assessment.daysRemaining),
      hasIssue: severity !== "safe",
      assessment,
      reentry,
    });
  }

  return result;
}
