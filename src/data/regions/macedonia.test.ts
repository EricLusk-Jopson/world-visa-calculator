import { describe, it, expect } from 'vitest';
import { getMacedoniaRule, NORTH_MACEDONIA } from './macedonia';
import { NorthMacedoniaSources } from '@/data/sources';
import type { RollingWindowLimit } from '@/types';

describe('getMacedoniaRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard NOT NEEDED nationality (DE)', () => {
    const rule = getMacedoniaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
    expect(rule.entitlements[0].source).toEqual(NorthMacedoniaSources.DE);
  });

  it('always attaches the duration-not-individually-confirmed note to an entitled entry', () => {
    const rule = getMacedoniaRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note).toBeDefined();
    expect(note!.text.toLowerCase()).toContain('confirmed correct');
    expect(note!.text.toLowerCase()).toContain('not individually confirmed');
  });

  it('returns visa_required with a source citation for a plain NEEDED nationality (AF)', () => {
    const rule = getMacedoniaRule('AF');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(NorthMacedoniaSources.AF);
  });

  it('cites only the single source page for both directUrl and parentUrl — the deliberate per-region source policy', () => {
    const rule = getMacedoniaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const source = rule.entitlements[0].source!;
    expect(source.directUrl).toBe('https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza');
    expect(source.parentUrl).toBe('https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza');
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getMacedoniaRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(NORTH_MACEDONIA.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getMacedoniaRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(NORTH_MACEDONIA.defaultRule);
  });
});

describe('North Macedonia — member state completeness', () => {
  it('does not include a self-referential entry for North Macedonia (MK)', () => {
    expect(NORTH_MACEDONIA.passportRules['MK']).toBeUndefined();
  });
});

describe('North Macedonia — true content gaps (Hong Kong, Macao — absent from the source scrape)', () => {
  it.each(['HK', 'MO'])('%s is visa_required with an explicit source citation, not a silent defaultRule fallback', (code) => {
    const rule = getMacedoniaRule(code);
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(NorthMacedoniaSources[code as 'HK' | 'MO']);
  });
});

describe('North Macedonia — data quirks (Sudan text mismatch, Tunizi typo — see file header)', () => {
  it('Sudan (SD) is visa_required despite the source rules text reading "South Sudan"', () => {
    const rule = getMacedoniaRule('SD');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(NorthMacedoniaSources.SD);
  });

  it('South Sudan (SS) has its own separate, correctly-labeled visa_required entry', () => {
    const rule = getMacedoniaRule('SS');
    expect(rule.access).toBe('visa_required');
  });

  it('Tunisia (TN) is visa_required per the source\'s "Tunizi" entry', () => {
    const rule = getMacedoniaRule('TN');
    expect(rule.access).toBe('visa_required');
  });
});

describe('North Macedonia — a representative sample of visa-exempt nationalities', () => {
  it.each(['GB', 'US', 'CA', 'JP', 'IL', 'RS', 'ME', 'BA', 'XK', 'TW'])('%s is entitled (NOT NEEDED per source)', (code) => {
    const rule = getMacedoniaRule(code);
    expect(rule.access).toBe('entitled');
  });
});

describe('North Macedonia — a representative sample of visa-required nationalities', () => {
  it.each(['CN', 'IN', 'RU', 'NG', 'PK', 'VN'])('%s is visa_required (NEEDED per source)', (code) => {
    const rule = getMacedoniaRule(code);
    expect(rule.access).toBe('visa_required');
  });
});

describe('North Macedonia — note wording never restates the source citation', () => {
  it('no note text starts with "Source" — the citation is already a link on the rule row, not a claim in the note', () => {
    for (const rule of Object.values(NORTH_MACEDONIA.passportRules)) {
      const notes = rule.access === 'entitled' ? rule.entitlements.flatMap((e) => e.notes ?? []) : [];
      for (const note of notes) {
        expect(note.text.toLowerCase().startsWith('source')).toBe(false);
      }
    }
  });
});
