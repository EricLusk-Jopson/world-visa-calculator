import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { diffLines } from 'diff';
import type { ContentLink, ContentSnapshot, LinkChange, RuleCheckStatus } from './types';

/** Picks the first selector that actually matches content on the page. */
function selectContentRoot($: cheerio.CheerioAPI) {
  for (const selector of ['#content', 'main', 'body']) {
    const el = $(selector);
    if (el.length && el.text().trim().length > 0) return el;
  }
  return $('body');
}

function isHtml(contentType: string): boolean {
  return contentType === '' || /html|xml/i.test(contentType);
}

/**
 * Reduces a fetched page to what we diff: block-level text and outbound
 * links inside the main content region. Non-HTML bodies (PDFs) can't be
 * meaningfully text-diffed here, so they're tracked by content hash only.
 */
export function extractSnapshot(body: Buffer, contentType: string, url: string): ContentSnapshot {
  if (!isHtml(contentType)) {
    const hash = createHash('sha256').update(body).digest('hex');
    return { url, contentType, updatedAt: null, text: `sha256:${hash}`, links: [] };
  }

  const $ = cheerio.load(body.toString('utf-8'));
  const updatedAt =
    $('meta[name="govuk:public-updated-at"]').attr('content') ??
    $('meta[name="govuk:updated-at"]').attr('content') ??
    null;

  const root = selectContentRoot($);

  const text = root
    .find('li, p, h1, h2, h3, h4, td, th')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get()
    .filter(Boolean)
    .join('\n');

  const links: ContentLink[] = root
    .find('a[href]')
    .map((_, el) => {
      const href = $(el).attr('href') ?? '';
      const resolved = (() => {
        try {
          return new URL(href, url).toString();
        } catch {
          return href;
        }
      })();
      const linkText = $(el).text().replace(/\s+/g, ' ').trim();
      return { text: linkText, href: resolved };
    })
    .get()
    .filter((l) => l.text.length > 0 && l.href.length > 0);

  return { url, contentType, updatedAt, text, links };
}

const MAX_DIFF_PARTS = 20;
const MAX_LINE_LENGTH = 200;

function buildTextDiffPreview(previous: string, current: string): string | undefined {
  const parts = diffLines(previous, current).filter((p) => p.added || p.removed);
  if (parts.length === 0) return undefined;
  const lines = parts
    .slice(0, MAX_DIFF_PARTS)
    .flatMap((p) => p.value.split('\n').filter(Boolean).map((line) => (p.added ? '+ ' : '- ') + line.slice(0, MAX_LINE_LENGTH)));
  if (parts.length > MAX_DIFF_PARTS) lines.push(`… ${parts.length - MAX_DIFF_PARTS} more changed blocks not shown`);
  return lines.join('\n');
}

/**
 * Diffs link targets by matching on anchor text. This is what catches a
 * "document vault" rotation (Schengen's PDF Annex): the surrounding page
 * text is byte-identical, but the link with the same visible text ("Annex
 * 7b") now points at a new URL.
 */
function diffLinks(previous: ContentLink[], current: ContentLink[]): LinkChange[] {
  const prevByText = new Map(previous.map((l) => [l.text, l.href]));
  const currByText = new Map(current.map((l) => [l.text, l.href]));
  const changes: LinkChange[] = [];

  for (const [text, currentHref] of currByText) {
    const previousHref = prevByText.get(text);
    if (previousHref === undefined) {
      changes.push({ text, currentHref, kind: 'added' });
    } else if (previousHref !== currentHref) {
      changes.push({ text, previousHref, currentHref, kind: 'target-changed' });
    }
  }
  for (const [text, previousHref] of prevByText) {
    if (!currByText.has(text)) {
      changes.push({ text, previousHref, kind: 'removed' });
    }
  }
  return changes;
}

export type SnapshotComparison = {
  status: RuleCheckStatus;
  textDiffPreview?: string;
  linkChanges?: LinkChange[];
};

export function compareSnapshots(previous: ContentSnapshot | null, current: ContentSnapshot): SnapshotComparison {
  if (!previous) return { status: 'first-run' };

  const textDiffPreview = buildTextDiffPreview(previous.text, current.text);
  const linkChanges = diffLinks(previous.links, current.links);

  const textChanged = textDiffPreview !== undefined;
  const linksChanged = linkChanges.length > 0;

  let status: RuleCheckStatus = 'unchanged';
  if (textChanged && linksChanged) status = 'both-changed';
  else if (textChanged) status = 'text-changed';
  else if (linksChanged) status = 'links-changed';

  return { status, textDiffPreview, linkChanges: linksChanged ? linkChanges : undefined };
}
