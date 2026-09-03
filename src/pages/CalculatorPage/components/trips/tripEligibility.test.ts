import { describe, it, expect } from 'vitest';
import { computeTravelerEligibility } from './tripEligibility';
import { VisaRegion } from '@/types';
import type { Traveler } from '@/types';
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
    // KZ's date_range waiver runs 1 May – 1 Oct 2026; 1 Dec 2026 is outside it,
    // so the effective rule for this trip is a synthesized visa_required with
    // no source of its own — the fallback must still resolve to KZ's own page,
    // not gov.me's bare diplomatic-missions index.
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('KZ')], ['t1'], '2026-12-01');
    expect(e.access).toBe('visa_required');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.KZ.directUrl);
    expect(e.ruleSource?.directUrl).not.toBe('https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro');
    const visaNote = e.notes.find((n) => n.label === 'Visa required');
    expect(visaNote?.source?.directUrl).toBe(MontenegroSources.KZ.directUrl);
  });

  it('cites Turkey\'s specific page when the trip falls outside its temporary waiver window', () => {
    // TR's waiver runs 30 Aug – 31 Oct 2026; 1 Jun 2026 is outside it.
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-06-01');
    expect(e.access).toBe('visa_required');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.TR.directUrl);
  });

  it('cites Kazakhstan\'s specific page while its seasonal waiver is active', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('KZ')], ['t1'], '2026-06-01');
    expect(e.access).toBe('entitled');
    expect(e.ruleSource?.directUrl).toBe(MontenegroSources.KZ.directUrl);
  });
});

describe('computeTravelerEligibility — date_range temporal exception notes', () => {
  it('does not duplicate the date_range condition as a separate "Condition" note (Turkey, waiver active)', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-09-15');
    expect(e.access).toBe('entitled');
    expect(e.temporalException?.active).toBe(true);
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

  it('the "Seasonal exception" note (waiver dormant) also cites the specific source page, with no "Condition" duplicate', () => {
    const [e] = computeTravelerEligibility(VisaRegion.Montenegro, [traveler('TR')], ['t1'], '2026-06-01');
    expect(e.access).toBe('visa_required');
    expect(e.notes.some((n) => n.label === 'Condition')).toBe(false);
    const exceptionNote = e.notes.find((n) => n.label === 'Seasonal exception');
    expect(exceptionNote?.source?.directUrl).toBe(MontenegroSources.TR.directUrl);
  });
});
