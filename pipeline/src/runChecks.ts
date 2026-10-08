import { compareSnapshots, extractSnapshot } from './contentCheck';
import { createLimiter, fetchPage, mapWithConcurrency, type FetchOutcome } from './fetchPage';
import { readSnapshot, writeSnapshot } from './snapshotStore';
import type { RegionReport } from './report';
import type { LinkHealthResult, LinkPath, RuleCheckResult, SourceDoc, SourceLink, UrlUsage } from './types';

export type RegionSources = Record<string, Record<string, SourceDoc>>;

/** Every link on a SourceDoc, alternates included, with its path. */
function linksOf(doc: SourceDoc): { path: LinkPath; link: SourceLink }[] {
  const out: { path: LinkPath; link: SourceLink }[] = [];
  const walk = (path: LinkPath, link: SourceLink) => {
    out.push({ path, link });
    if (link.alternate) walk(`${path}.alternate`, link.alternate);
  };
  walk('direct', doc.direct);
  walk('parent', doc.parent);
  return out;
}

export type RunOptions = {
  snapshotDir: string;
  /** Requests in flight across all hosts. */
  concurrency?: number;
  /** Requests in flight to any one host — Serbia alone is ~195 pages on mfa.gov.rs. */
  perHostConcurrency?: number;
  /** Pause between requests in the recheck pass for URLs that failed. */
  recheckDelayMs?: number;
  log?: (message: string) => void;
};

/**
 * Runs link health + content diffing over every region in one pass.
 *
 * Every unique URL across all regions is fetched exactly once — Bosnia,
 * Kosovo, North Macedonia and Albania each cite one page from ~100–200
 * entries, and Schengen/UK parent pages are shared across keys. When a URL
 * is also a diff target (`checkDiff: true`), the same response body feeds
 * the content diff, so a run makes one request per URL rather than one per
 * link per key. Every link is health-checked, alternates included.
 */
export async function runChecks(regions: RegionSources, options: RunOptions): Promise<RegionReport[]> {
  const { snapshotDir, concurrency = 8, perHostConcurrency = 2, recheckDelayMs = 1_000, log = () => {} } = options;

  // region -> url -> usages, preserving sources.ts order for the report.
  const healthUsages = new Map<string, Map<string, UrlUsage[]>>();
  // region -> diff url -> keys + which link path
  const parseKeys = new Map<string, Map<string, { keys: string[]; link: LinkPath }>>();
  const parseUrls = new Set<string>();
  const allUrls = new Set<string>();

  for (const [region, sources] of Object.entries(regions)) {
    const byUrl = new Map<string, UrlUsage[]>();
    const parseByUrl = new Map<string, { keys: string[]; link: LinkPath }>();
    for (const [key, doc] of Object.entries(sources)) {
      for (const { path, link } of linksOf(doc)) {
        const { url } = link;
        if (!byUrl.has(url)) byUrl.set(url, []);
        byUrl.get(url)!.push({ key, field: path });
        allUrls.add(url);
        if (link.checkDiff) {
          if (!parseByUrl.has(url)) parseByUrl.set(url, { keys: [], link: path });
          const entry = parseByUrl.get(url)!;
          if (!entry.keys.includes(key)) entry.keys.push(key);
          parseUrls.add(url);
        }
      }
    }
    healthUsages.set(region, byUrl);
    parseKeys.set(region, parseByUrl);
  }

  log(`Fetching ${allUrls.size} unique URLs (${parseUrls.size} diffed for content)...`);
  const urls = interleaveByHost([...allUrls]);
  const hostLimiters = new Map<string, ReturnType<typeof createLimiter>>();
  const limiterFor = (url: string) => {
    const host = hostOf(url);
    if (!hostLimiters.has(host)) hostLimiters.set(host, createLimiter(perHostConcurrency));
    return hostLimiters.get(host)!;
  };
  let done = 0;
  const outcomes = await mapWithConcurrency(urls, concurrency, async (url) => {
    const outcome = await limiterFor(url)(() => fetchPage(url, parseUrls.has(url)));
    done++;
    if (done % 50 === 0 || done === urls.length) log(`  ${done}/${urls.length}`);
    return outcome;
  });
  const outcomeByUrl = new Map<string, FetchOutcome>(urls.map((url, i) => [url, outcomes[i]]));

  // Recheck pass: a slow or dropped connection mid-sweep shouldn't be
  // reported as a dead link. Every failure is retried once more, one request
  // at a time, and only reported broken if it fails again. Blocked responses
  // get the same second chance — a challenge can be rate-based.
  const failed = urls.filter((url) => ['broken', 'blocked'].includes(outcomeByUrl.get(url)!.status));
  if (failed.length > 0) {
    log(`Rechecking ${failed.length} failed URL${failed.length === 1 ? '' : 's'} one at a time...`);
    let recovered = 0;
    for (const url of failed) {
      await new Promise((r) => setTimeout(r, recheckDelayMs));
      const retry = await fetchPage(url, parseUrls.has(url));
      if (retry.status === 'live' || retry.status === 'redirected') recovered++;
      outcomeByUrl.set(url, retry);
    }
    log(`  ${recovered} recovered, ${failed.length - recovered} still failing`);
  }

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
    if (current.text === '') {
      // Bot-check interstitials and script-rendered shells parse to nothing;
      // saving one as the baseline would make next month's run "change".
      ruleByUrl.set(url, { url, status: 'fetch-error', error: 'no text extracted (bot-check or script-rendered page?)' });
      continue;
    }
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
    const ruleChecks: RuleCheckResult[] = [...parseKeys.get(region)!].map(([url, { keys, link }]) => ({
      ...ruleByUrl.get(url)!,
      keys,
      link,
    }));
    reports.push({ region, linkHealth, ruleChecks });
  }
  return reports;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * Round-robins URLs across hosts so the sweep spreads load instead of
 * working through one host's ~200 pages back to back.
 */
function interleaveByHost(urls: string[]): string[] {
  const byHost = new Map<string, string[]>();
  for (const url of urls) {
    const host = hostOf(url);
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host)!.push(url);
  }
  const queues = [...byHost.values()];
  const result: string[] = [];
  for (let i = 0; result.length < urls.length; i++) {
    for (const q of queues) if (i < q.length) result.push(q[i]);
  }
  return result;
}
