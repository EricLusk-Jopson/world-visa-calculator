import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { closeBrowser } from './browserFetch';
import { BROWSER_FALLBACK_HOSTS, fetchPage } from './fetchPage';

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

