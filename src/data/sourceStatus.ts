/**
 * sourceStatus.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * What the app can say about a cited source beyond its URL:
 *   - whether the source check last found the link broken
 *     (pipeline/reports/link-status.json, loaded lazily on first use);
 *   - when a rule citing it last changed (the rule-change log's summary).
 */

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

/**
 * A line about the automated link check, only when it found a problem: a
 * working link needs no announcement, and a site that blocks automated checks
 * is verified by hand (its "Verified" date says when).
 */
export function describeLinkProblem(check: LinkCheck | undefined): string | undefined {
  if (check?.status !== "broken") return undefined;
  return `We couldn't reach this link on ${formatDay(check.checkedAt)}. We're looking into it.`;
}

/** The latest recorded change to a rule citing this source, linked to its entry on /rule-changes. */
export function describeRuleChange(sourceKey: string | undefined): { text: string; href: string } | undefined {
  const last = sourceKey ? (ruleChangeSummary as { bySource: Record<string, { id: number; recorded: string }> }).bySource[sourceKey] : undefined;
  return last && { text: `Rule changed ${formatDay(last.recorded)}`, href: `/rule-changes#rule-${last.id}` };
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
