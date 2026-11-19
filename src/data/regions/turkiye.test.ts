import { describe, it, expect } from 'vitest';
import { getTurkiyeRule } from './turkiye';
import { TurkiyeSources } from '@/data/sources';

describe('Türkiye — South Africa e-Visa (rule change 15)', () => {
  it('is a 30-day, multiple-entry e-Visa applied for via dtvgroup.com.tr', () => {
    const rule = getTurkiyeRule('ZA');
    expect(rule.access).toBe('entitled');
    if (rule.access !== 'entitled') return;
    const e = rule.entitlements[0];
    expect(e.limits).toEqual([{ type: 'per_visit', value: 30, unit: 'days' }]);
    expect(e.preAuth).toMatchObject({ type: 'e_visa', multiEntry: true, applicationUrl: TurkiyeSources.eVisaSouthAfrica.direct.url });
    expect(e.source).toEqual(TurkiyeSources.mfaVisaInfo);
  });

  it('leaves the other 30-day e-Visa nationalities on evisa.gov.tr', () => {
    const rule = getTurkiyeRule('MX');
    if (rule.access !== 'entitled') throw new Error('expected entitled');
    expect(rule.entitlements[0].preAuth).toMatchObject({ multiEntry: false, applicationUrl: TurkiyeSources.eVisaApplication.direct.url });
  });
});
