/**
 * log.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * The rule-change entry format, with no filesystem access, so the site build
 * (astro/pages/rule-changes.astro) and the app can read the log too. Loading and
 * checking the files is in entries.ts.
 */

import { parse as parseYaml } from "yaml";

export const TRIGGER_TYPES = ["report", "manual", "user-report", "external"] as const;
/** Placeholder the scaffold writes; an entry can't be committed while it's still there. */
export const UNFINISHED = "TODO(entry)";

/** A recorded change to one part of a region's rules. */
export type RuleChange = { region: string; path: string; before: string; after: string };

export type RuleChangeEntry = {
  file: string;
  id: number;
  title: string;
  /** When the app's rules were changed. */
  recorded: string;
  /** When the rule changed in reality, if known. */
  effective?: string;
  /** Written after the fact, from git history, before the log existed. */
  backfilled?: boolean;
  /** The starting point of the log: records the state, changes nothing. */
  baseline?: boolean;
  trigger: { type: (typeof TRIGGER_TYPES)[number]; ref: string };
  /** Playbook links whose content is the evidence: { region: SourceRegions key, link: playbook link id }. */
  evidence: { region: string; link: string }[];
  changes: RuleChange[];
  body: string;
};

const asDate = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : v === undefined ? undefined : String(v));

export function parseEntry(file: string, text: string): RuleChangeEntry {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  if (!m) throw new Error(`${file}: no YAML frontmatter`);
  const f = parseYaml(m[1]) as Record<string, unknown>;
  const trigger = (f.trigger ?? {}) as { type?: string; ref?: unknown };
  return {
    file,
    id: Number(f.id),
    title: String(f.title ?? ""),
    recorded: asDate(f.recorded) ?? "",
    effective: asDate(f.effective),
    backfilled: f.backfilled === true || undefined,
    baseline: f.baseline === true || undefined,
    trigger: { type: trigger.type as RuleChangeEntry["trigger"]["type"], ref: asDate(trigger.ref) ?? "" },
    evidence: (f.evidence ?? []) as RuleChangeEntry["evidence"],
    changes: (f.changes ?? []) as RuleChange[],
    body: m[2],
  };
}

/** Entries from `import.meta.glob(…, { query: "?raw", import: "default", eager: true })`, oldest first. */
export function entriesFromGlob(files: Record<string, string>): RuleChangeEntry[] {
  return Object.entries(files)
    .map(([path, text]) => parseEntry(path.split("/").pop()!, text))
    .sort((a, b) => a.id - b.id);
}

/** How the change was found, for people: "Found by the source check of 2026-10-15". */
export function describeTrigger(entry: RuleChangeEntry): string {
  const { type, ref } = entry.trigger;
  switch (type) {
    case "report":
      return `Found by the source check of ${ref}`;
    case "user-report":
      return "Reported by a user";
    case "external":
      return `From an official publication: ${ref}`;
    case "manual":
      return `Found in review: ${ref}`;
  }
}

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

/** "passportRules.DZ" → "Algeria passports"; region-level fields by name. */
export function describePath(path: string): string {
  const code = /^passportRules\.([A-Z]{2})$/.exec(path)?.[1];
  if (code) return `${countryNames.of(code) ?? code} passports`;
  const fields: Record<string, string> = {
    defaultRule: "All other passports",
    rule: "Stay rule",
    memberStates: "Member states",
    name: "Name",
  };
  return fields[path] ?? path;
}
