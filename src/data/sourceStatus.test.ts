import { describe, expect, it } from "vitest";
import { MontenegroSources, SourceRegions } from "@/data/sources";
import { ALBANIA } from "@/data/regions";
import { findSourceRef, sourceRefOf } from "./sourceIndex";
import { describeLinkCheck, describeRuleChanges, issueReportProperties, loadLinkStatus } from "./sourceStatus";

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

describe("describeLinkCheck", () => {
  it("words each outcome for people", () => {
    expect(describeLinkCheck({ status: "live", checkedAt: "2026-10-18" })).toEqual({ text: "Link checked 18 Oct 2026: working", tone: "ok" });
    expect(describeLinkCheck({ status: "blocked", checkedAt: "2026-10-18" }).tone).toBe("neutral");
    expect(describeLinkCheck({ status: "broken", checkedAt: "2026-10-18" }).tone).toBe("warn");
    expect(describeLinkCheck(undefined).text).toBe("Not checked automatically yet");
  });
});

describe("describeRuleChanges", () => {
  it("links the region's latest rule change, or says there has been none since the log began", () => {
    expect(describeRuleChanges("Montenegro")).toEqual({ text: "Rules last changed 15 Oct 2026", href: "/updates#rule-4" });
    expect(describeRuleChanges("Albania")).toEqual({ text: "No rule changes since 19 Oct 2026", href: "/updates#rule-changes" });
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
