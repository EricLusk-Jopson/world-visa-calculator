import { describe, it, expect } from 'vitest';
import { getGeorgiaRule, GEORGIA } from './georgia';
import { GeorgiaSources } from '@/data/sources';
import { isEntitled, type PerVisitLimit, type RollingWindowLimit } from '@/types';

describe('getGeorgiaRule', () => {
  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getGeorgiaRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(GEORGIA.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getGeorgiaRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(GEORGIA.defaultRule);
  });

  it('cites the visa-list page as the default rule\'s source', () => {
    expect(GEORGIA.defaultRule.access).toBe('visa_required');
    if (GEORGIA.defaultRule.access !== 'visa_required') return;
    expect(GEORGIA.defaultRule.source).toEqual(GeorgiaSources.visaList);
  });
});

describe('Georgia — member state completeness', () => {
  it('encodes Georgia (GE) itself as free_movement, not visa_required', () => {
    expect(GEORGIA.passportRules['GE']).toEqual({ access: 'free_movement' });
  });
});

describe('Georgia — standard "Full 1 (one) year" tier (365 days, flat per-visit)', () => {
  it.each(['US', 'GB', 'FR', 'DE', 'AT'])('%s gets a 365-day per-visit entitlement', (code) => {
    const rule = getGeorgiaRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as PerVisitLimit;
    expect(limit.type).toBe('per_visit');
    expect(limit.value).toBe(365);
    expect(limit.unit).toBe('days');
    expect(rule.entitlements[0].source).toEqual(GeorgiaSources.visaList);
  });

  it('treats the cosmetic asterisk in the source uniformly — Austria (AT) is identical in shape to Russia (RU)', () => {
    const at = getGeorgiaRule('AT');
    const ru = getGeorgiaRule('RU');
    expect(at).toEqual(ru);
  });
});

describe('Georgia — Ukraine gets the "Full 2 (two) years" tier (730 days, flat per-visit)', () => {
  it('UA gets a 730-day per-visit entitlement', () => {
    const rule = getGeorgiaRule('UA');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as PerVisitLimit;
    expect(limit.type).toBe('per_visit');
    expect(limit.value).toBe(730);
    expect(limit.unit).toBe('days');
  });
});

describe('Georgia — "90 days in any 180 day period" rolling-window tier', () => {
  it.each(['CL', 'MK'])('%s gets a rolling_window(90, 180) limit', (code) => {
    const rule = getGeorgiaRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
  });

  it('North Macedonia (MK) and Russia (RU) are not swapped (resolves the garbled source table)', () => {
    const mk = getGeorgiaRule('MK');
    const ru = getGeorgiaRule('RU');
    expect(isEntitled(mk)).toBe(true);
    expect(isEntitled(ru)).toBe(true);
    if (!isEntitled(mk) || !isEntitled(ru)) return;
    expect((mk.entitlements[0].limits[0] as RollingWindowLimit).type).toBe('rolling_window');
    expect((ru.entitlements[0].limits[0] as PerVisitLimit).type).toBe('per_visit');
    expect((ru.entitlements[0].limits[0] as PerVisitLimit).value).toBe(365);
  });
});

describe('Georgia — bespoke per-visit durations', () => {
  it('Iran (IR) gets a 45-day per-visit entitlement', () => {
    const rule = getGeorgiaRule('IR');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as PerVisitLimit;
    expect(limit.type).toBe('per_visit');
    expect(limit.value).toBe(45);
    expect(limit.unit).toBe('days');
  });

  it('Uruguay (UY) gets a 90-day per-visit entitlement (not a rolling window)', () => {
    const rule = getGeorgiaRule('UY');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limit = rule.entitlements[0].limits[0] as PerVisitLimit;
    expect(limit.type).toBe('per_visit');
    expect(limit.value).toBe(90);
    expect(limit.unit).toBe('days');
  });
});

describe('Georgia — non-actionable territory rows are excluded (see file header)', () => {
  it('has no entries for territory codes distinct from their parent country', () => {
    // Denmark, France, and the Netherlands themselves are still entitled —
    // only the dependent-territory rows (no distinct ISO code) are excluded.
    expect(getGeorgiaRule('DK').access).toBe('entitled');
    expect(getGeorgiaRule('FR').access).toBe('entitled');
    expect(getGeorgiaRule('NL').access).toBe('entitled');
    expect(getGeorgiaRule('GB').access).toBe('entitled');
  });
});

describe('Georgia — note wording never restates the source citation', () => {
  it('no note text starts with "Source"', () => {
    for (const rule of Object.values(GEORGIA.passportRules)) {
      const notes =
        rule.access === 'entitled'
          ? rule.entitlements.flatMap((e) => e.notes ?? [])
          : rule.access === 'visa_required'
            ? (rule.notes ?? [])
            : [];
      for (const note of notes) {
        expect(note.text.toLowerCase().startsWith('source')).toBe(false);
      }
    }
  });
});
