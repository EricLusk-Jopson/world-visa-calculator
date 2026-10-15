import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { closeBrowser } from './browserFetch';
import { BROWSER_FALLBACK_HOSTS, BROWSER_RENDER_HOSTS, fetchPage } from './fetchPage';

async function canLaunchBrowser(): Promise<boolean> {
  try {
    const { chromium } = await import('playwright');
    await (await chromium.launch()).close();
    return true;
  } catch {
    return false;
  }
}

const BLOCK_PAGE =
  '<html style="height:100%"><head><META NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW"></head><body style="margin:0px;height:100%">' +
  '<iframe id="main-iframe" src="/_Incapsula_Resource?CWUDNSAI=24&xinfo=1" frameborder=0 width="100%" height="100%">' +
  'Request unsuccessful. Incapsula incident ID: 1024000101839927124-1100419961886605998</iframe></body></html>';

/**
 * Like punetejashtme.gov.al behind Imperva Incapsula: a 200 block page with
 * an X-Iinfo header for the pipeline's own HTTP client, the real page for a
 * browser.
 */
describe('Incapsula block pages', () => {
  let server: Server;
  let url: string;

  before(async () => {
    server = createServer((req, res) => {
      res.setHeader('X-Iinfo', '7-123-0 NNNN CT(0 0 0) RT(0 0) q(0 0 0 -1) r(0 -1)');
      res.setHeader('content-type', 'text/html');
      if (/SourceMonitor/.test(req.headers['user-agent'] ?? '')) res.end(BLOCK_PAGE);
      else res.end('<html><head><title>Visa regime</title></head><body><main><p>Visa regime for foreign citizens</p></main></body></html>');
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/en/page/`;
  });

  after(async () => {
    BROWSER_FALLBACK_HOSTS.delete(new URL(url).host);
    await closeBrowser();
    server.close();
  });

  it('reports the block page as blocked, not live', async () => {
    const outcome = await fetchPage(url, false);
    assert.equal(outcome.status, 'blocked');
    assert.match(outcome.error ?? '', /Imperva Incapsula block page \(incident 1024000101839927124-1100419961886605998\)/);
  });

  it('reads the page in a headless browser on a fallback host', async (t) => {
    if (!(await canLaunchBrowser())) return t.skip('no Playwright Chromium installed');
    BROWSER_FALLBACK_HOSTS.add(new URL(url).host);
    const outcome = await fetchPage(url, true);
    assert.equal(outcome.status, 'live', outcome.error);
    assert.match(outcome.body?.toString() ?? '', /Visa regime for foreign citizens/);
  });
});

/**
 * Incapsula's JavaScript challenge: a near-empty page whose script sets a
 * cookie and reloads into the real page. Only a browser gets through.
 */
describe('Incapsula JavaScript challenge', () => {
  let server: Server;
  let url: string;
  const CHALLENGE =
    '<html>\r\n<head>\r\n<META NAME="robots" CONTENT="noindex,nofollow">\r\n' +
    '<script src="/_Incapsula_Resource?SWJIYLWA=719d34d31c8e3a6e6fffd425f7e032f3">\r\n</script>\r\n<body>\r\n</body></html>';

  before(async () => {
    server = createServer((req, res) => {
      res.setHeader('X-Iinfo', '7-123-0 NNNN CT(0 0 0) RT(0 0) q(0 0 0 -1) r(0 -1)');
      if (req.url?.startsWith('/_Incapsula_Resource')) {
        res.setHeader('content-type', 'application/javascript');
        res.end('document.cookie = "incap_ses_1=ok; path=/"; setTimeout(() => location.reload(), 200);');
        return;
      }
      res.setHeader('content-type', 'text/html');
      if (/incap_ses_1=ok/.test(req.headers.cookie ?? '')) res.end('<html><body><main><p>Visa regime for foreign citizens</p></main></body></html>');
      else res.end(CHALLENGE);
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/en/page/`;
  });

  after(async () => {
    BROWSER_FALLBACK_HOSTS.delete(new URL(url).host);
    await closeBrowser();
    server.close();
  });

  it('reports the challenge page as blocked, not live', async () => {
    const outcome = await fetchPage(url, true);
    assert.equal(outcome.status, 'blocked');
    assert.match(outcome.error ?? '', /HTTP 200 with an Imperva Incapsula JavaScript challenge/);
  });

  it('waits in the browser for the challenge to reload into the page', async (t) => {
    if (!(await canLaunchBrowser())) return t.skip('no Playwright Chromium installed');
    BROWSER_FALLBACK_HOSTS.add(new URL(url).host);
    const outcome = await fetchPage(url, true);
    assert.equal(outcome.status, 'live', outcome.error);
    assert.match(outcome.body?.toString() ?? '', /Visa regime for foreign citizens/);
  });
});


/**
 * Like geoconsul.gov.ge: the server sends a shell, and a script fetches the
 * content after load. A plain GET sees only the shell.
 */
describe('Script-rendered pages', () => {
  let server: Server;
  let url: string;
  const SHELL =
    '<html><body><header><p>Ministry Of Foreign Affairs</p></header><main id="app"></main>' +
    '<script>setTimeout(() => fetch("/api/page").then((r) => r.text()).then((t) => { document.getElementById("app").innerHTML = t; }), 300);</script>' +
    '</body></html>';

  before(async () => {
    server = createServer((req, res) => {
      res.setHeader('content-type', 'text/html');
      const ua = req.headers['user-agent'] ?? '';
      // Refuses headless Chromium's own User-Agent, and on /broken any browser
      // (the pipeline's plain GET doesn't claim to be Chrome).
      if (/HeadlessChrome/.test(ua) || (req.url?.startsWith('/broken') && /Chrome\//.test(ua))) {
        res.statusCode = 500;
        res.end('<html><head><title>Server Error</title></head><body><p>Runtime Error</p></body></html>');
      } else if (req.url === '/api/page') setTimeout(() => res.end('<p>Visa-free countries: Andorra</p>'), 300);
      else res.end(SHELL);
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    url = `http://127.0.0.1:${(server.address() as AddressInfo).port}/en/HtmlPage/html/View?id=25`;
  });

  after(async () => {
    BROWSER_RENDER_HOSTS.delete(new URL(url).host);
    await closeBrowser();
    server.close();
  });

  it('gets only the shell from a plain GET', async () => {
    const outcome = await fetchPage(url, true);
    assert.equal(outcome.status, 'live');
    assert.doesNotMatch(outcome.body?.toString() ?? '', /Andorra/);
  });

  it('renders the page in a browser on a render host when the body is wanted', async (t) => {
    if (!(await canLaunchBrowser())) return t.skip('no Playwright Chromium installed');
    BROWSER_RENDER_HOSTS.add(new URL(url).host);
    const outcome = await fetchPage(url, true);
    assert.equal(outcome.status, 'live', outcome.error);
    assert.match(outcome.body?.toString() ?? '', /Visa-free countries: Andorra/);
  });

  it('keeps the link live but reports a fetch error when the browser is refused', async (t) => {
    if (!(await canLaunchBrowser())) return t.skip('no Playwright Chromium installed');
    BROWSER_RENDER_HOSTS.add(new URL(url).host);
    const outcome = await fetchPage(url.replace('/en/', '/broken/'), true);
    assert.equal(outcome.status, 'live');
    assert.equal(outcome.httpStatus, 200);
    assert.equal(outcome.body, undefined);
    assert.match(outcome.error ?? '', /page needs rendering, and headless browser: HTTP 500 \(title "Server Error", text "Runtime Error"\)/);
  });

  it('keeps health-only checks on a render host as plain GETs', async () => {
    BROWSER_RENDER_HOSTS.add(new URL(url).host);
    const outcome = await fetchPage(url, false);
    assert.equal(outcome.status, 'live');
    assert.equal(outcome.body, undefined);
  });
});
