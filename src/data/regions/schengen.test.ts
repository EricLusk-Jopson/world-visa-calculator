import { describe, it, expect } from 'vitest';
import { getSchengenRule, SCHENGEN } from './schengen';
import { isEntitled, type RollingWindowLimit } from '@/types';

describe('getSchengenRule', () => {
  it('returns entitled for a visa-free nationality (US)', () => {
    const rule = getSchengenRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
  });

  it('returns free_movement for an EU nationality (FR)', () => {
    const rule = getSchengenRule('FR');
    expect(rule.access).toBe('free_movement');
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getSchengenRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(SCHENGEN.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getSchengenRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(SCHENGEN.defaultRule);
  });

  it('returns entitled with suspension note for GE (Georgia ordinary passports)', () => {
    // Diplomatic/service/official passports suspended March 2026–March 2027;
    // ordinary biometric passport holders remain entitled.
    const rule = getSchengenRule('GE');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const entitlementNotes = rule.entitlements[0].notes;
    expect(Array.isArray(entitlementNotes)).toBe(true);
    expect(entitlementNotes!.length).toBeGreaterThan(0);
    const suspensionNote = entitlementNotes!.find((n) => n.text.toLowerCase().includes('suspended'));
    expect(suspensionNote).toBeDefined();
  });

  it('sets ETIAS preAuth for US and not for VA (Vatican)', () => {
    const usRule = getSchengenRule('US');
    const vaRule = getSchengenRule('VA');
    expect(isEntitled(usRule) && usRule.entitlements.some(e => e.preAuth?.type === 'ETIAS')).toBe(true);
    expect(isEntitled(vaRule) && vaRule.entitlements.some(e => e.preAuth?.type === 'ETIAS')).toBe(false);
  });
});

describe('Schengen — member-state airport transit visas (Annex 7b)', () => {
  const atvNote = (code: string) => {
    const rule = getSchengenRule(code);
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return undefined;
    return rule.notes?.find(n => n.text.startsWith('Airport transit visa required at airports in:'))?.text;
  };

  it('India needs an ATV only in Czechia and Romania', () => {
    expect(atvNote('IN')).toBe('Airport transit visa required at airports in: Czech Republic, Romania. Not required at other Schengen airports.');
  });

  it('Burundi needs an ATV in Belgium, from 1 August 2026', () => {
    expect(atvNote('BI')).toBe('Airport transit visa required at airports in: Belgium. Not required at other Schengen airports.');
    const rule = getSchengenRule('BI');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.some(n => n.text.includes('1 August 2026'))).toBe(true);
  });
});
