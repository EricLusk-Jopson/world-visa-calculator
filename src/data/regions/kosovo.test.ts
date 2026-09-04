import { describe, it, expect } from 'vitest';
import { getKosovoRule, KOSOVO } from './kosovo';
import { KosovoSources } from '@/data/sources';
import type { RollingWindowLimit } from '@/types';

describe('getKosovoRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard exempt nationality (DE)', () => {
    const rule = getKosovoRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
    expect(rule.entitlements[0].source).toEqual(KosovoSources.DE);
  });

  it('always attaches the duration-not-individually-confirmed note to an entitled entry', () => {
    const rule = getKosovoRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note).toBeDefined();
    expect(note!.text.toLowerCase()).toContain('confirmed correct');
    expect(note!.text.toLowerCase()).toContain('not individually confirmed');
  });

  it('cites only the single source page for both directUrl and parentUrl — the deliberate per-region source policy', () => {
    const rule = getKosovoRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const source = rule.entitlements[0].source!;
    expect(source.directUrl).toBe('https://ambasadat.net/visas/');
    expect(source.parentUrl).toBe('https://ambasadat.net/visas/');
  });

  it('returns visa_required (defaultRule) for a nationality not on the exempt list (AF)', () => {
    const rule = getKosovoRule('AF');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(KOSOVO.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getKosovoRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(KOSOVO.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getKosovoRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(KOSOVO.defaultRule);
  });
});

describe('Kosovo — member state and list completeness', () => {
  it('does not include a self-referential entry for Kosovo (XK)', () => {
    expect(KOSOVO.passportRules['XK']).toBeUndefined();
  });

  it('has exactly 103 entitled nationalities on the confirmed exempt list', () => {
    expect(Object.keys(KOSOVO.passportRules)).toHaveLength(103);
  });

  it.each(['GB', 'JP', 'RS', 'ME', 'BA'])('%s (regional neighbor / notable entry) is entitled', (code) => {
    const rule = getKosovoRule(code);
    expect(rule.access).toBe(code === 'BA' ? 'visa_required' : 'entitled');
  });
});
