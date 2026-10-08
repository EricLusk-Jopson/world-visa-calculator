import type { LinkHealthStatus } from './types';

const USER_AGENT =
  'EuroVisaCalculator-SourceMonitor/1.0 (+https://eurovisacalculator.com; monthly source check)';
const TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 3_000;

export type FetchOutcome = {
  status: LinkHealthStatus;
  httpStatus?: number;
  finalUrl?: string;
  error?: string;
  contentType?: string;
  /** Only populated when the caller asked for the body and the response was OK. */
  body?: Buffer;
};

/**
 * fetch() normalizes the URL it reports (drops the #fragment, adds "/" to a
 * bare origin), so compare normalized forms — neither is a real redirect.
 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    return u.href;
  } catch {
    return url;
  }
}

function isRetryable(outcome: FetchOutcome): boolean {
  if (outcome.httpStatus === undefined) return true; // network error / timeout
  return outcome.httpStatus === 429 || outcome.httpStatus >= 500;
}

async function fetchOnce(url: string, wantBody: boolean): Promise<FetchOutcome> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const finalUrl = res.url || url;
    const contentType = res.headers.get('content-type') ?? '';
    if (!res.ok) {
      await res.body?.cancel();
      return { status: 'broken', httpStatus: res.status, finalUrl, contentType };
    }
    const body = wantBody ? Buffer.from(await res.arrayBuffer()) : undefined;
    if (!wantBody) await res.body?.cancel();
    const status: LinkHealthStatus = normalizeUrl(finalUrl) !== normalizeUrl(url) ? 'redirected' : 'live';
    return { status, httpStatus: res.status, finalUrl, contentType, body };
  } catch (err) {
    return { status: 'broken', error: err instanceof Error ? err.message : String(err) };
  }
}

/** GET with a timeout and one retry for transient failures (network, 429, 5xx). */
export async function fetchPage(url: string, wantBody: boolean): Promise<FetchOutcome> {
  const first = await fetchOnce(url, wantBody);
  if (first.status !== 'broken' || !isRetryable(first)) return first;
  await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
  return fetchOnce(url, wantBody);
}

/** Runs `fn` over `items` with at most `limit` in flight, preserving order. */
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
