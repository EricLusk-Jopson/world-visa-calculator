/**
 * entries.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Reads and checks the rule-change log (entries/NNNN-YYYY-MM-DD-slug.md) and
 * the recorded rule state (state/<region>.json). Node-only; see README.md in
 * this folder for the format and workflow.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadPlaybooks } from "@/data/playbooks";
import { SourceRegions } from "@/data/sources";
import type { SourceDoc } from "@/types";
import { parseEntry, TRIGGER_TYPES, UNFINISHED, type RuleChangeEntry } from "./log";
import { RULE_REGIONS, normalizeRegion, type RegionState } from "./normalize";

export { parseEntry, TRIGGER_TYPES, UNFINISHED, type RuleChangeEntry };

export const RULE_CHANGES_DIR = import.meta.dirname;
export const ENTRIES_DIR = join(RULE_CHANGES_DIR, "entries");
export const STATE_DIR = join(RULE_CHANGES_DIR, "state");
export const REPORTS_DIR = join(RULE_CHANGES_DIR, "..", "..", "..", "pipeline", "reports");

export function loadEntries(dir = ENTRIES_DIR): RuleChangeEntry[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^\d{4}-\d{4}-\d{2}-\d{2}-[a-z0-9-]+\.md$/.test(f))
    .sort()
    .map((f) => parseEntry(f, readFileSync(join(dir, f), "utf-8")));
}

export function readState(code: string, dir = STATE_DIR): RegionState | undefined {
  const path = join(dir, `${code}.json`);
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf-8")) as RegionState) : undefined;
}

export function writeState(state: RegionState, dir = STATE_DIR): void {
  writeFileSync(join(dir, `${state.code}.json`), `${JSON.stringify(state, null, 2)}\n`);
}

/** Problems with the log itself; empty when every entry is complete and consistent. */
export function validateEntries(entries: RuleChangeEntry[], reportsDir = REPORTS_DIR): string[] {
  const errors: string[] = [];
  const regionCodes = new Set(RULE_REGIONS.map((r) => r.def.code));
  const playbookLinks = new Map(loadPlaybooks().map((p) => [p.region, new Set(p.links.map((l) => l.id))]));
  const isDate = (s: string | undefined) => s !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(s);

  entries.forEach((e, i) => {
    const at = e.file;
    const [num, y, mo, d] = e.file.split("-");
    if (e.id !== Number(num)) errors.push(`${at}: id ${e.id} doesn't match the file number ${num}`);
    if (e.id !== i + 1) errors.push(`${at}: ids must run 1, 2, 3… with no gaps (expected ${i + 1})`);
    if (!e.title) errors.push(`${at}: missing title`);
    if (!isDate(e.recorded)) errors.push(`${at}: recorded must be YYYY-MM-DD`);
    else if (e.recorded !== `${y}-${mo}-${d}`) errors.push(`${at}: recorded ${e.recorded} doesn't match the file date`);
    if (e.effective !== undefined && !isDate(e.effective)) errors.push(`${at}: effective must be YYYY-MM-DD`);
    if (i > 0 && e.recorded < entries[i - 1].recorded) errors.push(`${at}: recorded earlier than the entry before it`);
    if (!TRIGGER_TYPES.includes(e.trigger.type)) errors.push(`${at}: trigger.type must be one of ${TRIGGER_TYPES.join(", ")}`);
    if (!e.trigger.ref) errors.push(`${at}: trigger.ref is required (a report date, a URL, or a short description)`);
    if (e.trigger.type === "report" && !existsSync(join(reportsDir, `${e.trigger.ref}.json`))) {
      errors.push(`${at}: trigger.ref ${e.trigger.ref} is not a report in pipeline/reports/`);
    }
    for (const ev of e.evidence) {
      const links = playbookLinks.get(ev.region);
      if (!links) errors.push(`${at}: evidence region "${ev.region}" has no playbook`);
      else if (!links.has(ev.link)) errors.push(`${at}: evidence link "${ev.link}" is not in ${ev.region}'s playbook`);
    }
    for (const c of e.changes) {
      if (!regionCodes.has(c.region)) errors.push(`${at}: change region "${c.region}" is not a region code`);
      if (!c.path || c.before === undefined || c.after === undefined) errors.push(`${at}: each change needs path, before and after`);
    }
    if (!e.baseline && e.changes.length === 0) errors.push(`${at}: an entry with no changes (use npm run rules:new after editing the rules)`);
    if (!e.baseline && !e.backfilled && e.evidence.length === 0 && e.trigger.type !== "external") {
      errors.push(`${at}: name the playbook link(s) that evidence the change`);
    }
    if (e.body.includes(UNFINISHED)) errors.push(`${at}: still has ${UNFINISHED} placeholders`);
  });
  return errors;
}

