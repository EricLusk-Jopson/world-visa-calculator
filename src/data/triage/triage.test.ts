import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Report } from "../../../pipeline/src/report";
import { entryForReportUrl, loadPlaybooks, parsePlaybook, PLAYBOOK_DIR } from "@/data/playbooks";
import { loadEntries } from "@/data/rule-changes/entries";
import { parseEntry } from "@/data/rule-changes/log";
import { computeStats, loadReports, loadTriage, renderStats, validateTriage, type TriageFile } from "./triage";

describe("triage records (pipeline/triage/)", () => {
  it("match flagged diffs and are complete", () => {
    expect(validateTriage(loadTriage(), loadReports(), loadEntries())).toEqual([]);
  });

  it("can attribute every rule check in the reports to a playbook link", () => {
    const playbooks = new Map(loadPlaybooks().map((p) => [p.region, p]));
    const orphans: string[] = [];
    for (const [date, report] of loadReports()) {
      for (const r of report.regions) {
        const pb = playbooks.get(r.region);
        for (const c of r.ruleChecks) if (!pb || !entryForReportUrl(pb.links, c.url)) orphans.push(`${date} ${r.region} ${c.url}`);
      }
    }
    expect(orphans).toEqual([]);
  });

  it("have an up-to-date docs/sources/STATS.md (npm run stats)", () => {
    const path = join(PLAYBOOK_DIR, "STATS.md");
    const expected = renderStats(computeStats(loadPlaybooks(), loadReports(), loadTriage(), loadEntries()));
    if (process.env.UPDATE_STATS) writeFileSync(path, expected);
    expect(readFileSync(path, "utf-8")).toBe(expected);
  });
});

describe("computeStats", () => {
  const playbook = parsePlaybook(
    "testland.md",
    `---
region: Testland
lastReviewed: 2026-10-19
links:
  - { id: pages, urlPrefix: "https://x.test/p/", loadBearing: true, category: html-page, revisions: in-place, access: open, machineCheck: diff, diffConfidence: medium, humanCheck: on-diff }
  - { id: api, url: "https://x.test/api/{key}", loadBearing: true, category: machine-copy, revisions: regenerated, access: open, machineCheck: resolver, diffConfidence: high, humanCheck: on-diff }
  - { id: guide, url: "https://x.test/guide", loadBearing: true, category: html-page, revisions: in-place, access: open, machineCheck: link-only, diffConfidence: none, humanCheck: periodic }
---
## pages
## api
## guide
`,
  );
  const check = (url: string, status: string) => ({ url, keys: ["AA"], status });
  const report = (checks: object[]) => ({ generatedAt: "", summary: {}, regions: [{ region: "Testland", linkHealth: [], ruleChecks: checks }] }) as unknown as Report;
  const reports = new Map([
    ["2026-11-06", report([check("https://x.test/p/aa", "text-changed"), check("https://x.test/api/slug-1", "both-changed"), check("https://x.test/p/bb", "unchanged")])],
    ["2026-11-20", report([check("https://x.test/p/cc", "links-changed"), check("https://x.test/api/slug-2", "text-changed"), check("https://x.test/elsewhere", "text-changed")])],
  ]);
  const entry = (id: number, type: string, link: string) =>
    parseEntry(
      `000${id}-2026-11-07-x.md`,
      `---\nid: ${id}\ntitle: x\nrecorded: 2026-11-07\ntrigger: { type: ${type}, ref: x }\nevidence: [{ region: Testland, link: ${link} }]\nchanges: [{ region: testland, path: passportRules.AA, before: a, after: b }]\n---\n`,
    );
  const entries = [entry(1, "report", "pages"), entry(2, "manual", "pages"), entry(3, "user-report", "guide")];
  const triage: TriageFile[] = [
    {
      file: "2026-11-06.yml",
      report: "2026-11-06",
      items: [
        { region: "Testland", url: "https://x.test/p/aa", verdict: "rule-change", ruleChange: 1, by: "human" },
        { region: "Testland", url: "https://x.test/api/slug-1", verdict: "no-rule-change", noise: "layout", by: "ai-assisted" },
      ],
    },
  ];

  it("counts verdicts, untriaged diffs, caught and missed rule changes per link", () => {
    const stats = computeStats([playbook], reports, triage, entries);
    const by = (id: string) => stats.links.find((s) => s.link.id === id)!;
    expect(by("pages")).toMatchObject({ flagged: 2, ruleChange: 1, noise: 0, untriaged: 1, caught: 1, missed: 1 });
    expect(by("api")).toMatchObject({ flagged: 2, noise: 1, untriaged: 1 });
    expect(by("guide")).toMatchObject({ flagged: 0, humanFound: 1, missed: 0 });
    expect(stats.noiseKinds.get("layout")).toBe(1);
    expect(stats.untriaged.map((f) => f.url)).toEqual(["https://x.test/p/cc", "https://x.test/api/slug-2"]);
    expect(stats.unmatched.map((f) => f.url)).toEqual(["https://x.test/elsewhere"]);
    expect(renderStats(stats)).toContain("| Testland | pages | medium | 2 | 1 | 0 | 0 | 1 | 100% (1/1) | 1 | 1 | 0 | 50% (1/2) |");
  });

  it("rejects a verdict on a diff the report didn't flag, and incomplete verdicts", () => {
    const bad: TriageFile[] = [
      {
        file: "2026-11-06.yml",
        report: "2026-11-06",
        items: [
          { region: "Testland", url: "https://x.test/p/bb", verdict: "no-rule-change", by: "human" },
          { region: "Testland", url: "https://x.test/p/aa", verdict: "rule-change", ruleChange: 9, by: "human" },
        ],
      },
    ];
    expect(validateTriage(bad, reports, entries)).toEqual([
      "2026-11-06.yml Testland https://x.test/p/bb: not a diff that report flagged",
      "2026-11-06.yml Testland https://x.test/p/bb: a no-rule-change verdict needs noise: one of layout, contact-info, date-stamp, url-format, wording, not-modelled, pipeline, other",
      "2026-11-06.yml Testland https://x.test/p/aa: a rule-change verdict needs ruleChange: the id of its rule-change log entry",
    ]);
  });
});
