import { describe, it, expect } from 'vitest';
import { getArmeniaRule, ARMENIA } from './armenia';
import { ArmeniaSources } from '@/data/sources';
import { isEntitled, type RollingWindowLimit } from '@/types';

describe('getArmeniaRule', () => {
  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getArmeniaRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(ARMENIA.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getArmeniaRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(ARMENIA.defaultRule);
  });

  it('cites the unilateral visa-free list as the default rule\'s source', () => {
    expect(ARMENIA.defaultRule.access).toBe('visa_required');
    if (ARMENIA.defaultRule.access !== 'visa_required') return;
    expect(ARMENIA.defaultRule.source).toEqual(ArmeniaSources.visaFreeList);
  });
});

describe('Armenia — member state completeness', () => {
  it('encodes Armenia (AM) itself as free_movement, not visa_required', () => {
    expect(ARMENIA.passportRules['AM']).toEqual({ access: 'free_movement' });
  });
});

describe('Armenia — unilateral list (45 countries), rolling_window(180, 365)', () => {
  it.each(['US', 'GB', 'FR', 'DE', 'AU', 'JP', 'QA', 'AE', 'KR', 'VA'])(
    '%s gets a rolling_window(180, 365) entitlement citing the unilateral list',
    (code) => {
      const rule = getArmeniaRule(code);
      expect(isEntitled(rule)).toBe(true);
      if (!isEntitled(rule)) return;
      const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
      expect(limit.type).toBe('rolling_window');
      expect(limit.days).toBe(180);
      expect(limit.windowDays).toBe(365);
      expect(rule.entitlements[0].source).toEqual(ArmeniaSources.visaFreeList);
    },
  );

  it('covers all 45 unilateral-list countries', () => {
    const unilateralCodes = [
      'AD', 'AU', 'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE',
      'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'JP', 'LV',
      'LI', 'LT', 'LU', 'MT', 'MC', 'ME', 'NL', 'NZ', 'NO', 'PL',
      'PT', 'QA', 'KR', 'RO', 'SM', 'SG', 'SK', 'SI', 'ES', 'SE',
      'CH', 'VA', 'AE', 'GB', 'US',
    ];
    expect(unilateralCodes).toHaveLength(45);
    for (const code of unilateralCodes) {
      expect(getArmeniaRule(code).access, `${code} should be entitled`).toBe('entitled');
    }
  });
});

describe('Armenia — bilateral "all types of passports" agreements, same rolling_window(180, 365)', () => {
  it.each(['AL', 'AR', 'BY', 'BR', 'CN', 'GE', 'HK', 'IR', 'KZ', 'KG', 'MO', 'PA', 'MD', 'RU', 'RS', 'TJ', 'UA', 'UY', 'UZ', 'EC'])(
    '%s gets a rolling_window(180, 365) entitlement citing the bilateral list',
    (code) => {
      const rule = getArmeniaRule(code);
      expect(isEntitled(rule)).toBe(true);
      if (!isEntitled(rule)) return;
      const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
      expect(limit.type).toBe('rolling_window');
      expect(limit.days).toBe(180);
      expect(limit.windowDays).toBe(365);
      expect(rule.entitlements[0].source).toEqual(ArmeniaSources.bilateralList);
    },
  );
});

describe('Armenia — diplomatic/service/official-only bilateral rows grant nothing to an ordinary passport', () => {
  it.each(['AT', 'BE', 'BA', 'BG', 'HR', 'CY', 'CZ', 'EG', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IN', 'ID', 'IQ', 'IL', 'IT', 'JO', 'KW', 'LV', 'LB', 'LT', 'LU', 'MT', 'MX', 'MN', 'NL', 'NO', 'PH', 'PL', 'PT', 'KR', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH', 'SY', 'TM', 'VN'])(
    '%s is not granted a second entitlement purely from its diplomatic/service-only bilateral row',
    (code) => {
      // Every one of these codes is either on the unilateral list (already
      // entitled) or has no ordinary-passport entitlement at all (falls
      // through to visa_required) — never a rule sourced from bilateralList.
      const rule = getArmeniaRule(code);
      if (isEntitled(rule)) {
        expect(rule.entitlements[0].source).not.toEqual(ArmeniaSources.bilateralList);
      } else {
        expect(rule.access).toBe('visa_required');
      }
    },
  );
});

describe('Armenia — Montenegro\'s bilateral seasonal row is superseded by its unilateral entitlement', () => {
  it('Montenegro (ME) gets the unconditional unilateral entitlement, not a seasonal/temporal one', () => {
    const rule = getArmeniaRule('ME');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements[0].source).toEqual(ArmeniaSources.visaFreeList);
    expect(rule.entitlements[0].temporalWindows).toBeUndefined();
  });
});

describe('Armenia — countries on both lists resolve to a single entitlement', () => {
  it.each(['QA', 'AE'])('%s (on both the unilateral and bilateral lists) is entitled via the unilateral list', (code) => {
    const rule = getArmeniaRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements).toHaveLength(1);
    expect(rule.entitlements[0].source).toEqual(ArmeniaSources.visaFreeList);
  });
});

describe('Armenia — note wording never restates the source citation', () => {
  it('no note text starts with "Source"', () => {
    for (const rule of Object.values(ARMENIA.passportRules)) {
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
