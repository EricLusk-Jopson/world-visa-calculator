/**
 * Per-traveler entry-eligibility data for the mobile eligibility frame.
 *
 * Flattens a traveler's PassportRule + the region rule into display-ready
 * fields: access status, admittance rule text, pre-auth, and the notes
 * (pre-auth requirements, entitlement conditions, and rule notes) worth
 * surfacing per traveler.
 */

import { VisaRegion, VISA_REGION_LABELS } from "@/types";
import type {
  Traveler,
  PassportRule,
  RegionRule,
  StayLimit,
  StayEntitlement,
  EntitlementCondition,
  TemporalWindow,
  RuleNote,
  SourceDoc,
} from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { selectEntitlement, effectiveWindowRange } from "@/features/calculator/utils/stayCalculator";
import { parseDate, addYears } from "@/features/calculator/utils/dates";

export interface EligibilityNote {
  /** Category label, e.g. "Pre-authorisation", "Condition", "Note". */
  label: string;
  text: string;
  source?: RuleNote["source"];
}

/**
 * One TemporalWindow (from any of the passport rule's entitlements) worth
 * showing for a specific trip — either the one actually governing the
 * trip's entry date (`active: true`) or one nearby in time (within a year
 * either side of the trip) shown for context, e.g. a waiver that just
 * expired or one announced to start after this trip.
 */
export interface RelevantTemporalWindow {
  window: TemporalWindow;
  /** True if this window governs the trip's actual entry date. */
  active: boolean;
}

export interface TravelerEligibility {
  id: string;
  name: string;
  color: string;
  passportCode: string | null;
  passportDisplay: string;
  regionLabel: string;
  access: PassportRule["access"] | "unknown";
  accessLabel: string;
  /** True = clear entry (green); false = visa required / unknown (warn). */
  ok: boolean;
  /** Admittance rule text(s), e.g. "Up to 6 months per visit". */
  ruleTexts: string[];
  preAuthName?: string;
  /**
   * The citation for the rule currently in effect — surfaced in the UI as a
   * link on the Rule/Access summary row, not as a note (see
   * StayEntitlement.source). Prefers the most specific citation available
   * (an active temporal window's own source, then the entitlement's, then
   * the raw passport rule's — see resolveEffectiveEligibility), but is only
   * ever `undefined` for an untracked region (no RegionDefinition, e.g.
   * "Elsewhere"). For every trackable region this always resolves to at
   * least that region's own `sourceUrl`, so every trip renders a source
   * link next to its rule summary regardless of how complete a given
   * region file's per-entry citations are — see the fallback chain around
   * `regionFallbackSource` below.
   */
  ruleSource?: SourceDoc;
  notes: EligibilityNote[];
  /** Temporal windows (current, expired, or upcoming) relevant to this trip — empty when not applicable. */
  temporalWindows: RelevantTemporalWindow[];
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

export function countryDisplay(code: string): string {
  const flag = Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return `${flag} ${names.of(code) ?? code}`;
  } catch {
    return `${flag} ${code}`;
  }
}

function limitText(limit: StayLimit): string {
  switch (limit.type) {
    case "per_visit":
      return `Up to ${limit.value} ${limit.value === 1 ? limit.unit.replace(/s$/, "") : limit.unit} per visit`;
    case "rolling_window":
      return `${limit.days} days in any ${limit.windowDays}-day period`;
    case "fixed_window_from_entry":
      return `${limit.days} days within ${limit.windowDays} days of first entry`;
    case "calendar_period":
      return `${limit.days} days per ${limit.periodDays}-day period`;
  }
}

function regionRuleText(rule: RegionRule): string {
  switch (rule.type) {
    case "rolling_window":
      return `${rule.allowanceDays} days in any ${rule.windowDays}-day period`;
    case "per_visit":
      return `Up to ${rule.allowanceDays} days per visit`;
    case "fixed_window_from_entry":
      return `${rule.allowanceDays} days within ${rule.windowDays} days of first entry`;
    case "officer_discretion":
      return rule.informationalDays
        ? `Typically up to ${rule.informationalDays} days (officer discretion)`
        : "Length of stay at officer discretion";
  }
}

function conditionText(condition: EntitlementCondition): string {
  switch (condition.type) {
    case "holds_visa_for":
    case "age_range":
    case "carrier":
    case "passport_identifier":
      return condition.description;
    case "purpose":
      return `Permitted purposes: ${condition.allowed.join(", ")}`;
    case "biometric_passport":
      return "Biometric passport required";
    case "entry_port":
      return `Entry via: ${condition.allowed.join(", ")}`;
  }
}

interface EffectiveEligibility {
  /** The rule actually in effect for this entry date — may differ from the raw PassportRule when no temporal window covers it. */
  effectiveRule: PassportRule;
  entitlement?: StayEntitlement;
  /** The specific window that matched, when `entitlement.temporalWindows` is set. */
  activeWindow?: TemporalWindow;
}

