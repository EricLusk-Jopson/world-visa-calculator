import { describe, it, expect } from 'vitest';
import { getMontenegroRule, MONTENEGRO } from './montenegro';
import { MontenegroSources } from '@/data/sources';
import { selectEntitlement, resolveStayLimits } from '@/features/calculator/utils/stayCalculator';
import {
  isEntitled,
  type RollingWindowLimit,
  type PerVisitLimit,
} from '@/types';

describe('getMontenegroRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard nationality (US)', () => {
    const rule = getMontenegroRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
  });

  it('cites its source via the entitlement.source field, not a "here\'s the source" note (US)', () => {
    const rule = getMontenegroRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    expect(rule.entitlements[0].source).toEqual(MontenegroSources.US);
    const notes = rule.entitlements[0].notes ?? [];
    expect(notes.some((n) => n.text.startsWith('Source:'))).toBe(false);
  });

  it('cites its source via the rule.source field for a plain visa-required nationality (AF), with no boilerplate note', () => {
    const rule = getMontenegroRule('AF');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(MontenegroSources.AF);
    expect(rule.notes ?? []).toHaveLength(0);
  });

  it('a special-case visa-required nationality (DZ, true content gap) keeps its substantive note in addition to rule.source', () => {
    const rule = getMontenegroRule('DZ');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(MontenegroSources.DZ);
    expect(rule.notes?.[0]?.text).toContain('No country-specific visa-regime information');
  });

  it('returns entitled with an ID-card note for an EU nationality (DE)', () => {
    const rule = getMontenegroRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const notes = rule.entitlements[0].notes ?? [];
    const idCardNote = notes.find((n) => n.text.toLowerCase().includes('national id card'));
    expect(idCardNote).toBeDefined();
  });

  it('returns entitled with a distinct 30-day per_visit rule for Peru (bilateral agreement, not the standard 90)', () => {
    const rule = getMontenegroRule('PE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as PerVisitLimit;
    expect(limit.type).toBe('per_visit');
    expect(limit.value).toBe(30);
  });

  it('returns visa_required for a plain visa-required nationality (AF)', () => {
    const rule = getMontenegroRule('AF');
    expect(rule.access).toBe('visa_required');
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getMontenegroRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(MONTENEGRO.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getMontenegroRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(MONTENEGRO.defaultRule);
  });
});

describe('Montenegro temporary waivers (BY, RU, SA, TR) — no redundant TODO note or dangling parenthetical', () => {
  it.each(['BY', 'RU', 'SA', 'TR'])('%s has no rule-level notes and a clean date_range description', (code) => {
    const rule = getMontenegroRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.notes ?? []).toHaveLength(0);
    const condition = rule.entitlements[0].conditions?.[0];
    expect(condition?.type).toBe('date_range');
    if (condition?.type !== 'date_range') return;
    expect(condition.description).not.toContain('no stated start date');
    expect(condition.description).not.toContain('see note');
  });
});

describe('Montenegro seasonal waiver (Kazakhstan, date_range condition)', () => {
  const rule = getMontenegroRule('KZ');

  it('is an entitled rule with a single date_range-gated entitlement, no unconditional fallback', () => {
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements).toHaveLength(1);
    expect(rule.entitlements[0].conditions?.[0].type).toBe('date_range');
  });

  it('selectEntitlement matches and flags an override for a trip entering mid-season (1 Jun 2026)', () => {
    if (!isEntitled(rule)) throw new Error('expected KZ to be entitled');
    const selection = selectEntitlement(rule, '2026-06-01');
    expect(selection).not.toBeNull();
    expect(selection!.isOverride).toBe(true);
    expect(selection!.baseEntitlement).toBeUndefined(); // no unconditional fallback for KZ
    const limit = selection!.selected.limits[0] as PerVisitLimit;
    expect(limit.value).toBe(30);
  });

  it('selectEntitlement finds no match for a trip entering outside the season (1 Dec 2026)', () => {
    if (!isEntitled(rule)) throw new Error('expected KZ to be entitled');
    expect(selectEntitlement(rule, '2026-12-01')).toBeNull();
  });

  it('resolveStayLimits falls back to null (visa_required-equivalent) outside the seasonal window', () => {
    expect(resolveStayLimits('KZ', rule, MONTENEGRO.rule, '2026-12-01')).toBeNull();
  });

  it('resolveStayLimits resolves the 30-day per_visit limit inside the seasonal window', () => {
    const limits = resolveStayLimits('KZ', rule, MONTENEGRO.rule, '2026-06-01');
    expect(limits).not.toBeNull();
    expect((limits![0] as PerVisitLimit).value).toBe(30);
  });

  it('resolveStayLimits without an entryDate falls back to entitlements[0] (date-blind default)', () => {
    const limits = resolveStayLimits('KZ', rule, MONTENEGRO.rule);
    expect(limits).not.toBeNull();
    expect((limits![0] as PerVisitLimit).value).toBe(30);
  });
});
