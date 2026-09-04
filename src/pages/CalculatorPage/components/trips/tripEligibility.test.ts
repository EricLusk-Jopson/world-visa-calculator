import { describe, it, expect } from 'vitest';
import { computeTravelerEligibility, relevantTemporalWindows } from './tripEligibility';
import { VisaRegion } from '@/types';
import type { Traveler, EntitledRule } from '@/types';
import { MontenegroSources } from '@/data/sources';

function traveler(passportCode: string): Traveler {
  return { id: 't1', name: 'Traveler', passportCode, trips: [] };
}

describe('computeTravelerEligibility — source citation on the effective rule', () => {
  it('cites the country-specific page on the Rule row for a standard entitled nationality (US → Montenegro)', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('US')], ['t1'], '2026-06-01');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.US.directUrl);
  });

  it('cites the country-specific page for a plain visa-required nationality (AF → Montenegro)', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('AF')], ['t1'], '2026-06-01');
    expect(e.access).toBe('visa_required');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.AF.directUrl);
    const visaNote = e.notes.find((n) => n.label === 'Visa required');
    expect(visaNote?.source?.directUrl).toBe(MontenegroSources.AF.directUrl);
  });

  it('cites Kazakhstan\'s specific page — not the generic region overview — when the trip falls outside its seasonal waiver', () => {
    // KZ's window runs 1 May – 1 Oct 2026 (a real, confirmed validFrom); 1 Dec
    // 2026 is outside it, so the effective rule for this trip is a
    // synthesized visa_required with no source of its own — the fallback
    // must still resolve to KZ's own page, not gov.me's bare index.
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('KZ')], ['t1'], '2026-12-01');
    expect(e.access).toBe('visa_required');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.KZ.directUrl);
    expect(e.ruleSource?.directUrl).not.toBe('https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro');
    const visaNote = e.notes.find((n) => n.label === 'Visa required');
    expect(visaNote?.source?.directUrl).toBe(MontenegroSources.KZ.directUrl);
  });

  it('cites Turkey\'s specific page when the trip falls outside its temporary waiver window', () => {
    // TR's window has no stated validFrom (unbounded past) and ends 31 Oct
    // 2026 — 15 Nov 2026 is the first date genuinely outside it.
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-11-15');
    expect(e.access).toBe('visa_required');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.TR.directUrl);
  });

  it('cites Kazakhstan\'s specific page while its seasonal waiver is active', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('KZ')], ['t1'], '2026-06-01');
    expect(e.access).toBe('entitled');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.KZ.directUrl);
  });

  it('resolves Turkey as entitled for a trip well before the old placeholder date — the reported bug', () => {
    // Turkey's window has no stated validFrom, so it covers any date up to
    // its validUntil, including dates that predate when this data was
    // recorded — this is the exact bug the user reported.
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-01-01');
    expect(e.access).toBe('entitled');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.TR.directUrl);
  });
});

describe('computeTravelerEligibility — temporal window notes', () => {
  it('does not duplicate a temporal window as a separate "Condition" note (Turkey, waiver active)', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-09-15');
    expect(e.access).toBe('entitled');
    expect(e.temporalWindows.some((w) => w.active)).toBe(true);
    expect(e.notes.some((n) => n.label === 'Condition')).toBe(false);
    const waiverNote = e.notes.find((n) => n.label === 'Temporary waiver');
    expect(waiverNote).toBeDefined();
    expect(waiverNote?.text).not.toContain('no stated start date');
  });

  it('the "Temporary waiver" note cites Turkey\'s specific source page', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-09-15');
    const waiverNote = e.notes.find((n) => n.label === 'Temporary waiver');
    expect(waiverNote?.source?.directUrl).toBe(MontenegroSources.TR.directUrl);
  });

  it('a trip genuinely outside every window (dormant) gets an "Upcoming waiver period" or "Prior waiver period" note, not "Condition"', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-11-15');
    expect(e.access).toBe('visa_required');
    expect(e.notes.some((n) => n.label === 'Condition')).toBe(false);
    const priorNote = e.notes.find((n) => n.label === 'Prior waiver period');
    expect(priorNote).toBeDefined();
    expect(priorNote?.source?.directUrl).toBe(MontenegroSources.TR.directUrl);
  });
});

describe('relevantTemporalWindows — ±1 year relevance filter', () => {
  const rule: EntitledRule = {
    access: 'entitled',
    entitlements: [{
      temporalWindows: [{ validUntil: '2025-06-30', description: 'Old waiver' }],
      limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
    }],
  };

  it('includes a window ending just inside the one-year-before boundary', () => {
    // Trip entry 2026-06-15 → range start 2025-06-15; window ends 2025-06-30 (inside).
    const rel = relevantTemporalWindows(rule, '2026-06-15');
    expect(rel).toHaveLength(1);
    expect(rel[0].active).toBe(false);
  });

  it('excludes a window ending just outside the one-year-before boundary', () => {
    // Trip entry 2026-07-15 → range start 2025-07-15; window ends 2025-06-30 (outside).
    const rel = relevantTemporalWindows(rule, '2026-07-15');
    expect(rel).toHaveLength(0);
  });

  it('flags the window active when the trip entry date falls inside it', () => {
    const activeRule: EntitledRule = {
      access: 'entitled',
      entitlements: [{
        temporalWindows: [{ validFrom: '2026-01-01', validUntil: '2026-12-31', description: 'Current waiver' }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
    };
    const rel = relevantTemporalWindows(activeRule, '2026-06-01');
    expect(rel).toHaveLength(1);
    expect(rel[0].active).toBe(true);
  });

  it('includes an upcoming window starting within a year after the trip', () => {
    const upcomingRule: EntitledRule = {
      access: 'entitled',
      entitlements: [{
        temporalWindows: [{ validFrom: '2027-01-01', validUntil: '2027-03-01', description: 'Future waiver' }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
    };
    const rel = relevantTemporalWindows(upcomingRule, '2026-06-01');
    expect(rel).toHaveLength(1);
    expect(rel[0].active).toBe(false);
  });

  it('returns an empty list for a non-entitled rule', () => {
    expect(relevantTemporalWindows({ access: 'visa_required' }, '2026-06-01')).toEqual([]);
  });
});
