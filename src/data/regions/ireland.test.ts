import { describe, it, expect } from 'vitest';
import { getIrelandRule } from './ireland';
import { IrelandSources } from '@/data/sources';

describe('getIrelandRule', () => {
  it('returns entitled for a Schedule 1 (visa-free) nationality (US)', () => {
    expect(getIrelandRule('US').access).toBe('entitled');
  });

  // Immigration Act 2004 (Visas) (Amendment) (No. 2) Order 2026 (S.I. No. 242
  // of 2026), in operation 15 June 2026: removed from Schedule 1, added to Schedule 5.
  it.each(['NI', 'KN', 'LC'])(
    '%s is visa_required with a transit visa since the (No. 2) Order 2026',
    (code) => {
      const rule = getIrelandRule(code);
      expect(rule.access).toBe('visa_required');
      expect(rule.notes?.map((n) => n.source)).toContainEqual(IrelandSources.transitVisa);
      expect(rule.notes?.[0].text).toMatch(/transit visa/);
    },
  );

  it.each(['BS', 'WS'])('%s (Schedule 1) is visa-free', (code) => {
    expect(getIrelandRule(code).access).toBe('entitled');
  });

  it('keeps Saint Vincent and the Grenadines visa-free (not part of the 2026 amendment)', () => {
    expect(getIrelandRule('VC').access).toBe('entitled');
  });
});

describe('Ireland — 2026-10-23 by-hand check', () => {
  it('Zimbabwe needs a transit visa', () => {
    const rule = getIrelandRule('ZW');
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.some(n => n.source === IrelandSources.transitVisa)).toBe(true);
  });

  it.each(['BH', 'KW', 'OM', 'QA', 'SA', 'PE'])('%s: the SSVWP needs a UK visa issued before the ETA', (code) => {
    const rule = getIrelandRule(code);
    expect(rule.access).toBe('visa_required');
    if (rule.access !== 'visa_required') return;
    expect(rule.notes?.some(n => n.text.includes('1 February 2024'))).toBe(true);
  });

  it('other SSVWP nationalities keep the plain note', () => {
    const rule = getIrelandRule('TH');
    if (rule.access !== 'visa_required') throw new Error('expected visa_required');
    expect(rule.notes?.some(n => n.text.includes('1 February 2024'))).toBe(false);
  });
});
