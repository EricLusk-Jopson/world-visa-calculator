import { fetch as undiciFetch } from 'undici';
import { fetchWithBrowser, incapsulaInterstitial } from './browserFetch';
import { chainCompletingAgent, isIncompleteChainError } from './tlsChain';
import type { LinkHealthStatus } from './types';

const USER_AGENT =
  'EuroVisaCalculator-SourceMonitor/1.0 (+https://eurovisacalculator.com; monthly source check)';
const TIMEOUT_MS = 30_000;
/** Waits before each retry of a transient failure (network, timeout, 429, 5xx). */
const RETRY_DELAYS_MS = [2_000, 6_000];

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

/**
 * Redirect targets that mean "this site is down", not "the page moved".
 * While EUR-Lex is "temporarily not fully available" it sends every visitor,
 * people included, to its Official Journal homepage (keeping the requested
 * ?uri= in the query string). The link itself is right, but nobody can
 * reach the document, so it's reported broken with the outage as the reason.
 */
const OUTAGE_LANDINGS: { host: string; path: RegExp; reason: string }[] = [
  {
    host: 'eur-lex.europa.eu',
    path: /^\/TodayOJ\//,
    reason: 'EUR-Lex temporarily unavailable: redirected to its Official Journal fallback page',
  },
];

function outageReason(finalUrl: string): string | undefined {
  try {
    const u = new URL(finalUrl);
    return OUTAGE_LANDINGS.find((o) => o.host === u.host && o.path.test(u.pathname))?.reason;
  } catch {
    return undefined;
  }
}

/**
 * A 2xx with no page is how WAF JavaScript challenges answer (AWS WAF uses
 * 202), but some sites in a degraded mode answer the same way, so it's
 * reported as blocked (unverified) rather than as either.
 */
function blockedReason(httpStatus: number, headers: Headers): string | undefined {
  if (httpStatus === 202) return 'HTTP 202 with no page: bot-protection challenge or site in degraded mode';
  // A public government page answering 403 is refusing *us* (datacenter IP,
  // non-browser client), not saying the page is gone — people can still open it.
  if (httpStatus === 403) {
    const server = headers.get('server');
    const challenge = headers.get('cf-mitigated') === 'challenge' ? ', Cloudflare challenge' : '';
    return `HTTP 403: site refused automated access${server ? ` (server: ${server}${challenge})` : ''}`;
  }
  return undefined;
}

/**
 * Request headers for sites that need more than the defaults. The Bosnia and
 * Herzegovina MFA site sits behind a reverse proxy that turns away clients
 * that don't look like a browser, and its subpage API answers JSON. The North
 * Macedonia MFA site gets the same browser-style agent as a precaution. The
 * Georgia consulate's content API answers in the language its own site asks
 * for (Georgian by default), so it is asked for English.
 */
export const BROWSER_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 ' + USER_AGENT;

const SITE_HEADERS: { host: string; path?: RegExp; headers: Record<string, string> }[] = [
  { host: 'www.mvp.gov.ba', headers: { 'User-Agent': BROWSER_USER_AGENT } },
  { host: 'mfa.gov.mk', headers: { 'User-Agent': BROWSER_USER_AGENT } },
  { host: 'www.mvp.gov.ba', path: /^\/api\//, headers: { Accept: 'application/json' } },
  { host: 'gc-api.mfa.gov.ge', headers: { Accept: 'application/json', 'Accept-Language': 'en' } },
];

function siteHeaders(url: string): Record<string, string> {
  try {
    const u = new URL(url);
    return Object.assign(
      {},
      ...SITE_HEADERS.filter((s) => s.host === u.host && (!s.path || s.path.test(u.pathname))).map((s) => s.headers),
    );
  } catch {
    return {};
  }
}

function isRetryable(outcome: FetchOutcome): boolean {
  if (outcome.httpStatus === undefined) return true; // network error / timeout
  return outcome.httpStatus === 429 || outcome.httpStatus >= 500;
}

/**
 * undici reports every network failure as "fetch failed"; the useful part
 * (ECONNRESET, UND_ERR_CONNECT_TIMEOUT, ENOTFOUND, …) is on err.cause.
 */
function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause = err.cause as { code?: string; message?: string } | undefined;
  const detail = cause?.code ?? cause?.message;
  return detail && !err.message.includes(detail) ? `${err.message} (${detail})` : err.message;
}

/**
 * fetch(), retried with the server's missing intermediate certificates when
 * it sent an incomplete chain (see tlsChain.ts).
 */
const incompleteChainHosts = new Set<string>();

