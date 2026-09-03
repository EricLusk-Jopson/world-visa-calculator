/**
 * Per-traveler entry-eligibility data for the mobile eligibility frame.
 *
 * Flattens a traveler's PassportRule + the region rule into display-ready
 * fields: access status, admittance rule text, pre-auth, and the notes
 * (pre-auth requirements, entitlement conditions, and rule notes) worth
 * surfacing per traveler.
 */

import { VisaRegion, VISA_REGION_LABELS, isDateRangeCondition } from "@/types";
import type {
  Traveler,
  PassportRule,
  RegionRule,
  StayLimit,
  StayEntitlement,
  EntitlementCondition,
  DateRangeCondition,
  RuleNote,
  SourceDoc,
} from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { selectEntitlement } from "@/features/calculator/utils/stayCalculator";

export interface EligibilityNote {
  /** Category label, e.g. "Pre-authorisation", "Condition", "Note". */
  label: string;
  text: string;
  source?: RuleNote["source"];
}

/**
 * Present whenever this passport rule has a date_range-gated entitlement for
 * the destination — whether it's currently the one applying (`active: true`,
 * e.g. Kazakhstan mid-season) or currently dormant while the base rule
 * applies instead (`active: false`, e.g. Kazakhstan outside the seasonal
 * window — base is visa_required, but the exception is still worth showing).
 * `other*` always describes the side NOT already reflected in the top-level
 * `access`/`accessLabel`/`ruleTexts` fields, so the UI can show both sides
 * without duplicating whichever one is already "live".
 */
export interface TemporalException {
  active: boolean;
  /** Human-readable date range, e.g. "1 May – 1 Oct 2026". */
  dateRangeText: string;
  otherAccessLabel: string;
  otherRuleTexts: string[];
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
   * StayEntitlement.source). Falls back to the raw passport rule's own
   * citation (rather than the region's generic overview page) even when the
   * effective rule for this trip is a synthesized visa_required fallback —
   * see resolveEffectiveEligibility.
   */
  ruleSource?: SourceDoc;
  notes: EligibilityNote[];
  /** Set when this rule has a temporary (date_range-gated) entitlement relevant to the trip's entry date. */
  temporalException?: TemporalException;
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
    case "date_range":
      return condition.description;
    case "purpose":
      return `Permitted purposes: ${condition.allowed.join(", ")}`;
    case "biometric_passport":
      return "Biometric passport required";
    case "entry_port":
      return `Entry via: ${condition.allowed.join(", ")}`;
  }
}

function dateRangeConditionOf(entitlement: StayEntitlement): DateRangeCondition | undefined {
  return entitlement.conditions?.find(isDateRangeCondition);
}

interface EffectiveEligibility {
  /** The rule actually in effect for this entry date — may differ from the raw PassportRule when a date_range entitlement doesn't match today. */
  effectiveRule: PassportRule;
  entitlement?: StayEntitlement;
  temporalException?: TemporalException;
}

/**
 * Resolves what a passport rule actually grants for a trip entering on
 * `entryDate`, evaluating date_range conditions via selectEntitlement()
 * rather than always taking entitlements[0]. When no entryDate is known yet
 * (dates not set in the trip form), falls back to the first entitlement —
 * matching the old, date-blind behavior — since there's nothing to evaluate.
 */
function resolveEffectiveEligibility(
  rule: PassportRule,
  entryDate?: string,
): EffectiveEligibility {
  if (rule.access !== "entitled" || !entryDate) {
    return { effectiveRule: rule, entitlement: rule.access === "entitled" ? rule.entitlements[0] : undefined };
  }

  const dateGated = rule.entitlements.filter(
    (e) => e.conditions?.some(isDateRangeCondition),
  );

  const selection = selectEntitlement(rule, entryDate);

  if (selection) {
    if (!selection.isOverride) {
      // Ordinary match — no temporal exception in play.
      return { effectiveRule: rule, entitlement: selection.selected };
    }

    // The date_range entitlement is the one currently applying — surface
    // what would apply instead outside its window.
    const base = selection.baseEntitlement;
    const condition = dateRangeConditionOf(selection.selected);
    return {
      effectiveRule: rule,
      entitlement: selection.selected,
      temporalException: {
        active: true,
        dateRangeText: condition?.description ?? "",
        otherAccessLabel: base ? "No Visa Required" : "Visa Required",
        otherRuleTexts: base ? base.limits.map(limitText) : [],
      },
    };
  }

  // No entitlement's date_range matches today — the effective access for
  // this trip is visa_required, even though the raw rule is "entitled".
  const example = dateGated[0];
  const condition = example && dateRangeConditionOf(example);
  return {
    effectiveRule: { access: "visa_required" },
    entitlement: undefined,
    temporalException:
      example && condition
        ? {
            active: false,
            dateRangeText: condition.description,
            otherAccessLabel: "No Visa Required",
            otherRuleTexts: dateGated.flatMap((e) => e.limits.map(limitText)),
          }
        : undefined,
  };
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
        },
      ];
    }

    const rawRule = getPassportRule(region, traveler.passportCode);
    const { effectiveRule: rule, entitlement, temporalException } =
      resolveEffectiveEligibility(rawRule, entryDate);
    const notes: EligibilityNote[] = [];

    const accessLabel =
      rule.access === "free_movement"
        ? "Free movement — no day limit"
        : rule.access === "visa_required"
          ? "Visa Required"
          : "No Visa Required";
    const ok = rule.access !== "visa_required";

    // The rule currently in effect for this trip cites its own source when
    // it has one (an entitlement, or a visa_required rule with a specific
    // source page). A date_range fallback to visa_required has no source of
    // its own (it's synthesized, not the raw rule) — fall back to the raw
    // rule's citation so the link still points at this country's page
    // rather than nothing at all.
    const ruleSource: SourceDoc | undefined = entitlement?.source ?? rawRuleSource(rawRule);

    // Any visa-required status carries a source link to the country's own
    // entry-requirements page when known, otherwise the region's generic
    // overview page.
    if (rule.access === "visa_required" && regionDef) {
      notes.push({
        label: "Visa required",
        text: `A visa must be obtained in advance before travelling to ${regionLabel}.`,
        source: ruleSource ?? {
          directUrl: regionDef.sourceUrl,
          parentUrl: regionDef.sourceUrl,
          dateChecked: regionDef.lastVerified,
        },
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

    // Temporal exception — always carries a note, per design: a seasonal
    // waiver's existence (active or not) should never be silent.
    if (temporalException) {
      notes.push({
        label: temporalException.active ? "Temporary waiver" : "Seasonal exception",
        text: temporalException.active
          ? `A temporary waiver is currently in effect (${temporalException.dateRangeText}). ` +
            `Outside this window: ${temporalException.otherAccessLabel}` +
            (temporalException.otherRuleTexts.length
              ? ` — ${temporalException.otherRuleTexts.join(", ")}.`
              : ".")
          : `A seasonal exception applies ${temporalException.dateRangeText}: ` +
            `${temporalException.otherAccessLabel}` +
            (temporalException.otherRuleTexts.length
              ? ` — ${temporalException.otherRuleTexts.join(", ")}`
              : "") +
            ` during that window. Outside it, the rule above applies.`,
      });
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
        temporalException,
      },
    ];
  });
}
