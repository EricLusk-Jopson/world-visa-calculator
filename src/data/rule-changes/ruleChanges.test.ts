import { describe, expect, it } from "vitest";
import type { RegionDefinition } from "@/types";
import { MONTENEGRO } from "@/data/regions";
import { MontenegroSources } from "@/data/sources";
import { lastChangePerRegion, loadEntries, parseEntry, UNFINISHED, unrecordedRegions, validateEntries } from "./entries";
import { diffRegion, normalizeRegion, RULE_REGIONS, summarizeRule } from "./normalize";

describe("rule-change log", () => {
  const entries = loadEntries();

  it("records every change to the rules (run npm run rules:new after editing a region file)", () => {
    expect(unrecordedRegions()).toEqual([]);
  });

  it("has complete, consistent entries", () => {
    expect(validateEntries(entries)).toEqual([]);
  });

  it("has a baseline", () => {
    expect(entries.filter((e) => e.baseline)).toHaveLength(1);
  });

  it("has each changed region's lastVerified on or after its last recorded change", () => {
    const stale = [...lastChangePerRegion(entries)]
      .map(([code, entry]) => ({ def: RULE_REGIONS.find((r) => r.def.code === code)!.def, entry }))
      .filter(({ def, entry }) => def.lastVerified < entry.recorded)
      .map(({ def, entry }) => `${def.code}: lastVerified ${def.lastVerified} is before entry ${entry.id} (${entry.recorded})`);
    expect(stale).toEqual([]);
  });
});

describe("normalizeRegion / diffRegion", () => {
  const withRule = (code: string, rule: RegionDefinition["passportRules"][string]): RegionDefinition => ({
    ...MONTENEGRO,
    passportRules: { ...MONTENEGRO.passportRules, [code]: rule },
  });

  it("reduces each SourceDoc to its key, so link fixes and dateChecked bumps aren't rule changes", () => {
    expect(normalizeRegion(MONTENEGRO).passportRules.DZ).toEqual({ access: "visa_required", source: { $source: "Montenegro.DZ" } });
    expect(diffRegion(normalizeRegion(MONTENEGRO), MONTENEGRO)).toEqual([]);
  });

  it("reports a passport rule change with before and after summaries", () => {
    const after = withRule("CA", { access: "visa_required", source: MontenegroSources.CA });
    expect(diffRegion(normalizeRegion(MONTENEGRO), after)).toEqual([
      { region: "montenegro", path: "passportRules.CA", before: summarizeRule(MONTENEGRO.passportRules.CA), after: "visa required" },
    ]);
  });

  it("reports an added passport rule against the default", () => {
    const before = normalizeRegion(MONTENEGRO);
    delete before.passportRules.CA;
    expect(diffRegion(before, MONTENEGRO)[0]).toMatchObject({ path: "passportRules.CA", before: "(not listed: default rule)" });
  });

  it("marks a change the summary can't show", () => {
    const rule = MONTENEGRO.passportRules.DZ;
    const after = withRule("DZ", { ...rule, notes: [{ text: "A new note." }] });
    const before = normalizeRegion(withRule("DZ", { ...rule, notes: [{ text: "An old note." }] }));
    expect(diffRegion(before, after)[0].after).toBe("visa required · 1 note (details changed)");
  });
});

describe("validateEntries", () => {
  const entry = (file: string, front: string, body = "\nWhy.\n") => parseEntry(file, `---\n${front}\n---\n${body}`);
  const ok = `id: 1
title: Test
recorded: 2026-10-20
trigger: { type: report, ref: 2026-10-18 }
evidence: [{ region: Montenegro, link: countryPages }]
changes: [{ region: montenegro, path: passportRules.DZ, before: a, after: b }]`;

  it("accepts a complete entry", () => {
    expect(validateEntries([entry("0001-2026-10-20-test.md", ok)])).toEqual([]);
  });

  it("rejects a report that doesn't exist, an unknown playbook link and an unfinished body", () => {
    const front = ok.replace("ref: 2026-10-18", "ref: 2026-01-01").replace("link: countryPages", "link: nope");
    expect(validateEntries([entry("0001-2026-10-20-test.md", front, `\n${UNFINISHED}: why\n`)])).toEqual([
      "0001-2026-10-20-test.md: trigger.ref 2026-01-01 is not a report in pipeline/reports/",
      "0001-2026-10-20-test.md: evidence link \"nope\" is not in Montenegro's playbook",
      `0001-2026-10-20-test.md: still has ${UNFINISHED} placeholders`,
    ]);
  });

  it("rejects gaps in the numbering and a date that doesn't match the file name", () => {
    expect(validateEntries([entry("0002-2026-10-21-test.md", ok.replace("id: 1", "id: 2"))])).toEqual([
      "0002-2026-10-21-test.md: ids must run 1, 2, 3… with no gaps (expected 1)",
      "0002-2026-10-21-test.md: recorded 2026-10-20 doesn't match the file date",
    ]);
  });
});
