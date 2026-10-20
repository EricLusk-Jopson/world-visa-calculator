import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { updateLinkStatusIndex, type Report } from './report';

describe('updateLinkStatusIndex', () => {
  const report = (date: string, urls: [string, string][]) =>
    ({
      generatedAt: `${date}T06:00:00.000Z`,
      summary: {},
      regions: [{ region: 'Testland', ruleChecks: [], linkHealth: urls.map(([url, status]) => ({ url, status, usedBy: [] })) }],
    }) as unknown as Report;

  it('records each checked URL with the run date, and keeps URLs a later run skipped', () => {
    const first = updateLinkStatusIndex(undefined, report('2026-10-18', [['https://a.test/', 'live'], ['https://b.test/', 'blocked']]));
    const second = updateLinkStatusIndex(first, report('2026-11-06', [['https://a.test/', 'broken']]));
    assert.deepEqual(second.urls, {
      'https://a.test/': { status: 'broken', checkedAt: '2026-11-06' },
      'https://b.test/': { status: 'blocked', checkedAt: '2026-10-18' },
    });
    assert.equal(second.generatedAt, '2026-11-06T06:00:00.000Z');
  });
});
