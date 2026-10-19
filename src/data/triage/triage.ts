/**
 * triage.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Triage records for source-check reports, and the statistics that keep the
 * playbooks' diff-confidence priors grounded in what actually happened.
 *
 * pipeline/triage/<report date>.yml holds one verdict per diff that report
 * flagged: was it a rule change (and which log entry recorded it), noise (of
 * what kind), or still unclear. Joined with the reports and the rule-change
 * log, that gives, per playbook link:
 *   - diffs flagged, and how many were rule changes vs noise
 *   - rule changes no diff caught (found by hand, by a user, or in the news)
 * written to docs/sources/STATS.md by `npm run stats`. Node-only.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Report } from "../../../pipeline/src/report";
import { entryForReportUrl, type Playbook, type PlaybookLink } from "@/data/playbooks";
import type { RuleChangeEntry } from "@/data/rule-changes/log";

export const TRIAGE_DIR = join(import.meta.dirname, "..", "..", "..", "pipeline", "triage");
export const REPORTS_DIR = join(import.meta.dirname, "..", "..", "..", "pipeline", "reports");

export const VERDICTS = ["rule-change", "no-rule-change", "unclear"] as const;
export const NOISE = ["layout", "contact-info", "date-stamp", "url-format", "wording", "not-modelled", "pipeline", "other"] as const;
const CHANGED = new Set(["text-changed", "links-changed", "both-changed"]);

export type TriageItem = {
  /** SourceRegions key, as in the report. */
  region: string;
  /** The rule check's `url`, as in the report. */
  url: string;
  verdict: (typeof VERDICTS)[number];
  /** For no-rule-change: what the diff was instead. */
  noise?: (typeof NOISE)[number];
  /** For rule-change: the rule-change log entry id. */
  ruleChange?: number;
  /** Who reached the verdict. */
  by: "human" | "ai-assisted";
  notes?: string;
};

export type TriageFile = { file: string; report: string; items: TriageItem[] };

export type Flagged = { report: string; region: string; url: string; status: string; keys: string[] };

/** Every dated report (YYYY-MM-DD.json), by date. */
export function loadReports(dir = REPORTS_DIR): Map<string, Report> {
  const out = new Map<string, Report>();
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir).filter((x) => /^\d{4}-\d{2}-\d{2}\.json$/.test(x)).sort()) {
    out.set(f.slice(0, 10), JSON.parse(readFileSync(join(dir, f), "utf-8")) as Report);
  }
  return out;
}

/** The diffs a report flagged as changed. */
export function flaggedIn(date: string, report: Report): Flagged[] {
  return report.regions.flatMap((r) =>
    r.ruleChecks.filter((c) => CHANGED.has(c.status)).map((c) => ({ report: date, region: r.region, url: c.url, status: c.status, keys: c.keys })),
  );
}

export function loadTriage(dir = TRIAGE_DIR): TriageFile[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.yml$/.test(f))
    .sort()
    .map((file) => {
      const y = (parseYaml(readFileSync(join(dir, file), "utf-8")) ?? {}) as { report?: unknown; items?: TriageItem[] };
      const report = y.report instanceof Date ? y.report.toISOString().slice(0, 10) : String(y.report ?? "");
      return { file, report, items: y.items ?? [] };
    });
}

