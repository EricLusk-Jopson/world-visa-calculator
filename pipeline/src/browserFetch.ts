import type { FetchOutcome } from './fetchPage';

/**
 * A GET through headless Chromium, for sites whose bot protection turns away
 * every plain HTTP client whatever its headers (punetejashtme.gov.al sits
 * behind Imperva Incapsula). The page is loaded as a browser would, scripts
 * and all, and its HTML read back from the DOM; inline scripts keep their
 * source text, so a parser reading them sees what the server sent.
 *
 * Playwright is loaded only when this runs, so the rest of the pipeline
 * works without a browser installed. One page at a time, one browser per
 * run, closed by closeBrowser().
 */

type Browser = import('playwright').Browser;

let browser: Promise<Browser> | undefined;
let queue: Promise<unknown> = Promise.resolve();

/** Imperva Incapsula's block page: "Request unsuccessful. Incapsula incident ID: …". */
const INCAPSULA_BLOCK = /Incapsula incident ID:?\s*([\d-]+)/i;
/**
 * Imperva Incapsula's JavaScript challenge: a near-empty page whose script
 * sets a cookie and reloads. (Real pages behind Incapsula can carry the same
 * script, so only a short page counts.)
 */
const INCAPSULA_CHALLENGE = /<script[^>]+src="\/_Incapsula_Resource\?/i;

/**
 * What an Incapsula interstitial says instead of the page, or undefined for
 * a real page: `block` when it refused outright, `challenge` when a browser
 * would run its script and get the page.
 */
export function incapsulaInterstitial(html: string): { kind: 'block' | 'challenge'; detail: string } | undefined {
  if (html.length > 16_384) return undefined;
  const incident = INCAPSULA_BLOCK.exec(html)?.[1];
  if (incident) return { kind: 'block', detail: `Imperva Incapsula block page (incident ${incident})` };
  if (html.length < 4_096 && INCAPSULA_CHALLENGE.test(html)) return { kind: 'challenge', detail: 'Imperva Incapsula JavaScript challenge' };
  return undefined;
}

/** How long a scripted page gets to finish its requests after load. */
const NETWORK_IDLE_WAIT_MS = 15_000;

/** How long a browser gets to clear a challenge before the page counts as blocked. */
const CHALLENGE_WAIT_MS = 20_000;

/**
 * Playwright's own Chromium build when it's installed, else the machine's
 * Chrome or Edge (every Windows install has Edge), so a run works even when
 * `playwright install` fetched a build for another Playwright version.
 */
async function launch(): Promise<Browser> {
  const { chromium } = await import('playwright');
  const tried: string[] = [];
  for (const channel of [undefined, 'chrome', 'msedge']) {
    try {
      return await chromium.launch(channel ? { channel } : {});
    } catch (err) {
      tried.push(`${channel ?? 'Playwright Chromium'}: ${(err as Error).message.split('\n')[0]}`);
    }
  }
  throw new Error(tried.join('; '));
}

export interface BrowserFetchOptions {
  timeoutMs?: number;
  /**
   * When a load counts as done: 'load' for server-rendered pages,
   * 'networkidle' for pages that fetch their content with scripts after load
   * (waited for at most NETWORK_IDLE_WAIT_MS).
   */
  waitUntil?: 'load' | 'networkidle';
  /** Replaces headless Chromium's own "HeadlessChrome" User-Agent. */
  userAgent?: string;
}

/** The page's title and opening text, to say what came back instead of the page. */
async function describePage(page: import('playwright').Page): Promise<string> {
  const title = (await page.title().catch(() => '')).trim();
  const text = ((await page.evaluate(() => document.body?.innerText ?? '').catch(() => '')) as string).replace(/\s+/g, ' ').trim();
  return [title && `title "${title}"`, text && `text "${text.slice(0, 160)}"`].filter(Boolean).join(', ') || 'empty page';
}

async function load(url: string, { timeoutMs = 45_000, waitUntil = 'load', userAgent }: BrowserFetchOptions): Promise<FetchOutcome> {
  browser ??= launch();
  let b: Browser;
  try {
    b = await browser;
  } catch (err) {
    browser = undefined;
    const message = (err as Error).message;
    const fix = /Cannot find (package|module) 'playwright'/.test(message)
      ? '`npm install`, then `npm exec playwright install chromium`'
      : '`npm exec playwright install chromium` (it fetches the build this Playwright version expects)';
    return { status: 'blocked', error: `headless browser unavailable (${message}); run ${fix} in pipeline/, or install Chrome or Edge` };
  }
  const context = await b.newContext({ locale: 'en-US', ...(userAgent ? { userAgent } : {}) });
  try {
    const page = await context.newPage();
    let res = await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    // Scripted content: give requests started after load time to finish. A
    // site that never goes quiet (polling, analytics) is read as it stands.
    if (waitUntil === 'networkidle') await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_WAIT_MS }).catch(() => undefined);
    let html = await page.content();
    // A challenge's script sets a cookie and reloads; wait for the real page,
    // reloading once ourselves halfway through in case the script doesn't.
    const deadline = Date.now() + CHALLENGE_WAIT_MS;
    let reloaded = false;
    while (incapsulaInterstitial(html)?.kind === 'challenge' && Date.now() < deadline) {
      await page.waitForTimeout(1_000);
      if (!reloaded && Date.now() > deadline - CHALLENGE_WAIT_MS / 2) {
        reloaded = true;
        res = (await page.reload({ waitUntil: 'load', timeout: timeoutMs })) ?? res;
      } else {
        await page.waitForLoadState('load').catch(() => undefined);
      }
      html = await page.content().catch(() => html); // mid-navigation reads can throw
    }
    const httpStatus = res?.status();
    const contentType = res?.headers()['content-type'] ?? 'text/html';
    const interstitial = incapsulaInterstitial(html);
    if (interstitial) {
      const still = interstitial.kind === 'challenge' ? ` not cleared after ${CHALLENGE_WAIT_MS / 1000} s` : '';
      return { status: 'blocked', httpStatus, finalUrl: page.url(), contentType, error: `${interstitial.detail}${still} in a headless browser too` };
    }
    if (!res || !res.ok()) {
      return { status: 'broken', httpStatus, finalUrl: page.url(), contentType, error: `headless browser: HTTP ${httpStatus ?? 'no response'} (${await describePage(page)})` };
    }
    return { status: 'live', httpStatus, finalUrl: page.url(), contentType, body: Buffer.from(html) };
  } catch (err) {
    return { status: 'broken', error: `headless browser: ${(err as Error).message.split('\n')[0]}` };
  } finally {
    await context.close();
  }
}

export function fetchWithBrowser(url: string, options: BrowserFetchOptions = {}): Promise<FetchOutcome> {
  const run = queue.then(() => load(url, options));
  queue = run.catch(() => undefined);
  return run;
}

/** Closes the run's browser, if one was started. */
export async function closeBrowser(): Promise<void> {
  const b = browser;
  browser = undefined;
  if (b) await (await b.catch(() => undefined))?.close();
}
