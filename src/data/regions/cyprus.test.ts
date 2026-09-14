import { describe, it, expect } from 'vitest';
import { getCyprusRule, CYPRUS } from './cyprus';
import { CyprusSources } from '@/data/sources';
import { isEntitled, type RollingWindowLimit } from '@/types';

describe('getCyprusRule', () => {
  it('returns entitled with a 90-day rolling_window limit for a standard visa-free nationality (US)', () => {
    const rule = getCyprusRule('US');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const limit = rule.entitlements[0].limits[0] as RollingWindowLimit;
    expect(limit.type).toBe('rolling_window');
    expect(limit.days).toBe(90);
    expect(limit.windowDays).toBe(180);
    expect(rule.entitlements[0].source).toEqual(CyprusSources.visaList);
  });

  it('returns free_movement for an EU nationality (FR)', () => {
    const rule = getCyprusRule('FR');
    expect(rule.access).toBe('free_movement');
  });

  it('returns free_movement for Ireland (EU, non-Schengen) — same precedent Cyprus itself relies on', () => {
    const rule = getCyprusRule('IE');
    expect(rule.access).toBe('free_movement');
  });

  it('returns free_movement for EEA/Switzerland nationals (CH)', () => {
    const rule = getCyprusRule('CH');
    expect(rule.access).toBe('free_movement');
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getCyprusRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(CYPRUS.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getCyprusRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(CYPRUS.defaultRule);
  });
});

describe('Cyprus — member state completeness', () => {
  it('encodes Cyprus (CY) itself as free_movement, not visa_required', () => {
    expect(CYPRUS.passportRules['CY']).toEqual({ access: 'free_movement' });
  });
});

describe('Cyprus — ETIAS and ATV are never carried over (see file header)', () => {
  it('no entitlement anywhere carries a preAuth field', () => {
    for (const rule of Object.values(CYPRUS.passportRules)) {
      if (!isEntitled(rule)) continue;
      for (const entitlement of rule.entitlements) {
        expect(entitlement.preAuth).toBeUndefined();
      }
    }
  });

  it('no visa_required note mentions "airport transit" or "ATV"', () => {
    for (const rule of Object.values(CYPRUS.passportRules)) {
      if (rule.access !== 'visa_required') continue;
      const text = (rule.notes ?? []).map((n) => n.text.toLowerCase()).join(' ');
      expect(text).not.toContain('airport transit');
      expect(text).not.toContain('atv');
    }
  });

  it('a nationality that requires an ATV note in Schengen (e.g. Nigeria, Algeria) is plain visa_required here', () => {
    for (const code of ['NG', 'DZ']) {
      const rule = getCyprusRule(code);
      expect(rule.access).toBe('visa_required');
      if (rule.access !== 'visa_required') continue;
      expect(rule.notes ?? []).toHaveLength(0);
      expect(rule.source).toEqual(CyprusSources.visaList);
    }
  });
});

describe('Cyprus — biometric-passport conditions (Annex II footnotes 6, 9, 10, 12, 13, 19)', () => {
  it.each(['AL', 'BA', 'MK', 'ME'])('%s requires a biometric passport, no extra note', (code) => {
    const rule = getCyprusRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements[0].conditions).toEqual([{ type: 'biometric_passport' }]);
  });

  it('Moldova (MD) carries the ICAO biometric note', () => {
    const rule = getCyprusRule('MD');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note?.text.toLowerCase()).toContain('icao');
  });

  it('Serbia (RS) excludes Coordination Directorate passports', () => {
    const rule = getCyprusRule('RS');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note?.text.toLowerCase()).toContain('coordination directorate');
  });

  it('Ukraine (UA) carries the ICAO biometric note', () => {
    const rule = getCyprusRule('UA');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note?.text.toLowerCase()).toContain('icao');
  });
});

describe('Cyprus — specific passport-document conditions', () => {
  it.each([
    ['HK', 'hong kong'],
    ['MO', 'macau'],
    ['TW', 'taiwan'],
  ])('%s requires a specific passport type', (code, keyword) => {
    const rule = getCyprusRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const condition = rule.entitlements[0].conditions?.[0];
    expect(condition?.type).toBe('passport_identifier');
    expect((condition as { description: string }).description.toLowerCase()).toContain(keyword);
  });
});

describe('Cyprus — Kosovo and Georgia bespoke notes', () => {
  it('Kosovo (XK) carries the UNSCR 1244/1999 note plus biometric condition', () => {
    const rule = getCyprusRule('XK');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements[0].conditions).toEqual([{ type: 'biometric_passport' }]);
    const note = rule.entitlements[0].notes?.[0];
    expect(note?.text).toContain('UNSCR 1244/1999');
  });

  it('Georgia (GE) carries the diplomatic/service/official suspension note', () => {
    const rule = getCyprusRule('GE');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const note = rule.entitlements[0].notes?.[0];
    expect(note?.text.toLowerCase()).toContain('suspended');
  });
});

describe('Cyprus — pending EU visa exemption agreement (Annex II footnotes 7, 11)', () => {
  it.each(['AE', 'DM', 'FM', 'GD', 'KI', 'LC', 'MH', 'NR', 'PE', 'PW', 'TL', 'TO', 'TV', 'VC'])(
    '%s is entitled with a pending-agreement note',
    (code) => {
      const rule = getCyprusRule(code);
      expect(isEntitled(rule)).toBe(true);
      if (!isEntitled(rule)) return;
      const note = rule.entitlements[0].notes?.[0];
      expect(note?.text.toLowerCase()).toContain('agreement');
    },
  );
});

describe('Cyprus — Vanuatu mirrors Schengen\'s current (fallback) behavior', () => {
  it('Vanuatu (VU) is visa_required via defaultRule, same as Schengen — see file header', () => {
    const rule = getCyprusRule('VU');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(CYPRUS.defaultRule);
  });
});

describe('Cyprus — cites distinct primary/parent URLs', () => {
  it('directUrl is the EU Annex 1 PDF, parentUrl is gov.cy', () => {
    expect(CyprusSources.visaList.directUrl).toContain('home-affairs.ec.europa.eu');
    expect(CyprusSources.visaList.parentUrl).toBe('https://www.gov.cy/en/information/visas/');
  });
});
