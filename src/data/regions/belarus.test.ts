import { describe, it, expect } from 'vitest';
import { getBelarusRule, BELARUS } from './belarus';
import { BelarusSources } from '@/data/sources';
import { selectEntitlement, assessStay } from '@/features/calculator/utils/stayCalculator';
import { isEntitled, type PerVisitLimit, type CalendarPeriodLimit } from '@/types';

describe('getBelarusRule', () => {
  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getBelarusRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(BELARUS.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getBelarusRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(BELARUS.defaultRule);
  });

  it('cites the general visa-required page as the default rule\'s source', () => {
    expect(BELARUS.defaultRule.access).toBe('visa_required');
    if (BELARUS.defaultRule.access !== 'visa_required') return;
    expect(BELARUS.defaultRule.source).toEqual(BelarusSources.general);
  });
});

describe('Belarus — member state completeness', () => {
  it('does not include a self-referential entry for Belarus (BY)', () => {
    expect(BELARUS.passportRules['BY']).toBeUndefined();
  });
});

describe('Belarus — European any-border override (temporal window through 2026-12-31)', () => {
  it('France (FR) gets the any-border override for a trip before the window closes', () => {
    const rule = getBelarusRule('FR');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const selection = selectEntitlement(rule, '2026-10-01');
    expect(selection).not.toBeNull();
    expect(selection!.isOverride).toBe(true);
    const limit = selection!.selected.limits[0] as PerVisitLimit;
    expect(limit.type).toBe('per_visit');
    expect(limit.value).toBe(30);
  });

  it('France (FR) falls back to the airport-only rule for a trip after the window closes', () => {
    const rule = getBelarusRule('FR');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const selection = selectEntitlement(rule, '2027-03-01');
    expect(selection).not.toBeNull();
    expect(selection!.isOverride).toBe(false);
    const limits = selection!.selected.limits;
    expect(limits.some((l) => l.type === 'per_visit' && l.value === 30)).toBe(true);
    expect(limits.some((l) => l.type === 'calendar_period')).toBe(true);
  });

  it.each(['PL', 'LV', 'LT'])('%s gets a 90-day (not 30-day) any-border override', (code) => {
    const rule = getBelarusRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const selection = selectEntitlement(rule, '2026-10-01');
    const limit = selection!.selected.limits[0] as PerVisitLimit;
    expect(limit.value).toBe(90);
  });

  it('Latvia (LV) carries the non-citizen inclusion note on the override entitlement', () => {
    const rule = getBelarusRule('LV');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const selection = selectEntitlement(rule, '2026-10-01');
    const notes = selection!.selected.notes ?? [];
    expect(notes.some((n) => n.text.toLowerCase().includes('non-citizen'))).toBe(true);
  });

  it('Estonia (EE) carries the stateless-persons inclusion note on the override entitlement', () => {
    const rule = getBelarusRule('EE');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const selection = selectEntitlement(rule, '2026-10-01');
    const notes = selection!.selected.notes ?? [];
    expect(notes.some((n) => n.text.toLowerCase().includes('stateless'))).toBe(true);
  });
});

describe('Belarus — airport-only fallback (30 days per visit, 90 per calendar year)', () => {
  it.each(['CA', 'JP', 'AU'])('%s has no European override — plain airport-only entitlement', (code) => {
    const rule = getBelarusRule(code);
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    expect(rule.entitlements).toHaveLength(1);
    expect(rule.entitlements[0].temporalWindows).toBeUndefined();
    const limits = rule.entitlements[0].limits;
    expect(limits.some((l) => l.type === 'per_visit' && l.value === 30)).toBe(true);
    const calendarLimit = limits.find((l): l is CalendarPeriodLimit => l.type === 'calendar_period');
    expect(calendarLimit).toBeDefined();
    expect(calendarLimit!.days).toBe(90);
    expect(calendarLimit!.periodDays).toBe(365);
  });

  it('carries the airport-list note and the Russia-arrival restriction note', () => {
    const rule = getBelarusRule('CA');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const notes = rule.entitlements[0].notes ?? [];
    expect(notes.some((n) => n.text.toLowerCase().includes('minsk national airport'))).toBe(true);
    expect(notes.some((n) => n.text.toLowerCase().includes('russia'))).toBe(true);
  });

  it('unlimited 30-day visits but capped at 90 total days within a calendar year (stacked-limit regression)', () => {
    const rule = getBelarusRule('CA');
    expect(isEntitled(rule)).toBe(true);
    if (!isEntitled(rule)) return;
    const limits = rule.entitlements[0].limits;

    // Two prior 35-day trips this calendar year (70 days used, well under
    // any single visit's 30-day cap individually) leave only a 20-day
    // calendar-year budget — tighter than a fresh 30-day per-visit
    // allowance, so calendar_period must be the binding constraint here.
    const priorTrips = [
      { id: 'a', region: 0, entryDate: '2026-01-01', exitDate: '2026-02-04' }, // 35 days
      { id: 'b', region: 0, entryDate: '2026-02-20', exitDate: '2026-03-26' }, // 35 days
    ];
    const result = assessStay(limits, priorTrips as never, '2026-04-01', '2026-04-05');
    expect(result).not.toBeNull();
    // 90 - 70 = 20 days of calendar-year budget remain vs. per_visit's
    // fresh 30-day allowance — calendar_period is the worse constraint.
    expect(result!.limitType).toBe('calendar_period');
    expect(result!.daysRemaining).toBe(15);
  });
});

describe('Belarus — reclassified visa_required (source lists as visa-free, but requires another visa)', () => {
  it.each(['VN', 'HT', 'GM', 'EG', 'IN', 'JO', 'IR', 'LB', 'NA', 'PK', 'WS', 'ZA'])(
    '%s is visa_required, not entitled',
    (code) => {
      const rule = getBelarusRule(code);
      expect(rule.access).toBe('visa_required');
      if (rule.access !== 'visa_required') return;
      expect(rule.source).toEqual(BelarusSources.airport);
      expect(rule.notes?.[0]?.text.toLowerCase()).toContain('another jurisdiction');
    },
  );
});

describe('Belarus — note wording never restates the source citation', () => {
  it('no note text starts with "Source"', () => {
    for (const rule of Object.values(BELARUS.passportRules)) {
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