/**
 * Resolves what a passport rule actually grants for a trip entering on
 * `entryDate`, evaluating temporal windows via selectEntitlement() rather
 * than always taking entitlements[0]. When no entryDate is known yet (dates
 * not set in the trip form), falls back to the first entitlement — matching
 * the old, date-blind behavior — since there's nothing to evaluate.
 */
function resolveEffectiveEligibility(
  rule: PassportRule,
  entryDate?: string,
): EffectiveEligibility {
  if (rule.access !== "entitled" || !entryDate) {
    return { effectiveRule: rule, entitlement: rule.access === "entitled" ? rule.entitlements[0] : undefined };
  }

  const selection = selectEntitlement(rule, entryDate);

  if (selection) {
    return { effectiveRule: rule, entitlement: selection.selected, activeWindow: selection.activeWindow };
  }

  // No entitlement's temporal windows contain this entry date — the
  // effective access for this trip is visa_required, even though the raw
  // rule is "entitled". Relevant windows (past/future) are still surfaced
  // separately via relevantTemporalWindows(), not reconstructed here.
  return { effectiveRule: { access: "visa_required" } };
}

/**
 * Every TemporalWindow, across all of `rule`'s entitlements, worth showing
 * for a trip entering `tripEntryDate` (and, when known, exiting
 * `tripExitDate`) — the one that actually governs the trip's entry date
 * (flagged `active`), plus any others overlapping a year either side of the
 * trip, for context (an about-to-expire or freshly-announced waiver, say).
 * `active` is keyed off the same selectEntitlement() decision that
 * determines the trip's actual access, not recomputed independently, so
 * only ever one window (at most) comes back active even when an
 * entitlement's sibling windows would otherwise also technically contain
 * the entry date.
 */
export function relevantTemporalWindows(
  rule: PassportRule,
  tripEntryDate: string,
  tripExitDate?: string,
): RelevantTemporalWindow[] {
  if (rule.access !== "entitled") return [];

  const entry = parseDate(tripEntryDate);
  const rangeStart = addYears(entry, -1);
  const rangeEnd = addYears(parseDate(tripExitDate || tripEntryDate), 1);
  const selection = selectEntitlement(rule, tripEntryDate);

  const results: RelevantTemporalWindow[] = [];
  for (const entitlement of rule.entitlements) {
    const windows = entitlement.temporalWindows;
    if (!windows) continue;
    windows.forEach((window, i) => {
      const { start, end } = effectiveWindowRange(windows, i);
      if (end < rangeStart || start > rangeEnd) return;
      results.push({ window, active: window === selection?.activeWindow });
    });
  }

  return results.sort((a, b) => a.window.validUntil.localeCompare(b.window.validUntil));
}

function fmtWindowDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(parseDate(iso));
}

/** Display text for one relevant temporal window, framed relative to the trip's entry date. */
function temporalWindowNote(rel: RelevantTemporalWindow, tripEntryDate: string): { label: string; text: string } {
  const { window, active } = rel;
  const dateSuffix = window.validFrom
    ? `${fmtWindowDate(window.validFrom)} – ${fmtWindowDate(window.validUntil)}`
    : `until ${fmtWindowDate(window.validUntil)}`;
  if (active) {
    return { label: "Temporary waiver", text: `${window.description} is currently in effect (${dateSuffix}).` };
  }
  const isPast = window.validUntil < tripEntryDate;
  return isPast
    ? { label: "Prior waiver period", text: `${window.description} was in effect (${dateSuffix}), before this trip.` }
    : { label: "Upcoming waiver period", text: `${window.description} will be in effect (${dateSuffix}), after this trip.` };
}

/**
 * The citation carried by a raw (un-evaluated) PassportRule — its first
 * entitlement's source when entitled, or the rule's own source when
 * visa_required. Used as the fallback citation when the trip's entry date
 * falls outside every date_range-gated entitlement's window: the effective
 * rule for the trip is a synthesized visa_required with no source of its
 * own (see resolveEffectiveEligibility), but the country the traveller
 * actually holds a passport for still has a specific source page worth
 * linking to — the region's generic overview page is not a substitute.
 */
