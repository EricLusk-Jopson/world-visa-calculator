import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LinkHealthResult, LinkHealthStatus, RuleCheckResult, RuleCheckStatus, UrlUsage } from './types';

export type RegionReport = {
  region: string;
  linkHealth: LinkHealthResult[];
  ruleChecks: RuleCheckResult[];
};

export type ReportSummary = {
  /** Unique URLs across all regions (a URL cited by two regions counts once). */
  totalLinksChecked: number;
  brokenLinks: number;
  redirectedLinks: number;
  /** Unique URLs parsed for content. */
  sourcesChecked: number;
  sourcesChanged: number;
  sourcesFirstRun: number;
  sourcesFetchError: number;
};

export type Report = {
  generatedAt: string;
  regions: RegionReport[];
  /** Regions left out of this run (`checkLinks: false`). Absent in older reports. */
  skippedRegions?: string[];
  summary: ReportSummary;
};

export const CHANGED_STATUSES: readonly RuleCheckStatus[] = ['text-changed', 'links-changed', 'both-changed'];

export function isChanged(status: RuleCheckStatus): boolean {
  return CHANGED_STATUSES.includes(status);
}

export function hasFindings(report: Report): boolean {
  const s = report.summary;
  return s.brokenLinks > 0 || s.redirectedLinks > 0 || s.sourcesChanged > 0 || s.sourcesFetchError > 0;
}

export function buildReport(
  regions: RegionReport[],
  { skippedRegions = [], generatedAt = new Date() }: { skippedRegions?: string[]; generatedAt?: Date } = {},
): Report {
  const linkStatus = new Map<string, LinkHealthStatus>();
  const ruleStatus = new Map<string, RuleCheckStatus>();
  for (const r of regions) {
    for (const l of r.linkHealth) linkStatus.set(l.url, l.status);
    for (const c of r.ruleChecks) ruleStatus.set(c.url, c.status);
  }
  const countLinks = (s: LinkHealthStatus) => [...linkStatus.values()].filter((v) => v === s).length;
  const countRules = (pred: (s: RuleCheckStatus) => boolean) => [...ruleStatus.values()].filter(pred).length;

  return {
    generatedAt: generatedAt.toISOString(),
    regions,
    skippedRegions,
    summary: {
      totalLinksChecked: linkStatus.size,
      brokenLinks: countLinks('broken'),
      redirectedLinks: countLinks('redirected'),
      sourcesChecked: ruleStatus.size,
      sourcesChanged: countRules(isChanged),
      sourcesFirstRun: countRules((s) => s === 'first-run'),
      sourcesFetchError: countRules((s) => s === 'fetch-error'),
    },
  };
}

export function statusBadge(status: LinkHealthStatus | RuleCheckStatus): string {
  switch (status) {
    case 'live': return '✅ live';
    case 'redirected': return '↪️ redirected';
    case 'broken': return '🔴 broken';
    case 'unchanged': return '✅ unchanged';
    case 'text-changed': return '✏️ text changed';
    case 'links-changed': return '🔗 link target changed';
    case 'both-changed': return '✏️🔗 text + link changed';
    case 'first-run': return '🆕 first run (baseline captured)';
    case 'fetch-error': return '⚠️ fetch error';
  }
}

/** "AD, AE, AF … (+187 more)" — keeps 190-key shared pages readable. */
export function formatKeys(keys: string[], max = 8): string {
  const unique = [...new Set(keys)];
  if (unique.length <= max) return unique.join(', ');
  return `${unique.slice(0, max).join(', ')} … (+${unique.length - max} more)`;
}

function formatUsages(usedBy: UrlUsage[]): string {
  const fields = new Set(usedBy.map((u) => u.field));
  const suffix = fields.size === 1 ? ` (${[...fields][0]})` : '';
  return formatKeys(usedBy.map((u) => u.key)) + suffix;
}

