/**
 * Which destinations put a traveller on a rolling window, and with what numbers.
 *
 * Schengen is not the only rolling-window regime: Türkiye, Montenegro, Serbia,
 * Albania, Armenia and others apply one too, and the numbers depend on the
 * passport (Armenia 180/365, Bosnia's Ukraine rule 30/60, Serbia's 30/365, …).
 * The marker modules resolve the traveller's own limits per region and date,
 * the same way the stay calculator does, and only draw markers where a
 * rolling_window limit actually applies. Fixed-window-from-entry, calendar and
 * per-visit-only regimes have no "days age out" behaviour, so they get none.
 */

import type { PerVisitLimit, RollingWindowLimit, VisaRegion } from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import {
  perVisitApproxDays,
  resolveStayLimits,
} from "@/features/calculator/utils/stayCalculator";

export interface RollingWindowConfig {
  maxDays: number;
  windowSize: number;
  /**
   * The per-visit cap stacked on top of the window, when the entitlement has
   * one (e.g. Serbia's `[per_visit(N), rolling_window(90, 180)]`). No single
   * stay may exceed it, whatever the window would allow.
   */
  perVisitCap?: number;
}

/**
 * The rolling window that applies to `passportCode` in `region` for a stay
 * starting on `dateStr`, or null when none does (visa required, a
 * non-rolling regime, or a temporal waiver that isn't open on that date).
 */
export function resolveRollingWindow(
  region: VisaRegion,
  passportCode: string | null,
  dateStr: string,
): RollingWindowConfig | null {
  const regionRule = getRegionDefinition(region)?.rule ?? null;
  if (!regionRule) return null;
  const limits = resolveStayLimits(
    passportCode,
    getPassportRule(region, passportCode),
    regionRule,
    dateStr,
  );
  if (!limits) return null;

  const rolling = limits.find(
    (l): l is RollingWindowLimit => l.type === "rolling_window",
  );
  if (!rolling) return null;

  const perVisit = limits.find(
    (l): l is PerVisitLimit => l.type === "per_visit",
  );
  const perVisitCap = perVisit ? perVisitApproxDays(perVisit) : undefined;

  return {
    maxDays: rolling.days,
    windowSize: rolling.windowDays,
    ...(perVisitCap !== undefined && perVisitCap < rolling.days
      ? { perVisitCap }
      : {}),
  };
}

/** Longest single stay the config can ever allow. */
export function effectiveAllowance(config: RollingWindowConfig): number {
  return Math.min(config.maxDays, config.perVisitCap ?? Infinity);
}

/**
 * Return-marker milestones: six even steps up to the allowance. For a
 * 90-day allowance that is 15/30/45/60/75/90, for Armenia's 180 it is
 * 30/60/…/180, and for a 30-day cap 5/10/…/30.
 */
export function thresholdsFor(allowance: number): number[] {
  const step = Math.max(1, Math.round(allowance / 6));
  const out: number[] = [];
  for (let d = step; d < allowance; d += step) out.push(d);
  out.push(allowance);
  return out;
}
