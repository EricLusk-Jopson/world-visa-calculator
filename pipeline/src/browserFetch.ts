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

/** Matches Imperva Incapsula's block page ("Request unsuccessful. Incapsula incident ID: …"). */
export const INCAPSULA_BLOCK = /Incapsula incident ID:?\s*([\d-]+)/i;

async function launch(): Promise<Browser> {
  const { chromium } = await import('playwright');
  return chromium.launch();
}

async function load(url: string, timeoutMs: number): Promise<FetchOutcome> {
  browser ??= launch();
  let b: Browser;
  try {
    b = await browser;
  } catch (err) {
    browser = undefined;
    const message = (err as Error).message.split('\n')[0];
    const fix = /Cannot find (package|module) 'playwright'/.test(message)
      ? '`npm install`, then `npx playwright install chromium`'
      : '`npx playwright install chromium`';
    return { status: 'blocked', error: `headless browser unavailable (${message}); run ${fix} in pipeline/` };
  }
  const context = await b.newContext({ locale: 'en-US' });
  try {
    const page = await context.newPage();
    const res = await page.goto(url, { waitUntil: 'load', timeout: timeoutMs });
    const html = await page.content();
    const httpStatus = res?.status();
    const contentType = res?.headers()['content-type'] ?? 'text/html';
    const incident = INCAPSULA_BLOCK.exec(html)?.[1];
    if (incident) {
      return { status: 'blocked', httpStatus, finalUrl: page.url(), contentType, error: `Imperva Incapsula block page in a headless browser too (incident ${incident})` };
    }
    if (!res || !res.ok()) return { status: 'broken', httpStatus, finalUrl: page.url(), contentType };
    return { status: 'live', httpStatus, finalUrl: page.url(), contentType, body: Buffer.from(html) };
  } catch (err) {
    return { status: 'broken', error: `headless browser: ${(err as Error).message.split('\n')[0]}` };
  } finally {
    await context.close();
  }
}

export function fetchWithBrowser(url: string, timeoutMs = 45_000): Promise<FetchOutcome> {
  const run = queue.then(() => load(url, timeoutMs));
  queue = run.catch(() => undefined);
  return run;
}

/** Closes the run's browser, if one was started. */
export async function closeBrowser(): Promise<void> {
  const b = browser;
  browser = undefined;
  if (b) await (await b.catch(() => undefined))?.close();
}