/** Escapes characters that would break a markdown table cell. */
function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function linkHealthRow(regionLabel: string | null, l: LinkHealthResult): string {
  const detail = l.error ?? (l.status === 'redirected' && l.finalUrl ? `→ ${l.finalUrl}` : '');
  const status = `${statusBadge(l.status)}${l.httpStatus ? ` (${l.httpStatus})` : ''}`;
  const cols = [formatUsages(l.usedBy), status, `${l.url}${detail ? `<br>${detail}` : ''}`];
  if (regionLabel !== null) cols.unshift(regionLabel);
  return `| ${cols.map(cell).join(' | ')} |`;
}

function renderRuleDetail(lines: string[], c: RuleCheckResult, heading: string): void {
  lines.push(`${heading} ${formatKeys(c.keys, 5)} — ${statusBadge(c.status)}`);
  lines.push('');
  lines.push(`URL: ${c.url}`);
  if (c.error) lines.push(`<br>Error: ${c.error}`);
  if (c.previousUpdatedAt || c.currentUpdatedAt) {
    lines.push(`<br>Last-updated metadata: \`${c.previousUpdatedAt ?? '—'}\` → \`${c.currentUpdatedAt ?? '—'}\``);
  }
  if (c.textDiffPreview) {
    lines.push('');
    lines.push('```diff');
    lines.push(c.textDiffPreview);
    lines.push('```');
  }
  if (c.linkChanges && c.linkChanges.length > 0) {
    lines.push('');
    lines.push('| Change | Anchor text | Previous target | Current target |');
    lines.push('|---|---|---|---|');
    for (const lc of c.linkChanges) {
      lines.push(`| ${lc.kind} | ${cell(lc.text)} | ${cell(lc.previousHref ?? '_(none)_')} | ${cell(lc.currentHref ?? '_(removed)_')} |`);
    }
  }
  lines.push('');
}

function renderSummary(lines: string[], report: Report): void {
  const s = report.summary;
  lines.push('| | |');
  lines.push('|---|---|');
  lines.push(`| Unique links checked | ${s.totalLinksChecked} |`);
  lines.push(`| 🔴 Broken | ${s.brokenLinks} |`);
  lines.push(`| ↪️ Redirected | ${s.redirectedLinks} |`);
  lines.push(`| Content sources diffed (\`parseForRules\`) | ${s.sourcesChecked} |`);
  lines.push(`| ✏️ Changed since last baseline | ${s.sourcesChanged} |`);
  lines.push(`| 🆕 First run (no baseline yet) | ${s.sourcesFirstRun} |`);
  lines.push(`| ⚠️ Fetch errors | ${s.sourcesFetchError} |`);
  lines.push('');
  if (report.skippedRegions && report.skippedRegions.length > 0) {
    lines.push(`Not checked this run (\`checkLinks: false\`): ${report.skippedRegions.join(', ')}.`);
    lines.push('');
  }
}

/**
 * Renders the full standardized report: broken down by region, then by link
 * within it. Health results come before diffing results per region.
 */
