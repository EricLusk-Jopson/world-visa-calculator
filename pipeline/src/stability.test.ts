import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Report } from './report';
import type { Playbook } from '@/data/playbooks';
import type { SourceRegion } from '@/types';
import { computeStability, diffCoveredSources } from './stability';

const ALL = new Set(['Testland.A', 'Testland.B']);

describe('computeStability', () => {
  const report = (date: string, checks: [string, string, string[]][]): [string, Report] => [
    date,
    {
      generatedAt: `${date}T06:00:00.000Z`,
      summary: {},
      regions: [{ region: 'Testland', linkHealth: [], ruleChecks: checks.map(([url, status, keys]) => ({ url, status, keys })) }],
    } as unknown as Report,
  ];

  it('carries unchanged runs forward and restarts on a change or a first run', () => {
    const index = computeStability(
      [
        report('2026-10-01', [['https://a.test/', 'first-run', ['A']], ['https://b.test/', 'unchanged', ['B']]]),
        report('2026-10-15', [['https://a.test/', 'unchanged', ['A']], ['https://b.test/', 'text-changed', ['B']]]),
        report('2026-10-29', [['https://a.test/', 'unchanged', ['A']], ['https://b.test/', 'unchanged', ['B']]]),
      ],
      new Set(),
      ALL,
    );
    assert.deepEqual(index.sources, {
      'Testland.A': { since: '2026-10-01', through: '2026-10-29' },
      'Testland.B': { since: '2026-10-15', through: '2026-10-29' },
    });
  });

  it('counts a diff triaged as no rule change as unchanged, and skips fetch errors', () => {
    const index = computeStability(
      [
        report('2026-10-01', [['https://a.test/', 'unchanged', ['A']]]),
        report('2026-10-15', [['https://a.test/', 'links-changed', ['A']]]),
        report('2026-10-29', [['https://a.test/', 'fetch-error', ['A']]]),
      ],
      new Set(['2026-10-15|Testland|https://a.test/']),
      ALL,
    );
    assert.deepEqual(index.sources, { 'Testland.A': { since: '2026-10-01', through: '2026-10-15' } });
  });

  it('needs every diffed link of a source to be unchanged', () => {
    const index = computeStability(
      [
        report('2026-10-01', [['https://a.test/', 'unchanged', ['A']], ['https://a.test/alt', 'unchanged', ['A']]]),
        report('2026-10-15', [['https://a.test/', 'unchanged', ['A']], ['https://a.test/alt', 'fetch-error', ['A']]]),
        report('2026-10-29', [['https://a.test/', 'unchanged', ['A']], ['https://a.test/alt', 'both-changed', ['A']]]),
      ],
      new Set(),
      ALL,
    );
    assert.deepEqual(index.sources, { 'Testland.A': { since: '2026-10-29', through: '2026-10-29' } });
  });

  it('leaves out sources a diff cannot vouch for', () => {
    const index = computeStability([report('2026-10-01', [['https://a.test/', 'unchanged', ['A', 'B']]])], new Set(), new Set(['Testland.A']));
    assert.deepEqual(Object.keys(index.sources), ['Testland.A']);
  });
});

describe('diffCoveredSources', () => {
  const link = (url: string, loadBearing: boolean, humanCheck: string) => ({ id: url, url, loadBearing, humanCheck });
  const playbooks = [
    {
      region: 'Testland',
      links: [link('https://t.test/page', true, 'on-diff'), link('https://t.test/law', true, 'periodic'), link('https://t.test/index', false, 'periodic')],
    },
  ] as unknown as Playbook[];
  const doc = (direct: string) => ({
    direct: { url: direct, type: 'direct', checkDiff: true },
    parent: { url: 'https://t.test/index', type: 'parent', checkDiff: false },
    dateChecked: '2026-01-01',
  });
  const regions = {
    Testland: { checkLinks: true, sources: { page: doc('https://t.test/page'), law: doc('https://t.test/law'), odd: doc('https://t.test/undocumented') } },
    Elsewhere: { checkLinks: true, sources: { x: doc('https://t.test/page') } },
  } as unknown as Record<string, SourceRegion>;

  it('keeps a source only when every load-bearing link it cites is checked on diff', () => {
    assert.deepEqual([...diffCoveredSources(playbooks, regions)], ['Testland.page']);
  });
});