/** Regions whose current rules differ from the recorded state. */
export function unrecordedRegions(dir = STATE_DIR): string[] {
  return RULE_REGIONS.filter(({ def }) => JSON.stringify(normalizeRegion(def)) !== JSON.stringify(readState(def.code, dir))).map(
    ({ def }) => def.code,
  );
}

/**
 * The latest entry (by id) that changed each region. Backfilled entries count
 * unless `recordedOnly` (for lastVerified, which predates the log).
 */
export function lastChangePerRegion(entries: RuleChangeEntry[], recordedOnly = false): Map<string, RuleChangeEntry> {
  const out = new Map<string, RuleChangeEntry>();
  for (const e of entries) {
    if (e.baseline || (recordedOnly && e.backfilled)) continue;
    for (const c of e.changes) out.set(c.region, e);
  }
  return out;
}

export const SUMMARY_PATH = join(RULE_CHANGES_DIR, "summary.json");

type RuleRef = { region: string; path: string; entry: RuleChangeEntry };

/** The latest entry (by id) that changed each rule ("montenegro passportRules.DZ"), baseline aside. */
export function lastChangePerRule(entries: RuleChangeEntry[]): RuleRef[] {
  const out = new Map<string, RuleRef>();
  for (const e of entries) {
    if (e.baseline) continue;
    for (const c of e.changes) out.set(`${c.region} ${c.path}`, { region: c.region, path: c.path, entry: e });
  }
  return [...out.values()];
}

/** SourceDoc keys ("Montenegro.DZ") the rule at `path` cites in its recorded state, notes included. */
export function sourcesOfRule(region: string, path: string, dir = STATE_DIR): string[] {
  const state = readState(region, dir);
  if (!state) return [];
  const passport = /^passportRules\.(.+)$/.exec(path)?.[1];
  const value: unknown = passport ? state.passportRules[passport] : (state as Record<string, unknown>)[path];
  const found = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      const src = (v as { $source?: unknown }).$source;
      if (typeof src === "string") found.add(src);
      else Object.values(v).forEach(walk);
    }
  };
  walk(value);
  return [...found];
}

/**
 * Rules whose cited sources say they were verified before the rule last
 * changed. A recorded change means the source was checked that day (the
 * workflow requires it), so its dateChecked must be on or after it.
 */
export function staleVerifiedDates(entries: RuleChangeEntry[]): string[] {
  const docs = new Map<string, SourceDoc>();
  for (const [region, { sources }] of Object.entries(SourceRegions)) {
    for (const [key, doc] of Object.entries(sources as Record<string, SourceDoc>)) docs.set(`${region}.${key}`, doc);
  }
  const out: string[] = [];
  for (const { region, path, entry } of lastChangePerRule(entries)) {
    // A backfilled change may have been a reinterpretation, not a re-read of the source.
    if (entry.backfilled) continue;
    for (const key of sourcesOfRule(region, path)) {
      const doc = docs.get(key);
      if (doc && doc.dateChecked < entry.recorded) {
        out.push(`${key}: dateChecked ${doc.dateChecked} is before entry ${entry.id} (${entry.recorded}), which changed ${region} ${path}`);
      }
    }
  }
  return [...new Set(out)];
}

/** What the app shows about the log: per cited source, the latest entry that changed a rule citing it. */
export type RuleChangeSummary = { bySource: Record<string, { id: number; recorded: string }> };

/** summary.json: small enough to ship to the browser, unlike the entries themselves. */
export function summarizeLog(entries: RuleChangeEntry[]): RuleChangeSummary {
  const bySource: RuleChangeSummary["bySource"] = {};
  for (const { region, path, entry } of lastChangePerRule(entries)) {
    for (const key of sourcesOfRule(region, path)) {
      if (!bySource[key] || bySource[key].id < entry.id) bySource[key] = { id: entry.id, recorded: entry.recorded };
    }
  }
  return { bySource: Object.fromEntries(Object.keys(bySource).sort().map((k) => [k, bySource[k]])) };
}

export function writeSummary(entries: RuleChangeEntry[]): void {
  writeFileSync(SUMMARY_PATH, `${JSON.stringify(summarizeLog(entries), null, 2)}\n`);
}
