import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SourceRegions } from "@/data/sources";
import type { SourceRegion } from "@/types";
import { loadPlaybooks, parsePlaybook, PLAYBOOK_DIR, renderOverview, validatePlaybooks, type Playbook } from "./playbooks";

describe("source playbooks (docs/sources/)", () => {
  it("document every cited link exactly as sources.ts uses it", () => {
    expect(validatePlaybooks(loadPlaybooks(), SourceRegions)).toEqual([]);
  });

  it("have an up-to-date OVERVIEW.md (npm run playbooks:overview)", () => {
    const path = join(PLAYBOOK_DIR, "OVERVIEW.md");
    const expected = renderOverview(loadPlaybooks());
    if (process.env.UPDATE_PLAYBOOK_OVERVIEW) writeFileSync(path, expected);
    expect(readFileSync(path, "utf-8")).toBe(expected);
  });
});

describe("validatePlaybooks", () => {
  const regions: Record<string, SourceRegion> = {
    Testland: {
      checkLinks: true,
      sources: {
        a: {
          direct: { url: "https://x.test/rules/a", type: "direct", checkDiff: true },
          parent: { url: "https://x.test/rules", type: "parent", checkDiff: false },
          dateChecked: "2026-01-01",
        },
        b: {
          direct: { url: "https://x.test/rules/b", type: "direct", checkDiff: true },
          parent: { url: "https://x.test/rules", type: "parent", checkDiff: false },
          dateChecked: "2026-01-01",
        },
      },
    },
  };
  const link = {
    loadBearing: true,
    category: "html-page",
    revisions: "in-place",
    access: "open",
    machineCheck: "diff",
    diffConfidence: "medium",
    humanCheck: "on-diff",
  } as const;
  const playbook = (links: object[], body = "## pages\n\n## index\n"): Playbook =>
    parsePlaybook(
      "testland.md",
      `---\nregion: Testland\nlastReviewed: 2026-10-19\nlinks: ${JSON.stringify(links)}\n---\n${body}`,
    );
  const good = [
    { id: "pages", urlPrefix: "https://x.test/rules/", ...link },
    { id: "index", url: "https://x.test/rules", ...link, loadBearing: false, category: "index", machineCheck: "link-only", diffConfidence: "none" },
  ];

  it("accepts a prefix entry for per-country pages plus an exact entry", () => {
    expect(validatePlaybooks([playbook(good)], regions)).toEqual([]);
  });

  it("reports an undocumented URL and a region with no playbook", () => {
    const errors = validatePlaybooks([playbook([good[1]], "## index\n")], { ...regions, Other: { checkLinks: true, sources: {} } });
    expect(errors).toContain("Other: no playbook in docs/sources/ (frontmatter \"region: Other\")");
    expect(errors.some((e) => e.includes("https://x.test/rules/a (cited by a direct) is not documented"))).toBe(true);
  });

  it("reports a machineCheck that disagrees with sources.ts", () => {
    const errors = validatePlaybooks([playbook([good[0], { ...good[1], machineCheck: "diff", diffConfidence: "low" }])], regions);
    expect(errors).toEqual(["testland.md index: machineCheck is diff, but sources.ts makes it link-only"]);
  });

  it("requires a human check for a load-bearing link that is never diffed", () => {
    const errors = validatePlaybooks([playbook([good[0], { ...good[1], loadBearing: true }])], regions);
    expect(errors).toEqual([
      "testland.md index: a load-bearing link that nothing diffs can't wait for a diff; set humanCheck to periodic or manual-only, or checkedVia",
    ]);
  });

  it("lets a link-only page wait for the diff of the link that covers it", () => {
    expect(validatePlaybooks([playbook([good[0], { ...good[1], loadBearing: true, checkedVia: "pages" }])], regions)).toEqual([]);
    expect(validatePlaybooks([playbook([good[0], { ...good[1], loadBearing: true, checkedVia: "index" }])], regions)).toEqual([
      'testland.md index: checkedVia "index" is not diffed either',
    ]);
  });

  it("requires a body section per link", () => {
    expect(validatePlaybooks([playbook(good, "## pages\n")], regions)).toEqual(['testland.md index: the body has no "## index" section']);
  });
});
