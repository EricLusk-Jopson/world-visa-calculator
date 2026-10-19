/**
 * sourceStatus.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * What the app can say about a cited source beyond its URL:
 *   - when the source check last checked the link, and what it found
 *     (pipeline/reports/link-status.json, loaded lazily on first use);
 *   - when the region's rules last changed (the rule-change log's summary).
 */

import type { SourceRegions } from "@/data/sources";
import ruleChangeSummary from "@/data/rule-changes/summary.json";

export type LinkCheckStatus = "live" | "redirected" | "blocked" | "broken";
export type LinkCheck = { status: LinkCheckStatus; checkedAt: string };
type LinkStatusIndex = { generatedAt: string; urls: Record<string, LinkCheck> };

// Lazy, so the ~800-URL index is only fetched once someone opens a source.
const loaders = import.meta.glob<LinkStatusIndex>("../../pipeline/reports/link-status.json", { import: "default" });
let index: Promise<LinkStatusIndex | undefined> | undefined;

export function loadLinkStatus(): Promise<LinkStatusIndex | undefined> {
  const load = Object.values(loaders)[0];
  index ??= load ? load().catch(() => undefined) : Promise.resolve(undefined);
  return index;
}

export function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export type StatusLine = { text: string; tone: "ok" | "neutral" | "warn" };

/** One line about the automated check of a link. */
export function describeLinkCheck(check: LinkCheck | undefined): StatusLine {
  if (!check) return { text: "Not checked automatically yet", tone: "neutral" };
  const when = formatDay(check.checkedAt);
  switch (check.status) {
    case "live":
    case "redirected":
      return { text: `Link checked ${when}: working`, tone: "ok" };
    case "blocked":
      return { text: `Link checked ${when}: the site blocks automated checks, so it's verified by hand`, tone: "neutral" };
    case "broken":
      return { text: `Link checked ${when}: not responding. We're looking into it`, tone: "warn" };
  }
}

/** When the region's rules last changed, linked to its entry on /updates. */
export function describeRuleChanges(region: keyof typeof SourceRegions | undefined): { text: string; href: string } | undefined {
  const summary = ruleChangeSummary as {
    baseline?: { id: number; recorded: string };
    bySourceRegion: Record<string, { id: number; recorded: string; title: string }>;
  };
  const last = region ? summary.bySourceRegion[region] : undefined;
  if (last) return { text: `Rules last changed ${formatDay(last.recorded)}`, href: `/updates#rule-${last.id}` };
  if (summary.baseline) return { text: `No rule changes since ${formatDay(summary.baseline.recorded)}`, href: "/updates#rule-changes" };
  return undefined;
}

export const ISSUE_KINDS = [
  { value: "broken-link", label: "The link is broken" },
  { value: "wrong-info", label: "The information is wrong or out of date" },
  { value: "other", label: "Something else" },
] as const;
export type IssueKind = (typeof ISSUE_KINDS)[number]["value"];
export const ISSUE_MESSAGE_MAX = 500;

/** The `source_issue_reported` event's properties. The form asks for no personal details. */
export function issueReportProperties(input: {
  region?: string;
  key?: string;
  url: string;
  kind: IssueKind;
  message: string;
  dateChecked: string;
}): Record<string, string> {
  return {
    region: input.region ?? "unknown",
    key: input.key ?? "unknown",
    url: input.url,
    kind: input.kind,
    message: input.message.trim().slice(0, ISSUE_MESSAGE_MAX),
    date_checked: input.dateChecked,
  };
}
