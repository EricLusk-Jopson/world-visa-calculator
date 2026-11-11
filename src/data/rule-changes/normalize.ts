/**
 * normalize.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * The rules of each region reduced to plain, stable JSON: what the rule-change
 * log treats as "the rules". Like a database schema, the current rules may only
 * differ from the recorded state (state/<region>.json) through a rule-change
 * entry (see README.md in this folder).
 *
 * Kept: everything a traveller's result depends on, notes included.
 * Dropped: `lastVerified`, `lastChanged` and `sourceUrl` (bookkeeping, not rules). Every
 * SourceDoc is reduced to its key (e.g. "Montenegro.DZ"), so a link fix or a
 * dateChecked bump is not a rule change.
 */

import type { PassportRule, RegionDefinition, SourceDoc, StayEntitlement, StayLimit } from "@/types";
import { SourceRegions } from "@/data/sources";
import { sourceRefOf } from "@/data/sourceIndex";
import {
  ALBANIA,
  ARMENIA,
  BELARUS,
  BOSNIA,
  CYPRUS,
  GEORGIA,
  IRELAND,
  KOSOVO,
  MONTENEGRO,
  NORTH_MACEDONIA,
  SCHENGEN,
  SERBIA,
  TURKIYE,
  UNITED_KINGDOM,
} from "@/data/regions";

/** Every region whose rules the log covers, with the SourceRegions key its sources live under. */
export const RULE_REGIONS: { def: RegionDefinition; sourceRegion: keyof typeof SourceRegions }[] = [
  { def: SCHENGEN, sourceRegion: "Schengen" },
  { def: UNITED_KINGDOM, sourceRegion: "UK" },
  { def: IRELAND, sourceRegion: "Ireland" },
  { def: TURKIYE, sourceRegion: "Turkiye" },
  { def: MONTENEGRO, sourceRegion: "Montenegro" },
  { def: SERBIA, sourceRegion: "Serbia" },
  { def: BOSNIA, sourceRegion: "Bosnia" },
  { def: KOSOVO, sourceRegion: "Kosovo" },
  { def: NORTH_MACEDONIA, sourceRegion: "NorthMacedonia" },
  { def: ALBANIA, sourceRegion: "Albania" },
  { def: CYPRUS, sourceRegion: "Cyprus" },
  { def: BELARUS, sourceRegion: "Belarus" },
  { def: GEORGIA, sourceRegion: "Georgia" },
  { def: ARMENIA, sourceRegion: "Armenia" },
];

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** "Montenegro.DZ" for MontenegroSources.DZ, by object identity. */
export function sourceKeyOf(doc: SourceDoc): string | undefined {
  const ref = sourceRefOf(doc);
  return ref && `${ref.region}.${ref.key}`;
}

const isSourceDoc = (v: object): v is SourceDoc => "direct" in v && "parent" in v && "dateChecked" in v;

/** Plain JSON with sorted object keys, SourceDocs reduced to their key. */
function canonical(value: unknown): Json {
  if (value === null || typeof value !== "object") return (value ?? null) as Json;
  if (Array.isArray(value)) return value.map(canonical);
  if (isSourceDoc(value)) return { $source: sourceKeyOf(value) ?? value.direct.url };
  const out: { [key: string]: Json } = {};
  for (const key of Object.keys(value).sort()) {
    const v = (value as Record<string, unknown>)[key];
    if (v !== undefined) out[key] = canonical(v);
  }
  return out;
}

export type RegionState = {
  code: string;
  name: string;
  memberStates: string[];
  rule: Json;
  defaultRule: Json;
  passportRules: Record<string, Json>;
};

export function normalizeRegion(def: RegionDefinition): RegionState {
  const passportRules: Record<string, Json> = {};
  for (const code of Object.keys(def.passportRules).sort()) passportRules[code] = canonical(def.passportRules[code]);
  return {
    code: def.code,
    name: def.name,
    memberStates: [...def.memberStates].sort(),
    rule: canonical(def.rule),
    defaultRule: canonical(def.defaultRule),
    passportRules,
  };
}

function describeLimit(l: StayLimit): string {
  switch (l.type) {
    case "per_visit":
      return `${l.value} ${l.unit} per visit`;
    case "rolling_window":
      return `${l.days}/${l.windowDays} rolling`;
    case "fixed_window_from_entry":
      return `${l.days} days within ${l.windowDays} from entry`;
    case "calendar_period":
      return `${l.days} days per ${l.periodDays}-day calendar period`;
  }
}

function describeEntitlement(e: StayEntitlement): string {
  const parts = [e.limits.map(describeLimit).join(" + ")];
  if (e.conditions?.length) parts.push(`${e.conditions.length} condition${e.conditions.length === 1 ? "" : "s"}`);
  if (e.temporalWindows?.length) parts.push(`until ${e.temporalWindows[e.temporalWindows.length - 1].validUntil}`);
  if (e.preAuth) parts.push(e.preAuth.type);
  return parts.join(", ");
}

/** One line for a passport rule, e.g. "entitled: 90/180 rolling, ETIAS · 1 note". */
export function summarizeRule(rule: PassportRule): string {
  let text: string;
  if (rule.access === "free_movement") text = "free movement";
  else if (rule.access === "visa_required") text = "visa required";
  else text = `entitled: ${rule.entitlements.map(describeEntitlement).join(" | else ")}`;
  const notes = (rule.notes?.length ?? 0) + (rule.access === "entitled" ? rule.entitlements.reduce((n, e) => n + (e.notes?.length ?? 0), 0) : 0);
  return notes ? `${text} · ${notes} note${notes === 1 ? "" : "s"}` : text;
}

import type { RuleChange } from "./log";
export type { RuleChange };

/**
 * What differs between a recorded state and the current rules, as one change
 * per region-level field or passport. Summaries come from the current
 * definition where it has the rule and from the recorded JSON otherwise.
 */
export function diffRegion(before: RegionState | undefined, def: RegionDefinition): RuleChange[] {
  const after = normalizeRegion(def);
  const region = def.code;
  const changes: RuleChange[] = [];
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const describeJson = (v: Json | undefined) => (v === undefined ? "(not listed)" : summarizeJson(v));

  if (!before) return [{ region, path: "(region)", before: "(not tracked)", after: `${Object.keys(after.passportRules).length} passport rules` }];
  for (const field of ["name", "memberStates", "rule", "defaultRule"] as const) {
    if (!same(before[field], after[field])) {
      changes.push({ region, path: field, before: describeJson(before[field] as Json), after: describeJson(after[field] as Json) });
    }
  }
  const codes = [...new Set([...Object.keys(before.passportRules), ...Object.keys(after.passportRules)])].sort();
  for (const code of codes) {
    const b = before.passportRules[code];
    const a = after.passportRules[code];
    if (same(b, a)) continue;
    const beforeText = describeJson(b);
    const afterText = a === undefined ? "(not listed: default rule)" : summarizeRule(def.passportRules[code]);
    changes.push({
      region,
      path: `passportRules.${code}`,
      before: b === undefined ? "(not listed: default rule)" : beforeText,
      after: afterText === beforeText ? `${afterText} (details changed)` : afterText,
    });
  }
  return changes;
}

/** summarizeRule for a recorded (JSON) rule; falls back to compact JSON for non-rule fields. */
function summarizeJson(v: Json): string {
  if (v && typeof v === "object" && !Array.isArray(v) && typeof v.access === "string") {
    return summarizeRule(v as unknown as PassportRule);
  }
  const text = JSON.stringify(v);
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}
