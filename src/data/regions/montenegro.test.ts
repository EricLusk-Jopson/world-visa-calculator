import { describe, it, expect } from 'vitest';
import { getMontenegroRule, MONTENEGRO } from './montenegro';
import { selectEntitlement, resolveStayLimits } from '@/features/calculator/utils/stayCalculator';
import {
  isEntitled,
  type FixedWindowFromEntryLimit,
  type PerVisitLimit,
} from '@/types';

describe('getMontenegroRule', () => {
  it('returns entitled with a 90-day fixed_window_from_entry limit for a standard nationality (US)', () => {
    const rule = getMontenegroRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as FixedWindowFromEntryLimit;
    expect(limit.type).toBe('fixed_window_from_entry');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
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
