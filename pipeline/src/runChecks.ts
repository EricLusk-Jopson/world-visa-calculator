import { compareSnapshots, extractSnapshot } from './contentCheck';
import { fetchPage, mapWithConcurrency, type FetchOutcome } from './fetchPage';
import { readSnapshot, writeSnapshot } from './snapshotStore';
import type { RegionReport } from './report';
import type { LinkHealthResult, PipelineSourceDoc, RuleCheckResult, SourceField, UrlUsage } from './types';

export type RegionSources = Record<string, Record<string, PipelineSourceDoc>>;

export type RunOptions = {
  snapshotDir: string;
  concurrency?: number;
  log?: (message: string) => void;
};

/**
 * Runs link health + content diffing over every region in one pass.
 *
 * Every unique URL across all regions is fetched exactly once — Bosnia,
 * Kosovo, North Macedonia and Albania each cite one page from ~100–200
 * entries, and Schengen/UK parent pages are shared across keys. When a URL
 * is also a parse target, the same response body feeds the content diff,
 * so a run makes one request per URL rather than one per field per key.
 */
export async function runChecks(regions: RegionSources, options: RunOptions): Promise<RegionReport[]> {
  const { snapshotDir, concurrency = 6, log = () => {} } = options;

  // region -> url -> usages, preserving sources.ts order for the report.
  const healthUsages = new Map<string, Map<string, UrlUsage[]>>();
  // region -> parse url -> keys
  const parseKeys = new Map<string, Map<string, string[]>>();
  const parseUrls = new Set<string>();
  const allUrls = new Set<string>();

  for (const [region, sources] of Object.entries(regions)) {
    const byUrl = new Map<string, UrlUsage[]>();
    const parseByUrl = new Map<string, string[]>();
    for (const [key, doc] of Object.entries(sources)) {
      for (const field of ['directUrl', 'parentUrl'] as const satisfies SourceField[]) {
        const url = doc[field];
        if (!byUrl.has(url)) byUrl.set(url, []);
        byUrl.get(url)!.push({ key, field });
        allUrls.add(url);
      }
      if (doc.parseForRules) {
        const url = doc[doc.parseField ?? 'directUrl'];
        if (!parseByUrl.has(url)) parseByUrl.set(url, []);
        parseByUrl.get(url)!.push(key);
        parseUrls.add(url);
      }
    }
    healthUsages.set(region, byUrl);
    parseKeys.set(region, parseByUrl);
  }

  log(`Fetching ${allUrls.size} unique URLs (${parseUrls.size} parsed for content)...`);
  const urls = [...allUrls];
  let done = 0;
  const outcomes = await mapWithConcurrency(urls, concurrency, async (url) => {
    const outcome = await fetchPage(url, parseUrls.has(url));
    done++;
    if (done % 50 === 0 || done === urls.length) log(`  ${done}/${urls.length}`);
    return outcome;
  });
  const outcomeByUrl = new Map<string, FetchOutcome>(urls.map((url, i) => [url, outcomes[i]]));

  // Content diff once per URL, shared by every region/key that cites it.
  const ruleByUrl = new Map<string, Omit<RuleCheckResult, 'keys'>>();
  for (const url of parseUrls) {
    const outcome = outcomeByUrl.get(url)!;
    if (!outcome.body) {
      ruleByUrl.set(url, {
        url,
        status: 'fetch-error',
        error: outcome.error ?? (outcome.httpStatus ? `HTTP ${outcome.httpStatus}` : 'no response body'),
      });
      continue; // keep the previous snapshot as the baseline
    }
    const current = extractSnapshot(outcome.body, outcome.contentType ?? '', url);
    const previous = readSnapshot(snapshotDir, url);
    writeSnapshot(snapshotDir, current);
    ruleByUrl.set(url, {
      url,
      previousUpdatedAt: previous?.updatedAt,
      currentUpdatedAt: current.updatedAt,
      ...compareSnapshots(previous, current),
    });
  }

  const reports: RegionReport[] = [];
  for (const region of Object.keys(regions)) {
    const linkHealth: LinkHealthResult[] = [...healthUsages.get(region)!].map(([url, usedBy]) => {
      const { status, httpStatus, finalUrl, error } = outcomeByUrl.get(url)!;
      return { url, usedBy, status, httpStatus, finalUrl, error };
    });
    const ruleChecks: RuleCheckResult[] = [...parseKeys.get(region)!].map(([url, keys]) => ({
      ...ruleByUrl.get(url)!,
      keys,
    }));
    reports.push({ region, linkHealth, ruleChecks });
  }
  return reports;
}
