import type { SourceDoc, SourceLink } from '@/types';

export type { SourceDoc, SourceLink };

/**
 * Where a link sits on its SourceDoc: 'direct', 'parent', or an alternate
 * of either ('direct.alternate', 'parent.alternate').
 */
export type LinkPath = string;

/** One place a URL is cited from in sources.ts. */
export type UrlUsage = { key: string; field: LinkPath };

/**
 * `blocked`: the server refused us or answered without the page (HTTP 403,
 * or a 202 bot-protection challenge). The link may well work in a browser;
 * we just couldn't see it, so it is neither confirmed live nor broken. A redirect to a known outage page (EUR-Lex's Official Journal
 * fallback) is `broken` instead, since people can't reach the page either.
 */
export type LinkHealthStatus = 'live' | 'redirected' | 'blocked' | 'broken';

/**
 * Health of one unique URL within a region. Many SourceDoc entries can share
 * a URL (Bosnia's ~190 entries all cite one page) — they're listed in
 * `usedBy` rather than repeated as separate rows.
 */
export type LinkHealthResult = {
  url: string;
  usedBy: UrlUsage[];
  status: LinkHealthStatus;
  httpStatus?: number;
  finalUrl?: string;
  error?: string;
};

export type RuleCheckStatus = 'unchanged' | 'text-changed' | 'links-changed' | 'both-changed' | 'first-run' | 'fetch-error';

/** A single outbound link found within the parsed content zone. */
export type ContentLink = {
  /** Visible anchor text, normalized (whitespace-collapsed). Used as a stable
   * key to match the "same" link across runs even if its target moves —
   * this is what catches a doc-vault PDF rotation: same anchor, new href. */
  text: string;
  href: string;
};

export type ContentSnapshot = {
  url: string;
  /** Content-Type of the response; non-HTML bodies are tracked by hash only. */
  contentType: string;
  updatedAt: string | null;
  /** Block-level text for HTML; `sha256:<hex>` of the body for anything else. */
  text: string;
  links: ContentLink[];
};

export type LinkChange = {
  /** Anchor text the link was matched on. */
  text: string;
  previousHref?: string;
  currentHref?: string;
  kind: 'added' | 'removed' | 'target-changed';
};

/** Content diff for one unique checkDiff URL within a region. */
export type RuleCheckResult = {
  url: string;
  /** SourceDoc keys whose rule content lives at this URL. */
  keys: string[];
  /** Which link on those entries was diffed, e.g. 'direct' or 'direct.alternate'. Absent in older reports. */
  link?: LinkPath;
  status: RuleCheckStatus;
  previousUpdatedAt?: string | null;
  currentUpdatedAt?: string | null;
  textDiffPreview?: string;
  linkChanges?: LinkChange[];
  error?: string;
};
