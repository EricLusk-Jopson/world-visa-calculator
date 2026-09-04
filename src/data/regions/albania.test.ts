import { describe, it, expect } from 'vitest';
import { getAlbaniaRule, ALBANIA } from './albania';
import { AlbaniaSources } from '@/data/sources';
import type { RollingWindowLimit } from '@/types';

describe('getAlbaniaRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard visa-free nationality (DE)', () => {
    const rule = getAlbaniaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
    expect(rule.entitlements[0].source).toEqual(AlbaniaSources.DE);
  });

  it('always attaches the duration-assumed note to an entitled entry', () => {
    const rule = getAlbaniaRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note).toBeDefined();
    expect(note!.text.toLowerCase()).toContain('confirmed');
    expect(note!.text.toLowerCase()).toContain('assumed');
  });

  it('returns visa_required with a source citation for a plain required nationality (AF)', () => {
    const rule = getAlbaniaRule('AF');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(AlbaniaSources.AF);
  });

  it('cites distinct direct and parent URLs — Albania is the one region with two different index pages', () => {
    const rule = getAlbaniaRule('DE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const source = rule.entitlements[0].source!;
    expect(source.directUrl).toBe('https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/');
    expect(source.parentUrl).toBe('https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/');
    expect(source.directUrl).not.toBe(source.parentUrl);
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getAlbaniaRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(ALBANIA.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getAlbaniaRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(ALBANIA.defaultRule);
  });
});

describe('Albania — member state completeness', () => {
  it('does not include a self-referential entry for Albania (AL)', () => {
    expect(ALBANIA.passportRules['AL']).toBeUndefined();
  });
});

describe('Albania — data quirks (Gibraltar excluded, Congo mapping, South Sudan gap — see file header)', () => {
  it('has no entry for Gibraltar (no ISO nationality code in this app)', () => {
    // Gibraltar has no COUNTRIES code, so there is no key to look up — this
    // documents the exclusion rather than asserting on a specific code.
    const codes = Object.keys(ALBANIA.passportRules);
    expect(codes).not.toContain('GI');
  });

  it('Congo (CG) is visa_required per the source\'s unqualified "Kongo" entry', () => {
    const rule = getAlbaniaRule('CG');
    expect(rule.access).toBe('visa_required');
  });

  it('South Sudan (SS) is visa_required (true content gap, defaultRule fallback)', () => {
    const rule = getAlbaniaRule('SS');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(ALBANIA.defaultRule);
  });

  it('Sudan (SD) has its own separate, explicitly visa_required entry', () => {
    const rule = getAlbaniaRule('SD');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.source).toEqual(AlbaniaSources.SD);
  });
});

describe('Albania — a representative sample of visa-free nationalities', () => {
  it.each(['GB', 'US', 'CA', 'JP', 'IL', 'RS', 'ME', 'BA', 'XK', 'MK', 'TW', 'HK', 'MO', 'CN'])('%s is entitled (visa-free per source)', (code) => {
    const rule = getAlbaniaRule(code);
    expect(rule.access).toBe('entitled');
  });
});

describe('Albania — a representative sample of visa-required nationalities', () => {
  it.each(['EG', 'IN', 'RU', 'NG', 'PK', 'VN'])('%s is visa_required (required per source)', (code) => {
    const rule = getAlbaniaRule(code);
    expect(rule.access).toBe('visa_required');
  });
});

describe('Albania — note wording never restates the source citation', () => {
  it('no note text starts with "Source" — the citation is already a link on the rule row, not a claim in the note', () => {
    for (const rule of Object.values(ALBANIA.passportRules)) {
      const notes = rule.access === 'entitled' ? rule.entitlements.flatMap((e) => e.notes ?? []) : [];
      for (const note of notes) {
        expect(note.text.toLowerCase().startsWith('source')).toBe(false);
      }
    }
  });
});