function rawRuleSource(rule: PassportRule): SourceDoc | undefined {
  if (rule.access === "visa_required") return rule.source;
  if (rule.access === "entitled") return rule.entitlements[0]?.source;
  return undefined;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function computeTravelerEligibility(
  region: VisaRegion,
  travelers: Traveler[],
  travelerIds: string[],
  entryDate?: string,
  exitDate?: string,
): TravelerEligibility[] {
  const regionLabel = VISA_REGION_LABELS[region];
  const regionDef = getRegionDefinition(region);
  const regionRule = regionDef?.rule ?? null;

  return travelerIds.flatMap((tid): TravelerEligibility[] => {
    const traveler = travelers.find((t) => t.id === tid);
    if (!traveler) return [];
    const color = getTravelerColor(travelers.findIndex((t) => t.id === tid));

    if (!traveler.passportCode) {
      return [
        {
          id: tid,
          name: traveler.name,
          color,
          passportCode: null,
          passportDisplay: "Nationality not set",
          regionLabel,
          access: "unknown" as const,
          accessLabel: "Set nationality to see entry requirements",
          ok: false,
          ruleTexts: [],
          notes: [],
          temporalWindows: [],
        },
      ];
    }

    const rawRule = getPassportRule(region, traveler.passportCode);
    const { effectiveRule: rule, entitlement, activeWindow } =
      resolveEffectiveEligibility(rawRule, entryDate);
    const notes: EligibilityNote[] = [];

    const accessLabel =
      rule.access === "free_movement"
        ? "Free movement — no day limit"
        : rule.access === "visa_required"
          ? "Visa Required"
          : "No Visa Required";
    const ok = rule.access !== "visa_required";

    // The rule currently in effect for this trip cites its own source,
    // preferring the specific temporal window's citation (a renewal can
    // cite a different announcement than the entitlement's general source)
    // over the entitlement's own, over the raw rule's. A trip that falls
    // outside every temporal window has no source of its own (the
    // visa_required fallback is synthesized, not the raw rule) — fall back
    // to the raw rule's citation so the link still points at this
    // country's page rather than nothing at all.
    //
    // Every RegionDefinition carries a mandatory `sourceUrl` (the region's
    // own canonical overview page), so when none of the above is set —
    // whether because a rule genuinely has nothing more specific to cite
    // (free_movement) or because a region file hasn't threaded a per-entry
    // source through yet — that region-level URL is the final fallback.
    // This is what guarantees every trip, in every region present and
    // future, always renders a source link next to its rule summary: no
    // region can ship without one, since sourceUrl is a required field.
    const regionFallbackSource: SourceDoc | undefined = regionDef
      ? {
          directUrl: regionDef.sourceUrl,
          parentUrl: regionDef.sourceUrl,
          dateChecked: regionDef.lastVerified,
        }
      : undefined;

    const ruleSource: SourceDoc | undefined =
      activeWindow?.source ?? entitlement?.source ?? rawRuleSource(rawRule) ?? regionFallbackSource;

    // Any visa-required status carries a source link to the country's own
    // entry-requirements page when known, otherwise the region's generic
    // overview page (already folded into ruleSource above).
    if (rule.access === "visa_required" && regionDef) {
      notes.push({
        label: "Visa required",
        text: `A visa must be obtained in advance before travelling to ${regionLabel}.`,
        source: ruleSource,
      });
    }

    // Admittance rule text: prefer the traveler's own entitlement limits,
    // otherwise fall back to the region rule.
    const ruleTexts: string[] =
      entitlement != null
        ? entitlement.limits.map(limitText)
        : regionRule && rule.access !== "visa_required"
          ? [regionRuleText(regionRule)]
          : [];

    // Temporal windows relevant to this trip (current, expired, or
    // upcoming, within a year either side) — each renders as its own note,
    // independently sourced. Only computed once dates are known; a note per
    // window, per design: a waiver's existence near this trip should never
    // be silent.
    const temporalWindows = entryDate ? relevantTemporalWindows(rawRule, entryDate, exitDate) : [];
    for (const rel of temporalWindows) {
      const { label, text } = temporalWindowNote(rel, entryDate!);
      notes.push({ label, text, source: rel.window.source ?? ruleSource });
    }

    // Pre-auth
    let preAuthName: string | undefined;
    if (entitlement?.preAuth) {
      preAuthName = entitlement.preAuth.name;
      notes.push({
        label: "Pre-authorisation",
        text: `${entitlement.preAuth.name} required before travel.`,
      });
      for (const n of entitlement.preAuth.notes ?? []) {
        notes.push({ label: "Pre-authorisation", text: n.text, source: n.source });
      }
    }

    // Conditions
    for (const c of entitlement?.conditions ?? []) {
      notes.push({ label: "Condition", text: conditionText(c) });
    }

    // Entitlement + rule notes
    for (const n of entitlement?.notes ?? []) {
      notes.push({ label: "Note", text: n.text, source: n.source });
    }
    for (const n of rule.notes ?? []) {
      notes.push({ label: "Note", text: n.text, source: n.source });
    }

    return [
      {
        id: tid,
        name: traveler.name,
        color,
        passportCode: traveler.passportCode,
        passportDisplay: countryDisplay(traveler.passportCode),
        regionLabel,
        access: rule.access,
        accessLabel,
        ok,
        ruleTexts,
        preAuthName,
        ruleSource,
        notes,
        temporalWindows,
      },
    ];
  });
}
