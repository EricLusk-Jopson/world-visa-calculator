import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { citedLinks, entryFor, loadPlaybooks, type Playbook } from '@/data/playbooks';
import { SourceRegions } from '@/data/sources';
import type { SourceRegion } from '@/types';
import { isChanged, type Report } from './report';

/**
 * How long each source's diffed content has stayed the same, so the app can
 * carry a by-hand verification forward on runs that found nothing new.
 *
 * Per source (`<region>.<key>`): the source's content was the same on every
 * run from `since` through `through`. A person who verified the source on a
 * day in that span (its `dateChecked`) verified what the source still said on
 * `through`, so the app shows "Verified <through>" (`verifiedDate` in
 * src/data/sourceStatus.ts). A verification before
 * `since` says nothing about the content since then and stays as it is.
 *
 * Per run, each source's diffed links (its rule checks) decide:
 *   - all unchanged, or changed with a "no-rule-change" triage verdict: the
 *     content (as far as the rules go) is the same, so `through` moves on;
 *   - any changed without that verdict, or a first run (no baseline yet):
 *     the content is new, so both restart at this run;
 *   - otherwise (a fetch error, or not in this run): nothing is known, and
 *     nothing moves. The next run still diffs against the last good snapshot.
 * A source first seen unchanged gets the date of that report as `since`: its
 * baseline is older, but the reports don't say how much older.
 *
 * Only sources a diff can vouch for are listed: every load-bearing link they
 * cite has `humanCheck: on-diff` in its playbook (docs/sources/). A link a
 * person must look at regardless (`periodic`, `manual-only`) can change in
 * ways no diff sees, e.g. EUR-Lex publishing a new consolidated version at a
 * new URL, so those sources keep the date of their last check by hand.
 */
export type Stability = { since: string; through: string };
export type StabilityIndex = { generatedAt: string; sources: Record<string, Stability> };

/** `<report date>|<region>|<rule check url>` for every diff triaged as no rule change. */
export function loadNoiseVerdicts(triageDir: string): Set<string> {
  const out = new Set<string>();
  if (!existsSync(triageDir)) return out;
  for (const file of readdirSync(triageDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.yml$/.test(f))) {
    const y = (parseYaml(readFileSync(join(triageDir, file), 'utf-8')) ?? {}) as {
      report?: unknown;
      items?: { region: string; url: string; verdict: string }[];
    };
    const report = y.report instanceof Date ? y.report.toISOString().slice(0, 10) : String(y.report ?? file.slice(0, 10));
    for (const i of y.items ?? []) if (i.verdict === 'no-rule-change') out.add(`${report}|${i.region}|${i.url}`);
  }
  return out;
}

/** Every dated report (YYYY-MM-DD.json) in a directory, oldest first. */
export function loadDatedReports(dir: string): [string, Report][] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .map((f) => [f.slice(0, 10), JSON.parse(readFileSync(join(dir, f), 'utf-8')) as Report]);
}

/**
 * `<region>.<key>` of every source whose load-bearing links a diff covers
 * (all `humanCheck: on-diff` in the region's playbook). A cited URL with no
 * playbook entry rules its source out.
 */
export function diffCoveredSources(playbooks: Playbook[], regions: Record<string, SourceRegion>): Set<string> {
  const out = new Set<string>();
  for (const [region, { sources }] of Object.entries(regions)) {
    const links = playbooks.find((p) => p.region === region)?.links;
    if (!links) continue;
    const ruledOut = new Set<string>();
    for (const cited of citedLinks(sources).values()) {
      const entry = entryFor(links, cited.url);
      if (entry && (!entry.loadBearing || entry.humanCheck === 'on-diff')) continue;
      for (const c of cited.links) ruledOut.add(c.key);
    }
    for (const key of Object.keys(sources)) if (!ruledOut.has(key)) out.add(`${region}.${key}`);
  }
  return out;
}

export function computeStability(reports: [string, Report][], noise: Set<string>, covered: Set<string>): StabilityIndex {
  const sources: Record<string, Stability> = {};
  for (const [date, report] of reports) {
    // Per source, this run's outcome over all its diffed links.
    const outcome = new Map<string, 'same' | 'new' | 'unknown'>();
    const merge = (id: string, o: 'same' | 'new' | 'unknown') => {
      const prev = outcome.get(id);
      outcome.set(id, prev === 'new' || o === 'new' ? 'new' : prev === 'unknown' || o === 'unknown' ? 'unknown' : 'same');
    };
    for (const region of report.regions) {
      for (const c of region.ruleChecks) {
        const o =
          c.status === 'unchanged' || (isChanged(c.status) && noise.has(`${date}|${region.region}|${c.url}`))
            ? 'same'
            : isChanged(c.status) || c.status === 'first-run'
              ? 'new'
              : 'unknown';
        for (const key of c.keys) if (covered.has(`${region.region}.${key}`)) merge(`${region.region}.${key}`, o);
      }
    }
    for (const [id, o] of outcome) {
      if (o === 'new') sources[id] = { since: date, through: date };
      else if (o === 'same') sources[id] = { since: sources[id]?.since ?? date, through: date };
    }
  }
  const sorted = Object.fromEntries(Object.keys(sources).sort().map((k) => [k, sources[k]]));
  return { generatedAt: reports.at(-1)?.[1].generatedAt ?? '', sources: sorted };
}

export function renderStability(index: StabilityIndex): string {
  return JSON.stringify(index, null, 1) + '\n';
}

/** stability.json's content from the reports, the triage verdicts, the playbooks and sources.ts. */
export function currentStability(reportsDir: string, triageDir: string): string {
  const covered = diffCoveredSources(loadPlaybooks(), SourceRegions as Record<string, SourceRegion>);
  return renderStability(computeStability(loadDatedReports(reportsDir), loadNoiseVerdicts(triageDir), covered));
}

/** Rewrites `<reportsDir>/stability.json`. */
export function writeStability(reportsDir: string, triageDir: string): string {
  const path = join(reportsDir, 'stability.json');
  writeFileSync(path, currentStability(reportsDir, triageDir), 'utf-8');
  return path;
}

