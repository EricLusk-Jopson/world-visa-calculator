import { describe, it, expect } from 'vitest';
import { getBosniaRule, BOSNIA } from './bosnia';
import { BosniaSources } from '@/data/sources';
import { selectEntitlement, resolveStayLimits } from '@/features/calculator/utils/stayCalculator';
import {
  isEntitled,
  type RollingWindowLimit,
} from '@/types';

describe('getBosniaRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard nationality (DE)', () => {
    const rule = getBosniaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
    expect(rule.entitlements[0].source).toEqual(BosniaSources.DE);
  });

  it('returns visa_required for a plain visa-required nationality (AF)', () => {
    const rule = getBosniaRule('AF');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(BosniaSources.AF);
  });

  it('cites only the single parent index page for both directUrl and parentUrl — the deliberate per-region source policy', () => {
    const rule = getBosniaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const source = rule.entitlements[0].source!;
    expect(source.directUrl).toBe('https://www.mvp.gov.ba/en');
    expect(source.parentUrl).toBe('https://www.mvp.gov.ba/en');
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getBosniaRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(BOSNIA.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getBosniaRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(BOSNIA.defaultRule);
  });
});

describe('Bosnia — diplomatic/official-only exemption defaults to visa_required for ordinary passports', () => {
  it.each(['EG', 'ID', 'IL', 'KZ', 'MA', 'TH'])('%s is visa_required (only a diplomatic/official exemption is stated in the source)', (code) => {
    const rule = getBosniaRule(code);
    expect(rule.access).toBe('visa_required');
  });
});

describe('Bosnia — Russia (transit-only exemption, not general entry)', () => {
  it('is visa_required, with a note explaining the narrower transit exemption', () => {
    const rule = getBosniaRule('RU');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.[0]?.text.toLowerCase()).toContain('transit');
  });
});

describe('Bosnia — Ukraine (distinct 30-day / 2-month shape)', () => {
  it('is entitled with a rolling_window(30, 60) limit, not the standard 90/180', () => {
    const rule = getBosniaRule('UA');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(30);
    expect(limit.windowDays).toBe(60);
  });
});

describe('Bosnia — Maldives (empty citizenExemptionStatements, rawText/explicit-confirmation fallback)', () => {
  it('is visa_required per explicit confirmation, with a note explaining the empty-statements fallback', () => {
    const rule = getBosniaRule('MV');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.[0]?.text).toContain('citizenExemptionStatements was empty');
  });
});

describe('Bosnia — Kosovo and Taiwan (true content gaps, absent from the source scrape)', () => {
  it('Kosovo (XK) is visa_required per explicit confirmation', () => {
    const rule = getBosniaRule('XK');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.[0]?.text.toLowerCase()).toContain('kosovo');
  });

  it('Taiwan (TW) is visa_required, matching the same gap convention used in montenegro.ts/serbia.ts', () => {
    const rule = getBosniaRule('TW');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.[0]?.text.toLowerCase()).toContain('taiwan');
  });
});

describe('Bosnia — Palestine (not in COUNTRIES, included per precedent)', () => {
  it('is visa_required', () => {
    const rule = getBosniaRule('PS');
    expect(rule.access).toBe('visa_required');
  });
});

describe('Bosnia — source-text quirks (Barbados name mix-up, Brazil concatenated statement)', () => {
  it('Barbados (BB) is entitled with the standard shape, with a note about the source\'s "Bahrein" mix-up', () => {
    const rule = getBosniaRule('BB');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.days).toBe(90);
    expect(rule.entitlements[0].notes?.[0]?.text).toContain('Bahrein');
  });

  it('Brazil (BR) is entitled with the standard shape, extracted from the concatenated source statement', () => {
    const rule = getBosniaRule('BR');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
  });
});

describe('Bosnia seasonal waivers (Bahrain, Oman, Saudi Arabia — real, source-confirmed dates)', () => {
  it.each(['BH', 'OM', 'SA'])('%s has a single temporally-gated entitlement with real validFrom/validUntil, no unconditional fallback', (code) => {
    const rule = getBosniaRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements).toHaveLength(1);
    const window = rule.entitlements[0].temporalWindows?.[0];
    expect(window).toBeDefined();
    expect(window!.validFrom).toBe('2026-06-01');
    expect(window!.validUntil).toBe('2026-09-30');
  });

  it('Bahrain resolves as entitled (30 days per_visit, 90-day assumed allowance) for a trip inside the window', () => {
    const rule = getBosniaRule('BH');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const selection = selectEntitlement(rule, '2026-07-15');
    expect(selection).not.toBeNull();
    expect(selection!.isOverride).toBe(true);
    const limits = resolveStayLimits('BH', rule, BOSNIA.rule, '2026-07-15');
    expect(limits).not.toBeNull();
    expect((limits![0] as { value: number }).value).toBe(90);
  });

  it('Saudi Arabia falls back to visa_required (no match, no unconditional fallback) for a trip outside the window', () => {
    const rule = getBosniaRule('SA');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(selectEntitlement(rule, '2026-12-01')).toBeNull();
    expect(resolveStayLimits('SA', rule, BOSNIA.rule, '2026-12-01')).toBeNull();
  });

  it('Oman correctly rejects a trip dated before the confirmed validFrom (unlike Montenegro\'s placeholder-date entries, this one has a real start date)', () => {
    const rule = getBosniaRule('OM');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(selectEntitlement(rule, '2026-01-01')).toBeNull();
  });
});
