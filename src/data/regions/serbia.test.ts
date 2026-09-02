import { describe, it, expect } from 'vitest';
import { getSerbiaRule, SERBIA } from './serbia';
import {
  isEntitled,
  type RollingWindowLimit,
  type PerVisitLimit,
} from '@/types';

describe('getSerbiaRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard nationality (US)', () => {
    const rule = getSerbiaRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
  });

  it('returns entitled with an ID-card note for an EU nationality (DE)', () => {
    const rule = getSerbiaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const notes = rule.entitlements[0].notes ?? [];
    const idCardNote = notes.find((n) => n.text.toLowerCase().includes('national id card'));
    expect(idCardNote).toBeDefined();
  });

  it('returns entitled with a 30-day rolling_window(30, 365) limit for the distinct "within one year" shape (Bahamas)', () => {
    const rule = getSerbiaRule('BS');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(30);
    expect(limit.windowDays).toBe(365);
  });

  it('returns visa_required for a plain visa-required nationality (AF)', () => {
    const rule = getSerbiaRule('AF');
    expect(rule.access).toBe('visa_required');
  });

  it('returns visa_required with a gap note for a true content gap (Marshall Islands)', () => {
    const rule = getSerbiaRule('MH');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.some((n) => n.text.toLowerCase().includes('no visa-regime information'))).toBe(true);
  });

  it('returns visa_required with a gap note for Taiwan (absent from the source scrape entirely)', () => {
    const rule = getSerbiaRule('TW');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.some((n) => n.text.toLowerCase().includes('no dedicated page'))).toBe(true);
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getSerbiaRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(SERBIA.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getSerbiaRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(SERBIA.defaultRule);
  });
});

describe('Serbia stacked limits — bare "up to N days" entries', () => {
  it('Kazakhstan stacks a 30-day per_visit cap on top of the standard 90/180 rolling window', () => {
    const rule = getSerbiaRule('KZ');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limits = rule.entitlements[0].limits;
    expect(limits).toHaveLength(2);
    const perVisit = limits.find((l): l is PerVisitLimit => l.type === 'per_visit');
    const rolling = limits.find((l): l is RollingWindowLimit => l.type === 'rolling_window');
    expect(perVisit?.value).toBe(30);
    expect(rolling?.days).toBe(90);
    expect(rolling?.windowDays).toBe(180);
  });

  it('applies the same stacked shape to every bare-N-days entry, not just Kazakhstan', () => {
    // Belarus, Holy See, Korea Republic, Montenegro, Russia, Suriname — confirmed
    // by explicit user decision to all get the same treatment as Kazakhstan.
    const cases: Array<[string, number]> = [
      ['BY', 30], ['VA', 90], ['KR', 90], ['ME', 90], ['RU', 30], ['SR', 30],
    ];
    for (const [code, days] of cases) {
      const rule = getSerbiaRule(code);
      expect(isEntitled(rule), `${code} should be entitled`).toBe(true);
      if (!isEntitled(rule)) continue;
      const limits = rule.entitlements[0].limits;
      const perVisit = limits.find((l): l is PerVisitLimit => l.type === 'per_visit');
      const rolling = limits.find((l): l is RollingWindowLimit => l.type === 'rolling_window');
      expect(perVisit?.value, `${code} per_visit value`).toBe(days);
      expect(rolling?.days, `${code} rolling_window days`).toBe(90);
      expect(rolling?.windowDays, `${code} rolling_window windowDays`).toBe(180);
    }
  });
});

describe('Serbia — China / Hong Kong SAR / Macao SAR as three distinct entries', () => {
  it('mainland China (CN) gets the 30-day stacked shape', () => {
    const rule = getSerbiaRule('CN');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const perVisit = rule.entitlements[0].limits.find((l): l is PerVisitLimit => l.type === 'per_visit');
    expect(perVisit?.value).toBe(30);
  });

  it('Hong Kong SAR (HK) gets its own 14-day stacked shape, distinct from mainland China', () => {
    const rule = getSerbiaRule('HK');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const perVisit = rule.entitlements[0].limits.find((l): l is PerVisitLimit => l.type === 'per_visit');
    expect(perVisit?.value).toBe(14);
  });

  it('Macao SAR (MO) gets its own 90-day stacked shape, distinct from mainland China', () => {
    const rule = getSerbiaRule('MO');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const perVisit = rule.entitlements[0].limits.find((l): l is PerVisitLimit => l.type === 'per_visit');
    expect(perVisit?.value).toBe(90);
  });
});

describe('Serbia — Moldova biometric-passport condition', () => {
  it('is entitled to rolling_window(90, 180) gated on a biometric_passport condition', () => {
    const rule = getSerbiaRule('MD');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const entitlement = rule.entitlements[0];
    const limit = entitlement.limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(entitlement.conditions?.[0].type).toBe('biometric_passport');
  });
});

describe('Serbia — Israel travel-document note', () => {
  it('is entitled to the standard 90/180 rolling window with a note on travel-document sub-types', () => {
    const rule = getSerbiaRule('IL');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.days).toBe(90);
    const notes = rule.entitlements[0].notes ?? [];
    expect(notes.some((n) => n.text.toLowerCase().includes('travel document'))).toBe(true);
  });
});
