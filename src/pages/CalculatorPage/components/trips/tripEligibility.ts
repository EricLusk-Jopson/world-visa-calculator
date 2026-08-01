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
  RuleNote,
} from "@/types";
import { getPassportRule, getRegionDefinition } from "@/data/regions";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";

export interface EligibilityNote {
  /** Category label, e.g. "Pre-authorisation", "Condition", "Note". */
  label: string;
  text: string;
  source?: RuleNote["source"];
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
  notes: EligibilityNote[];
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

/** The first entitlement is the primary case; its limits/conditions/preAuth drive the card. */
function primaryEntitlement(rule: PassportRule): StayEntitlement | undefined {
  return rule.access === "entitled" ? rule.entitlements[0] : undefined;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function computeTravelerEligibility(
  region: VisaRegion,
  travelers: Traveler[],
  travelerIds: string[],
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

    const rule = getPassportRule(region, traveler.passportCode);
    const notes: EligibilityNote[] = [];

    const accessLabel =
      rule.access === "free_movement"
        ? "Free movement — no day limit"
        : rule.access === "visa_required"
          ? "Visa Required"
          : "No Visa Required";
    const ok = rule.access !== "visa_required";

    // Any visa-required status carries a source link to the region's official
    // entry-requirements page.
    if (rule.access === "visa_required" && regionDef) {
      notes.push({
        label: "Visa required",
        text: `A visa must be obtained in advance before travelling to ${regionLabel}.`,
        source: {
          directUrl: regionDef.sourceUrl,
          parentUrl: regionDef.sourceUrl,
          dateChecked: regionDef.lastVerified,
        },
      });
    }

    // Admittance rule text: prefer the traveler's own entitlement limits,
    // otherwise fall back to the region rule.
    const entitlement = primaryEntitlement(rule);
    const ruleTexts: string[] =
      entitlement != null
        ? entitlement.limits.map(limitText)
        : regionRule && rule.access !== "visa_required"
          ? [regionRuleText(regionRule)]
          : [];

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
        notes,
      },
    ];
  });
}
