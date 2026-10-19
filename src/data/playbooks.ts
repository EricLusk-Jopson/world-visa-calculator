/**
 * playbooks.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Loads and checks the source playbooks in docs/sources/: one Markdown file
 * per region whose YAML frontmatter describes every distinct link that
 * region's SourceDocs cite (see docs/sources/README.md for the fields).
 *
 * Node-only (reads the filesystem). Used by sourcePlaybooks.test.ts, and by
 * tooling that needs a link's documented category or confidence. The app
 * never imports it.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { SourceDoc, SourceLink, SourceRegion } from "@/types";

export const CATEGORIES = ["html-page", "document", "interactive", "index", "machine-copy"] as const;
export const REVISIONS = ["in-place", "consolidated-versions", "separate-amendments", "replaced-file", "regenerated"] as const;
export const ACCESS = ["open", "script-rendered", "bot-protected"] as const;
export const MACHINE_CHECKS = ["diff", "resolver", "link-only"] as const;
export const CONFIDENCE = ["high", "medium", "low", "none"] as const;
export const HUMAN_CHECKS = ["on-diff", "periodic", "manual-only"] as const;

export type PlaybookLink = {
  /** Unique within the file; the body has a `## <id>` section for it. */
  id: string;
  /** Exactly one of `url` and `urlPrefix`. */
  url?: string;
  /** Covers every cited URL starting with it that no `url` entry claims (per-country pages). */
  urlPrefix?: string;
  /** Does a rule in the app rest on what this link says? */
  loadBearing: boolean;
  category: (typeof CATEGORIES)[number];
  /** How the source publishes a change. */
  revisions: (typeof REVISIONS)[number];
  access: (typeof ACCESS)[number];
  /** What the pipeline does with it. Must match sources.ts (checked). */
  machineCheck: (typeof MACHINE_CHECKS)[number];
  /** Declared prior: how likely a rule change here shows up as a diff. Observed figures come from the triage stats. */
  diffConfidence: (typeof CONFIDENCE)[number];
  /** When a person has to look at it. */
  humanCheck: (typeof HUMAN_CHECKS)[number];
  /**
   * For a page the pipeline doesn't diff itself: the id of the link whose
   * diff covers its content (a resolver or machine copy).
   */
  checkedVia?: string;
};

export type Playbook = {
  file: string;
  /** Key in SourceRegions. */
  region: string;
  /** Date the playbook was last checked against the live sources. */
  lastReviewed: string;
  links: PlaybookLink[];
  body: string;
};

export const PLAYBOOK_DIR = join(import.meta.dirname, "..", "..", "docs", "sources");

/** Every region playbook (README.md and STATS.md excluded). */
export function loadPlaybooks(dir = PLAYBOOK_DIR): Playbook[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f === f.toLowerCase())
    .sort()
    .map((file) => parsePlaybook(file, readFileSync(join(dir, file), "utf-8")));
}

export function parsePlaybook(file: string, text: string): Playbook {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(text);
  if (!m) throw new Error(`${file}: no YAML frontmatter`);
  const front = parseYaml(m[1]) as Omit<Partial<Playbook>, "lastReviewed"> & { lastReviewed?: unknown };
  return {
    file,
    region: String(front.region ?? ""),
    // YAML reads an unquoted date as a Date
    lastReviewed: front.lastReviewed instanceof Date ? front.lastReviewed.toISOString().slice(0, 10) : String(front.lastReviewed ?? ""),
    links: (front.links ?? []) as PlaybookLink[],
    body: m[2],
  };
}

type CitedLink = { url: string; links: { key: string; path: string; link: SourceLink }[] };

/** Every distinct URL a region's SourceDocs cite, alternates included, with where it's cited. */
export function citedLinks(sources: Record<string, SourceDoc>): Map<string, CitedLink> {
  const byUrl = new Map<string, CitedLink>();
  for (const [key, doc] of Object.entries(sources)) {
    const walk = (path: string, link: SourceLink) => {
      if (!byUrl.has(link.url)) byUrl.set(link.url, { url: link.url, links: [] });
      byUrl.get(link.url)!.links.push({ key, path, link });
      if (link.alternate) walk(`${path}.alternate`, link.alternate);
    };
    walk("direct", doc.direct);
    walk("parent", doc.parent);
  }
  return byUrl;
}

