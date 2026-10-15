import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareSnapshots, decodeHtml, extractSnapshot } from './contentCheck';
import type { ContentSnapshot } from './types';

const snap = (href: string): ContentSnapshot => ({
  url: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madagaskar',
  contentType: 'text/html',
  updatedAt: null,
  text: 'Madagascar',
  links: [{ text: 'Bilateral relations', href }],
});

describe('compareSnapshots link targets', () => {
  it('treats a front-controller spelling of the same target as unchanged', () => {
    const plain = 'https://mfa.gov.rs/en/foreign-policy/bilateral-cooperation/madagascar';
    const viaIndex = 'https://mfa.gov.rs/index%2ephp/en/foreign-policy/bilateral-cooperation/madagascar';
    assert.equal(compareSnapshots(snap(plain), snap(viaIndex)).status, 'unchanged');
    assert.equal(compareSnapshots(snap(viaIndex), snap(plain.replace('/en/', '/index.php/en/'))).status, 'unchanged');
  });

  it('still reports a real target change', () => {
    const result = compareSnapshots(
      snap('https://mfa.gov.rs/en/foreign-policy/bilateral-cooperation/madagascar'),
      snap('https://mfa.gov.rs/en/foreign-policy/bilateral-cooperation/mauritius'),
    );
    assert.equal(result.status, 'links-changed');
  });
});

describe('extractSnapshot on mfa.gov.by', () => {
  const page = (body: string) => `<html><head><meta http-equiv="Content-Type" content="text/html; charset=windows-1251"></head><body>
    <ul class="crumbs"><li><a href="/en/">Home /</a></li></ul>
    <div class="text"><h1>Visa-free entry</h1><p>Citizens of 38 European states « may enter ».</p><ul><li>Andorra</li></ul>
      <a href="/kcfinder/list.pdf">list</a></div>
    <div class="side"><div class="block"><h3>Belarusian Diplomatic Missions abroad</h3><a href="/en/bilateral/belarus/">All Missions</a></div>
      <div class="block"><h3>Video</h3><ul><li><a href="/en/press/video/1.html">${body}</a></li></ul></div></div>
    <div class="footer"><p>+375 17 327-29-22</p></div></body></html>`;
  const encode = (html: string) => Buffer.from(html, 'utf-8');
  const win1251 = (html: string) =>
    Buffer.from([...html].map((c) => (c === '«' ? 0xab : c === '»' ? 0xbb : c >= 'А' && c <= 'я' ? c.charCodeAt(0) - 0x410 + 0xc0 : c.charCodeAt(0))));
  const url = 'https://mfa.gov.by/en/visa/freemove/europe/';

  it('drops the sidebar and footer, so a new video is not a change', () => {
    const a = extractSnapshot(encode(page('Old video')), 'text/html', url);
    const b = extractSnapshot(encode(page('New video')), 'text/html', url);
    assert.equal(a.text, 'Home /\nVisa-free entry\nCitizens of 38 European states « may enter ».\nAndorra');
    assert.deepEqual(a.links.map((l) => l.text), ['Home /', 'list']);
    assert.equal(compareSnapshots(a, b).status, 'unchanged');
  });

  it('keeps the whole page when the marker is missing', () => {
    const html = page('x').replace('Belarusian Diplomatic Missions abroad', 'Missions');
    assert.match(extractSnapshot(encode(html), 'text/html', url).text, /\+375/);
  });

  it('only cuts on mfa.gov.by', () => {
    assert.match(extractSnapshot(encode(page('x')), 'text/html', 'https://example.org/').text, /\+375/);
  });

  it('decodes windows-1251 pages', () => {
    const body = win1251(page('Видео')); // "Видео"
    assert.equal(decodeHtml(body, 'text/html; charset=windows-1251').includes('Видео'), true);
    assert.equal(decodeHtml(body, 'text/html').includes('Видео'), true); // from <meta>
    assert.match(extractSnapshot(body, 'text/html; charset=windows-1251', url).text, /« may enter »/);
  });

  it('reads valid UTF-8 as UTF-8 even when labelled windows-1251', () => {
    const body = Buffer.from('<p>Видео ’</p>', 'utf-8');
    assert.equal(decodeHtml(body, 'text/html; charset=windows-1251'), '<p>Видео ’</p>');
  });
});
