import { describe, expect, it } from "vitest";
import { MontenegroSources, SourceRegions } from "@/data/sources";
import { ALBANIA } from "@/data/regions";
import { findSourceRef, sourceRefOf } from "./sourceIndex";
import { describeLinkProblem, describeRuleChange, issueReportProperties, loadLinkStatus } from "./sourceStatus";

describe("sourceIndex", () => {
  it("finds a cited SourceDoc by identity", () => {
    expect(sourceRefOf(MontenegroSources.DZ)).toEqual({ region: "Montenegro", key: "DZ" });
  });

  it("places the calculator's region-level fallback by its URL", () => {
    const fallback = {
      direct: { url: ALBANIA.sourceUrl, type: "direct", checkDiff: false },
      parent: { url: ALBANIA.sourceUrl, type: "parent", checkDiff: false },
      dateChecked: ALBANIA.lastVerified,
    } as const;
    expect(sourceRefOf(fallback)).toBeUndefined();
    expect(findSourceRef(fallback)).toEqual({ region: "Albania" });
  });
});

describe("describeLinkProblem", () => {
  it("only speaks up when the link was broken", () => {
    expect(describeLinkProblem({ status: "broken", checkedAt: "2026-10-18" })).toBe("We couldn't reach this link on 18 Oct 2026. We're looking into it.");
    expect(describeLinkProblem({ status: "live", checkedAt: "2026-10-18" })).toBeUndefined();
    expect(describeLinkProblem({ status: "blocked", checkedAt: "2026-10-18" })).toBeUndefined();
    expect(describeLinkProblem(undefined)).toBeUndefined();
  });
});

describe("describeRuleChange", () => {
  it("links the latest change to a rule citing the source, and says nothing otherwise", () => {
    expect(describeRuleChange("Montenegro.DZ")).toEqual({ text: "Rule changed 15 Oct 2026", href: "/rule-changes#rule-4" });
    expect(describeRuleChange("Montenegro.CA")).toBeUndefined();
    expect(describeRuleChange(undefined)).toBeUndefined();
  });
});

describe("link-status.json", () => {
  it("covers every URL the app cites", async () => {
    const idx = await loadLinkStatus();
    const missing = Object.values(SourceRegions)
      .flatMap(({ sources }) => Object.values(sources).flatMap((d) => [d.direct.url, d.parent.url]))
      .filter((u) => !u.includes("{key}") && !idx?.urls[u]);
    expect([...new Set(missing)]).toEqual([]);
  });
});

describe("issueReportProperties", () => {
  it("trims and caps the message", () => {
    const props = issueReportProperties({ region: "Albania", key: "SA", url: "https://x", kind: "wrong-info", message: `  ${"a".repeat(600)} `, dateChecked: "2026-09-04" });
    expect(props.message).toHaveLength(500);
    expect(props).toMatchObject({ region: "Albania", key: "SA", kind: "wrong-info", date_checked: "2026-09-04" });
  });
});