/** The entry that documents `url`: an exact `url` entry, else the longest matching `urlPrefix`. */
export function entryFor(links: PlaybookLink[], url: string): PlaybookLink | undefined {
  const exact = links.find((l) => l.url === url);
  if (exact) return exact;
  return links
    .filter((l) => l.urlPrefix && url.startsWith(l.urlPrefix))
    .sort((a, b) => b.urlPrefix!.length - a.urlPrefix!.length)[0];
}

/**
 * The entry for a URL as a source-check report names it. Resolver pages
 * appear filled in (`…/api/subpage/<slug>`, `…#africa/51`) or as their
 * country list (`…#countries`), so after entryFor this tries a template's
 * text before `{key}`, then the URL without its fragment.
 */
export function entryForReportUrl(links: PlaybookLink[], url: string): PlaybookLink | undefined {
  const direct = entryFor(links, url);
  if (direct) return direct;
  const template = links.find((l) => l.url?.includes("{key}") && url.startsWith(l.url.slice(0, l.url.indexOf("{key}"))));
  if (template) return template;
  const hash = url.indexOf("#");
  return hash > 0 ? entryFor(links, url.slice(0, hash)) : undefined;
}

/** What sources.ts actually does with a set of cited links. */
function actualMachineCheck(cited: CitedLink[]): PlaybookLink["machineCheck"] {
  const all = cited.flatMap((c) => c.links.map((l) => l.link));
  if (all.some((l) => l.resolver)) return "resolver";
  if (all.some((l) => l.checkDiff)) return "diff";
  return "link-only";
}

/**
 * Problems with the playbooks against the live registry; empty when every
 * cited URL is documented exactly once and every documented fact the code can
 * confirm agrees with it.
 */