async function request(url: string, init: RequestInit): Promise<Response> {
  const host = new URL(url).host;
  if (!incompleteChainHosts.has(host)) {
    try {
      return await fetch(url, init);
    } catch (err) {
      if (!isIncompleteChainError(err)) throw err;
      incompleteChainHosts.add(host);
    }
  }
  const { agent: dispatcher, reason } = await chainCompletingAgent(url);
  if (!dispatcher) {
    throw new Error(`incomplete certificate chain; could not fetch the missing intermediate: ${reason}`, {
      cause: { code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' },
    });
  }
  return (await undiciFetch(url, { ...(init as object), dispatcher })) as unknown as Response;
}

async function fetchOnce(url: string, wantBody: boolean): Promise<FetchOutcome> {
  try {
    const res = await request(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        // Cellar (publications.europa.eu/resource/celex/…) picks the language
        // version from this; without it a work URI may answer 300 Multiple Choices.
        'Accept-Language': 'en',
        ...siteHeaders(url),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const finalUrl = res.url || url;
    const contentType = res.headers.get('content-type') ?? '';
    const blocked = blockedReason(res.status, res.headers);
    if (blocked) {
      await res.body?.cancel();
      return { status: 'blocked', httpStatus: res.status, finalUrl, contentType, error: blocked };
    }
    if (!res.ok) {
      await res.body?.cancel();
      return { status: 'broken', httpStatus: res.status, finalUrl, contentType };
    }
    const outage = outageReason(finalUrl);
    if (outage) {
      await res.body?.cancel();
      return { status: 'broken', httpStatus: res.status, finalUrl, contentType, error: outage };
    }
    // Imperva Incapsula answers a client it turns away with 200 and a short
    // block or challenge page; its responses carry X-Iinfo, so only those
    // (and bodies read anyway) are checked.
    const imperva = res.headers.has('x-iinfo') || /imperva|incapsula/i.test(res.headers.get('x-cdn') ?? '');
    const body = wantBody || imperva ? Buffer.from(await res.arrayBuffer()) : undefined;
    if (!body) await res.body?.cancel();
    const interstitial = body ? incapsulaInterstitial(body.toString('utf-8')) : undefined;
    if (interstitial) {
      return { status: 'blocked', httpStatus: res.status, finalUrl, contentType, error: `HTTP ${res.status} with an ${interstitial.detail}` };
    }
    const status: LinkHealthStatus = normalizeUrl(finalUrl) !== normalizeUrl(url) ? 'redirected' : 'live';
    return { status, httpStatus: res.status, finalUrl, contentType, body: wantBody ? body : undefined };
  } catch (err) {
    return { status: 'broken', error: describeError(err) };
  }
}

/**
 * Hosts whose bot protection turns away every plain HTTP client, so a
 * blocked response is retried in headless Chromium (see browserFetch.ts).
 * The Albania MFA site is behind Imperva Incapsula; its old Playwright
 * scraper read it fine.
 */
export const BROWSER_FALLBACK_HOSTS = new Set(['punetejashtme.gov.al']);

/**
 * GET with a timeout, retrying transient failures (network, 429, 5xx) with
 * backoff, and blocked responses from BROWSER_FALLBACK_HOSTS in a browser.
 */
export async function fetchPage(url: string, wantBody: boolean): Promise<FetchOutcome> {
  let outcome = await fetchOnce(url, wantBody);
  for (const delay of RETRY_DELAYS_MS) {
    if (outcome.status !== 'broken' || !isRetryable(outcome)) break;
    await new Promise((r) => setTimeout(r, delay));
    outcome = await fetchOnce(url, wantBody);
  }
  if (outcome.status === 'blocked' && BROWSER_FALLBACK_HOSTS.has(hostOf(url))) {
    const viaBrowser = await fetchWithBrowser(url);
    if (viaBrowser.status !== 'blocked' && viaBrowser.status !== 'broken') return viaBrowser;
    return { ...viaBrowser, error: `${outcome.error}; ${viaBrowser.error ?? `headless browser: HTTP ${viaBrowser.httpStatus}`}` };
  }
  return outcome;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

/** Returns a function that runs tasks with at most `limit` in flight. */
export function createLimiter(limit: number): <T>(task: () => Promise<T>) => Promise<T> {
  let active = 0;
  const queue: (() => void)[] = [];
  return async (task) => {
    // A finishing task hands its slot straight to the next waiter, so a new
    // caller can never slip in between and push `active` past the limit.
    if (active >= limit) await new Promise<void>((resolve) => queue.push(resolve));
    else active++;
    try {
      return await task();
    } finally {
      const next = queue.shift();
      if (next) next();
      else active--;
    }
  };
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

/**
 * What came back instead of the expected page, for an error message: its
 * size, type, final URL when redirected, and title or opening text, e.g.
 * `2 KB text/html, title "Just a moment..."`.
 */
export function describeResponse(outcome: Pick<FetchOutcome, 'body' | 'contentType' | 'finalUrl'>, requestedUrl?: string): string {
  const parts: string[] = [];
  const body = outcome.body?.toString('utf-8') ?? '';
  parts.push(`${body.length < 1024 ? `${body.length} bytes` : `${Math.round(body.length / 1024)} KB`} ${outcome.contentType || 'no content type'}`);
  if (outcome.finalUrl && requestedUrl && outcome.finalUrl !== requestedUrl) parts.push(`from ${outcome.finalUrl}`);
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1].replace(/\s+/g, ' ').trim();
  const opening = body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (title) parts.push(`title ${JSON.stringify(title.slice(0, 100))}`);
  else if (opening) parts.push(`starting ${JSON.stringify(opening.slice(0, 100))}`);
  else if (body) parts.push(`starting ${JSON.stringify(body.slice(0, 100))}`);
  return parts.join(', ');
}