/** Problems with the triage files; empty when every verdict matches a flagged diff and is complete. */
export function validateTriage(triage: TriageFile[], reports: Map<string, Report>, entries: RuleChangeEntry[]): string[] {
  const errors: string[] = [];
  const entryIds = new Set(entries.map((e) => e.id));
  for (const t of triage) {
    if (t.file !== `${t.report}.yml`) errors.push(`${t.file}: report ${t.report} doesn't match the file name`);
    const report = reports.get(t.report);
    if (!report) {
      errors.push(`${t.file}: no report pipeline/reports/${t.report}.json`);
      continue;
    }
    const flagged = new Set(flaggedIn(t.report, report).map((f) => `${f.region} ${f.url}`));
    const seen = new Set<string>();
    for (const item of t.items) {
      const at = `${t.file} ${item.region} ${item.url}`;
      const key = `${item.region} ${item.url}`;
      if (!flagged.has(key)) errors.push(`${at}: not a diff that report flagged`);
      if (seen.has(key)) errors.push(`${at}: triaged twice`);
      seen.add(key);
      if (!VERDICTS.includes(item.verdict)) errors.push(`${at}: verdict must be one of ${VERDICTS.join(", ")}`);
      if (item.verdict === "no-rule-change" && !NOISE.includes(item.noise as (typeof NOISE)[number])) {
        errors.push(`${at}: a no-rule-change verdict needs noise: one of ${NOISE.join(", ")}`);
      }
      if (item.verdict === "rule-change" && !entryIds.has(Number(item.ruleChange))) {
        errors.push(`${at}: a rule-change verdict needs ruleChange: the id of its rule-change log entry`);
      }
      if (item.by !== "human" && item.by !== "ai-assisted") errors.push(`${at}: by must be human or ai-assisted`);
    }
  }
  return errors;
}

type LinkStats = {
  region: string;
  link: PlaybookLink;
  flagged: number;
  ruleChange: number;
  noise: number;
  unclear: number;
  untriaged: number;
  /** Rule changes a diff of this link caught (report-triggered entries citing it). */
  caught: number;
  /** Rule changes on this diffed link that no report caught (found some other way). */
  missed: number;
  /** Rule changes on a link nothing diffs (found by people, as expected). */
  humanFound: number;
};

export type Stats = {
  reports: string[];
  links: LinkStats[];
  noiseKinds: Map<string, number>;
  untriaged: Flagged[];
  unmatched: Flagged[];
  entriesByTrigger: Map<string, number>;
};

export function computeStats(playbooks: Playbook[], reports: Map<string, Report>, triage: TriageFile[], entries: RuleChangeEntry[]): Stats {
  const links: LinkStats[] = [];
  const byKey = new Map<string, LinkStats>();
  for (const pb of playbooks) {
    for (const link of pb.links) {
      const s: LinkStats = { region: pb.region, link, flagged: 0, ruleChange: 0, noise: 0, unclear: 0, untriaged: 0, caught: 0, missed: 0, humanFound: 0 };
      links.push(s);
      byKey.set(`${pb.region}:${link.id}`, s);
    }
  }
  const playbookByRegion = new Map(playbooks.map((p) => [p.region, p]));
  const verdicts = new Map(triage.flatMap((t) => t.items.map((i) => [`${t.report} ${i.region} ${i.url}`, i] as const)));
  const noiseKinds = new Map<string, number>();
  const untriaged: Flagged[] = [];
  const unmatched: Flagged[] = [];

  for (const [date, report] of reports) {
    for (const f of flaggedIn(date, report)) {
      const pb = playbookByRegion.get(f.region);
      const link = pb && entryForReportUrl(pb.links, f.url);
      const s = link && byKey.get(`${f.region}:${link.id}`);
      if (!s) {
        unmatched.push(f);
        continue;
      }
      s.flagged++;
      const v = verdicts.get(`${date} ${f.region} ${f.url}`);
      if (!v) {
        s.untriaged++;
        untriaged.push(f);
      } else if (v.verdict === "rule-change") s.ruleChange++;
      else if (v.verdict === "unclear") s.unclear++;
      else {
        s.noise++;
        noiseKinds.set(v.noise ?? "other", (noiseKinds.get(v.noise ?? "other") ?? 0) + 1);
      }
    }
  }

  const entriesByTrigger = new Map<string, number>();
  for (const e of entries) {
    if (e.baseline) continue;
    entriesByTrigger.set(e.trigger.type, (entriesByTrigger.get(e.trigger.type) ?? 0) + 1);
    for (const ev of e.evidence) {
      const s = byKey.get(`${ev.region}:${ev.link}`);
      if (!s) continue;
      if (e.trigger.type === "report") s.caught++;
      else if (s.link.machineCheck === "link-only") s.humanFound++;
      // A change made before the link was diffed can't count against the diff.
      else if (!e.backfilled) s.missed++;
    }
  }
  return { reports: [...reports.keys()], links, noiseKinds, untriaged, unmatched, entriesByTrigger };
}