export function validatePlaybooks(playbooks: Playbook[], regions: Record<string, SourceRegion>): string[] {
  const errors: string[] = [];
  const byRegion = new Map(playbooks.map((p) => [p.region, p]));

  for (const region of Object.keys(regions)) {
    if (!byRegion.has(region)) errors.push(`${region}: no playbook in docs/sources/ (frontmatter "region: ${region}")`);
  }

  for (const pb of playbooks) {
    const where = pb.file;
    const regionDef = regions[pb.region];
    if (!regionDef) {
      errors.push(`${where}: region "${pb.region}" is not a SourceRegions key`);
      continue;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pb.lastReviewed)) errors.push(`${where}: lastReviewed must be YYYY-MM-DD`);

    const ids = new Set<string>();
    for (const l of pb.links) {
      const at = `${where} ${l.id ?? "(no id)"}`;
      if (!l.id) errors.push(`${at}: missing id`);
      else if (ids.has(l.id)) errors.push(`${at}: duplicate id`);
      ids.add(l.id);
      if (!l.url === !l.urlPrefix) errors.push(`${at}: give exactly one of url and urlPrefix`);
      if (typeof l.loadBearing !== "boolean") errors.push(`${at}: loadBearing must be true or false`);
      const enums: [keyof PlaybookLink, readonly string[]][] = [
        ["category", CATEGORIES],
        ["revisions", REVISIONS],
        ["access", ACCESS],
        ["machineCheck", MACHINE_CHECKS],
        ["diffConfidence", CONFIDENCE],
        ["humanCheck", HUMAN_CHECKS],
      ];
      for (const [field, allowed] of enums) {
        if (!allowed.includes(l[field] as string)) errors.push(`${at}: ${field} "${String(l[field])}" is not one of ${allowed.join(", ")}`);
      }
      if (l.machineCheck === "link-only" && l.diffConfidence !== "none") errors.push(`${at}: a link-only link has diffConfidence none`);
      if (l.machineCheck !== "link-only" && l.diffConfidence === "none") errors.push(`${at}: a diffed link needs a diffConfidence other than none`);
      if (l.checkedVia !== undefined) {
        const via = pb.links.find((v) => v.id === l.checkedVia);
        if (!via) errors.push(`${at}: checkedVia "${l.checkedVia}" is not a link id in this file`);
        else if (via.machineCheck === "link-only") errors.push(`${at}: checkedVia "${l.checkedVia}" is not diffed either`);
        if (l.machineCheck !== "link-only") errors.push(`${at}: checkedVia is only for links the pipeline doesn't diff`);
      }
      if (l.loadBearing && l.machineCheck === "link-only" && !l.checkedVia && l.humanCheck === "on-diff") {
        errors.push(`${at}: a load-bearing link that nothing diffs can't wait for a diff; set humanCheck to periodic or manual-only, or checkedVia`);
      }
      if (l.id && !new RegExp(`^## ${l.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(pb.body)) {
        errors.push(`${at}: the body has no "## ${l.id}" section`);
      }
    }

    const cited = citedLinks(regionDef.sources);
    const covered = new Map<PlaybookLink, CitedLink[]>();
    for (const c of cited.values()) {
      const entry = entryFor(pb.links, c.url);
      if (!entry) {
        errors.push(`${where}: ${c.url} (cited by ${c.links.slice(0, 3).map((l) => `${l.key} ${l.path}`).join(", ")}${c.links.length > 3 ? ", …" : ""}) is not documented`);
        continue;
      }
      if (!covered.has(entry)) covered.set(entry, []);
      covered.get(entry)!.push(c);
    }
    for (const l of pb.links) {
      const mine = covered.get(l);
      if (!mine) {
        errors.push(`${where} ${l.id}: ${l.url ?? `${l.urlPrefix}…`} is not cited by any ${pb.region} SourceDoc`);
        continue;
      }
      const actual = actualMachineCheck(mine);
      if (actual !== l.machineCheck) errors.push(`${where} ${l.id}: machineCheck is ${l.machineCheck}, but sources.ts makes it ${actual}`);
    }
  }
  return errors;
}

const HUMAN_LABEL: Record<PlaybookLink["humanCheck"], string> = {
  "on-diff": "on diff",
  periodic: "periodic",
  "manual-only": "**manual only**",
};

/**
 * docs/sources/OVERVIEW.md: every region's load-bearing links in one table,
 * and the links a person has to look at whatever the report says. Generated
 * from the playbooks (`npm run playbooks:overview`); a test keeps it current.
 */
export function renderOverview(playbooks: Playbook[]): string {
  const out: string[] = [
    "# Sources at a glance",
    "",
    "Generated from the playbooks in this folder by `npm run playbooks:overview`; don't edit by hand.",
    "Field meanings are in [README.md](README.md).",
    "",
    "## Load-bearing links",
    "",
    "| Region | Link | Category | Revisions | Access | Machine check | Diff confidence | Human check |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const pb of playbooks) {
    for (const l of pb.links.filter((x) => x.loadBearing)) {
      const machine = l.checkedVia ? `via \`${l.checkedVia}\`` : l.machineCheck;
      out.push(
        `| ${pb.region} | [\`${l.id}\`](${pb.file}#${l.id.toLowerCase()}) | ${l.category} | ${l.revisions} | ${l.access} | ${machine} | ${l.diffConfidence} | ${HUMAN_LABEL[l.humanCheck]} |`,
      );
    }
  }
  out.push("", "## Human checklist", "", "Links to look at by hand, whether or not the report flags them.", "");
  for (const pb of playbooks) {
    const due = pb.links.filter((l) => l.humanCheck !== "on-diff");
    if (due.length === 0) continue;
    out.push(`- **${pb.region}** (last reviewed ${pb.lastReviewed}): ${due.map((l) => `[\`${l.id}\`](${pb.file}#${l.id.toLowerCase()})${l.humanCheck === "manual-only" ? " (manual only)" : ""}`).join(", ")}`);
  }
  const totals = playbooks.flatMap((p) => p.links);
  out.push(
    "",
    "## Totals",
    "",
    `${playbooks.length} regions · ${totals.length} documented links · ${totals.filter((l) => l.loadBearing).length} load-bearing · ` +
      `${totals.filter((l) => l.machineCheck !== "link-only").length} diffed · ${totals.filter((l) => l.humanCheck !== "on-diff").length} need a person regardless`,
    "",
  );
  return out.join("\n");
}
