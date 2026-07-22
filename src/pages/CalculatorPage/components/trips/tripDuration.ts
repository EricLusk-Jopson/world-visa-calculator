/**
 * Per-traveler duration computation shared by the desktop Duration Status panel
 * and the mobile duration frame.
 *
 * For each selected traveler with a calculable stay, produces:
 *   - a progress bar fill (rolling window → balance used; per-visit → proportion
 *     of the entitlement consumed by this trip)
 *   - a status variant + chip label ("34d left" / "over by 3d")
 *   - the underlying detail needed to render the expanded view (Schengen impact
 *     breakdown, or the generic stay assessment + re-entry risk).
 *
 * Visa-required travelers (no calculable stay) are omitted — they surface in the
 * visa-holder disclaimer instead.
 */

import { VisaRegion } from "@/types";
import type { Traveler, PerVisitLimit } from "@/types";
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
  computeTravelerStatus,
  computeImpactBreakdown,
  getStatusVariant,
} from "../travelers/travelerStatus";
import type { TravelerStatus, ImpactBreakdown } from "../travelers/travelerStatus";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { parseDate } from "@/features/calculator/utils/dates";

const SCHENGEN_MAX_DAYS = 90;

export const VISA_REQUIRED_DURATION_NOTE =
  "Visa required — the day allowance depends on the specific visa granted, so it can't be tracked automatically.";

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
  /** Overall status for the bar / chip (only meaningful when tracked). */
  variant: StayVariant;
  /** Bar fill, 0–100. */
  fillPct: number;
  /** Chip text, e.g. "34d left" or "over by 3d". */
  chipLabel: string;
  /** True when this traveler has a stay overstay or re-entry concern. */
  hasIssue: boolean;
  // ── Schengen detail ──
  schengenStatus?: TravelerStatus;
  schengenBreakdown?: ImpactBreakdown;
  // ── Generic (per-visit / rolling) detail ──
  assessment?: StayAssessment;
  reentry?: ReentryRisk | null;
}

function untrackedEntry(
  id: string,
  name: string,
  color: string,
): TravelerDuration {
  return {
    id,
    name,
    color,
    tracked: false,
    note: VISA_REQUIRED_DURATION_NOTE,
    variant: "safe",
    fillPct: 0,
    chipLabel: "",
    hasIssue: false,
  };
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

export function computeTravelerDurations({
  region,
  travelers,
  travelerIds,
  entryDate,
  exitDate,
  destination,
  excludeTripId,
}: ComputeTravelerDurationsParams): TravelerDuration[] {
  if (!entryDate || region === VisaRegion.Elsewhere) return [];

  const result: TravelerDuration[] = [];

  for (const tid of travelerIds) {
    const traveler = travelers.find((t) => t.id === tid);
    if (!traveler) continue;
    const color = getTravelerColor(travelers.findIndex((t) => t.id === tid));

    if (region === VisaRegion.Schengen) {
      // Visa-required Schengen travelers have no calculable day allowance
      // (it depends on the specific visa) — represent them as untracked.
      if (
        traveler.passportCode &&
        getPassportRule(VisaRegion.Schengen, traveler.passportCode).access ===
          "visa_required"
      ) {
        result.push(untrackedEntry(tid, traveler.name, color));
        continue;
      }

      const tempTrips = traveler.trips
        .filter((t) => t.id !== excludeTripId)
        .concat([
          {
            id: "__preview__",
            entryDate,
            exitDate: exitDate || undefined,
            region: VisaRegion.Schengen,
            destination,
          },
        ]);
      const refDate = exitDate ? parseDate(exitDate) : new Date();
      const status = computeTravelerStatus({ ...traveler, trips: tempTrips }, refDate);

      const historical = traveler.trips.filter(
        (t) => t.region === VisaRegion.Schengen && t.id !== excludeTripId,
      );
      const breakdown = exitDate
        ? computeImpactBreakdown(entryDate, exitDate || undefined, historical)
        : undefined;

      // The breakdown's extendable figure accounts for days rolling off the
      // window, so it is the truer "days remaining" when available.
      const daysRemaining = breakdown ? breakdown.daysRemaining : status.daysRemaining;
      const variant = getStatusVariant(daysRemaining);
      const fillPct = Math.min(
        100,
        (Math.max(0, status.daysUsed) / SCHENGEN_MAX_DAYS) * 100,
      );

      result.push({
        id: tid,
        name: traveler.name,
        color,
        tracked: true,
        variant,
        fillPct,
        chipLabel: chipFor(daysRemaining),
        hasIssue: variant !== "safe",
        schengenStatus: status,
        schengenBreakdown: breakdown,
      });
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

    const tripHistory = traveler.trips.filter(
      (t) => t.region === region && t.id !== excludeTripId,
    );
    const assessment = assessStay(limits, tripHistory, entryDate, exitDate || undefined);
    if (!assessment) continue;

    const perVisit = limits.find(
      (l): l is PerVisitLimit => l.type === "per_visit",
    );
    let reentry: ReentryRisk | null = null;
    if (perVisit) {
      const completed = traveler.trips.filter(
        (t) => t.region === region && t.exitDate && t.id !== excludeTripId,
      );
      reentry = detectReentryRisk(perVisitApproxDays(perVisit), completed, entryDate);
    }

    const fillPct = Math.min(
      100,
      (assessment.tripDays / assessment.daysAllowed) * 100,
    );
    const hasIssue =
      assessment.variant !== "safe" || (reentry != null && reentry.variant !== "safe");

    result.push({
      id: tid,
      name: traveler.name,
      color,
      tracked: true,
      variant: assessment.variant,
      fillPct,
      chipLabel: chipFor(assessment.daysRemaining),
      hasIssue,
      assessment,
      reentry,
    });
  }

  return result;
}