export function renderMarkdown(report: Report): string {
  const lines: string[] = [];
  lines.push('# Source Verification Report');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  renderSummary(lines, report);

  for (const regionReport of report.regions) {
    lines.push(`## ${regionReport.region}`);
    lines.push('');

    lines.push('### Link health');
    lines.push('');
    if (regionReport.linkHealth.length === 0) {
      lines.push('_No links checked._');
    } else {
      lines.push('| Used by | Status | URL |');
      lines.push('|---|---|---|');
      for (const l of regionReport.linkHealth) lines.push(linkHealthRow(null, l));
    }
    lines.push('');

    lines.push('### Content diffing');
    lines.push('');
    if (regionReport.ruleChecks.length === 0) {
      lines.push('_No sources in this region are flagged `parseForRules`._');
      lines.push('');
    } else {
      const detailed = regionReport.ruleChecks.filter((c) => isChanged(c.status) || c.status === 'fetch-error');
      const quiet = regionReport.ruleChecks.filter((c) => !detailed.includes(c));
      for (const c of detailed) renderRuleDetail(lines, c, '####');
      if (quiet.length > 0) {
        lines.push('| Keys | Status | URL |');
        lines.push('|---|---|---|');
        for (const c of quiet) lines.push(`| ${cell(formatKeys(c.keys))} | ${statusBadge(c.status)} | ${cell(c.url)} |`);
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

/** GitHub rejects PR bodies over 65,536 characters; leave headroom. */
const PR_BODY_LIMIT = 60_000;

/**
 * The PR description: summary plus only the items that need a human look
 * (broken, redirected, changed, fetch errors). The full by-region report is
 * in the committed markdown/JSON and rendered on the /source-report page.
 */
export function renderPrBody(report: Report, options: { reportPath: string; pagePath: string }): string {
  const lines: string[] = [];
  lines.push(`Automated source verification run from ${report.generatedAt.slice(0, 10)}.`);
  lines.push('');
  lines.push(
    `Open \`${options.pagePath}\` on this PR's preview deployment for the rendered report; the full markdown is in \`${options.reportPath}\`. ` +
      'Merging accepts the new content snapshots as the baseline for the next run.',
  );
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  renderSummary(lines, report);

  if (!hasFindings(report)) {
    lines.push('No broken links, redirects, content changes or fetch errors.');
    return lines.join('\n');
  }

  const problemLinks = report.regions.flatMap((r) =>
    r.linkHealth.filter((l) => l.status !== 'live').map((l) => ({ region: r.region, l })),
  );
  if (problemLinks.length > 0) {
    lines.push('## Link health findings');
    lines.push('');
    lines.push('| Region | Used by | Status | URL |');
    lines.push('|---|---|---|---|');
    for (const { region, l } of problemLinks) lines.push(linkHealthRow(region, l));
    lines.push('');
  }

  const problemRules = report.regions.flatMap((r) =>
    r.ruleChecks.filter((c) => isChanged(c.status) || c.status === 'fetch-error').map((c) => ({ region: r.region, c })),
  );
  if (problemRules.length > 0) {
    lines.push('## Content diffing findings');
    lines.push('');
    for (const { region, c } of problemRules) renderRuleDetail(lines, c, `### ${region} ·`);
  }

  let body = lines.join('\n');
  if (body.length > PR_BODY_LIMIT) {
    body =
      body.slice(0, PR_BODY_LIMIT) +
      `\n\n---\n_Truncated — see \`${options.reportPath}\` or the preview page for the remaining findings._`;
  }
  return body;
}

export type WrittenReport = { markdownPath: string; jsonPath: string; prBodyPath: string };

/**
 * Writes a dated report and a stable "latest" copy, in markdown (human
 * review / PR diff) and JSON (rendered by the site's /source-report page),
 * plus `pr-body.md` for the automation to use as the PR description.
 */
export function writeReportFiles(report: Report, outDir: string, options: { reportPath: string; pagePath: string }): WrittenReport {
  mkdirSync(outDir, { recursive: true });
  const stamp = report.generatedAt.slice(0, 10); // YYYY-MM-DD
  const markdown = renderMarkdown(report);
  const json = JSON.stringify(report, null, 2) + '\n';

  const markdownPath = join(outDir, `${stamp}.md`);
  const jsonPath = join(outDir, `${stamp}.json`);
  const prBodyPath = join(outDir, 'pr-body.md');
  writeFileSync(markdownPath, markdown, 'utf-8');
  writeFileSync(jsonPath, json, 'utf-8');
  writeFileSync(join(outDir, 'latest.md'), markdown, 'utf-8');
  writeFileSync(join(outDir, 'latest.json'), json, 'utf-8');
  writeFileSync(prBodyPath, renderPrBody(report, options), 'utf-8');

  return { markdownPath, jsonPath, prBodyPath };
}
