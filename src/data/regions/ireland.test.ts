import { describe, it, expect } from 'vitest';
import { getIrelandRule } from './ireland';
import { IrelandSources } from '@/data/sources';

describe('getIrelandRule', () => {
  it('returns entitled for a Schedule 1 (visa-free) nationality (US)', () => {
    expect(getIrelandRule('US').access).toBe('entitled');
  });

  // Immigration Act 2004 (Visas) (Amendment) (No. 2) Order 2026, in operation
  // 15 June 2026: removed from Schedule 1 and added to Schedule 5.
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