const pct = (n: number, d: number) => (d === 0 ? "–" : `${Math.round((100 * n) / d)}% (${n}/${d})`);

export function renderStats(stats: Stats): string {
  const out: string[] = [
    "# Source-check statistics",
    "",
    "Generated by `npm run stats` from `pipeline/reports/`, `pipeline/triage/` and the rule-change log; don't edit by hand.",
    "",
    `Reports counted: ${stats.reports.length}${stats.reports.length ? ` (${stats.reports[0]} to ${stats.reports[stats.reports.length - 1]})` : ""}.`,
    "",
    "- **Precision:** of the triaged diffs on a link, the share that were rule changes.",
    "- **Recall:** of the rule changes on a link, the share a report caught. A change found another way on a diffed link counts as missed. Backfilled entries from before the link was diffed don't count against it.",
    "",
  ];
  const t = stats.links.reduce(
    (a, s) => ({ flagged: a.flagged + s.flagged, rc: a.rc + s.ruleChange, noise: a.noise + s.noise, unclear: a.unclear + s.unclear, untriaged: a.untriaged + s.untriaged, caught: a.caught + s.caught, missed: a.missed + s.missed }),
    { flagged: 0, rc: 0, noise: 0, unclear: 0, untriaged: 0, caught: 0, missed: 0 },
  );
  out.push(
    "## Overall",
    "",
    `- Diffs flagged: ${t.flagged}: ${t.rc} rule change, ${t.noise} noise, ${t.unclear} unclear, ${t.untriaged} untriaged`,
    `- Precision: ${pct(t.rc, t.rc + t.noise)}`,
    `- Rule changes caught by a report: ${t.caught}; missed on diffed links: ${t.missed}; recall: ${pct(t.caught, t.caught + t.missed)}`,
    `- Rule-change log entries by trigger: ${[...stats.entriesByTrigger].map(([k, n]) => `${k} ${n}`).join(", ") || "none"}`,
    "",
  );
  if (stats.untriaged.length > 0) {
    out.push("## Untriaged diffs", "", "Run `/triage-report <date>` in Claude Code.", "");
    for (const f of stats.untriaged) out.push(`- ${f.report} · ${f.region} · ${f.status} · ${f.url}`);
    out.push("");
  }
  if (stats.unmatched.length > 0) {
    out.push("## Diffs with no playbook link", "", "Fix the playbook's URLs.", "");
    for (const f of stats.unmatched) out.push(`- ${f.report} · ${f.region} · ${f.url}`);
    out.push("");
  }
  out.push(
    "## By link",
    "",
    "Diffed links, plus any link with a recorded rule change. Declared is the playbook's prior; the rest is observed.",
    "",
    "| Region | Link | Declared | Flagged | Rule change | Noise | Unclear | Untriaged | Precision | Caught | Missed | Found by hand | Recall |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|",
  );
  for (const s of stats.links) {
    if (s.link.machineCheck === "link-only" && s.caught + s.missed + s.humanFound === 0) continue;
    out.push(
      `| ${s.region} | ${s.link.id} | ${s.link.diffConfidence} | ${s.flagged} | ${s.ruleChange} | ${s.noise} | ${s.unclear} | ${s.untriaged} | ${pct(s.ruleChange, s.ruleChange + s.noise)} | ${s.caught} | ${s.missed} | ${s.humanFound} | ${pct(s.caught, s.caught + s.missed)} |`,
    );
  }
  out.push("", "## Noise by kind", "");
  if (stats.noiseKinds.size === 0) out.push("None recorded yet.");
  for (const [k, n] of [...stats.noiseKinds].sort((a, b) => b[1] - a[1])) out.push(`- ${k}: ${n}`);
  out.push("");
  return out.join("\n");
}
