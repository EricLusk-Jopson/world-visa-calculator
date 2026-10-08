import type { SourceDoc } from '@/types';

/**
 * The app's SourceDoc plus pipeline-only options. Kept here rather than on
 * the app type so the site's data layer doesn't carry pipeline config.
 */
export type PipelineSourceDoc = SourceDoc & {
  /**
   * Which field actually carries the parseable rule content, when it isn't
   * directUrl. Needed for "document vault" sources (e.g. Schengen's PDF
   * Annex 7b): the directUrl is the document itself and rotates on its own
   * schedule, so the thing worth diffing is the *landing page* (parentUrl)
   * that links to it — a rotation shows up there as a one-line href change
   * on an otherwise-unchanged page. Defaults to 'directUrl'.
   */
  parseField?: 'directUrl' | 'parentUrl';
};

export type SourceField = 'directUrl' | 'parentUrl';

/** One place a URL is cited from in sources.ts. */
export type UrlUsage = { key: string; field: SourceField };

export type LinkHealthStatus = 'live' | 'redirected' | 'broken';

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

/** Content diff for one unique parsed URL within a region. */
export type RuleCheckResult = {
  url: string;
  /** SourceDoc keys whose rule content lives at this URL. */
  keys: string[];
  status: RuleCheckStatus;
  previousUpdatedAt?: string | null;
  currentUpdatedAt?: string | null;
  textDiffPreview?: string;
  linkChanges?: LinkChange[];
  error?: string;
};
