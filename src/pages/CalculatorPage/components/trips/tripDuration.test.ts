import { describe, it, expect } from 'vitest';
import { computeTravelerDurations } from './tripDuration';
import { VisaRegion } from '@/types';
import type { Traveler } from '@/types';

function traveler(id: string, passportCode: string | null): Traveler {
  return { id, name: 'Traveler', passportCode, trips: [] };
}

describe('computeTravelerDurations — free_movement never gets a stay-duration breakdown', () => {
  it('a Schengen/EU national traveling within Schengen gets no duration entry (no rolling breakdown)', () => {
    const durations = computeTravelerDurations({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'FR')],
      travelerIds: ['t1'],
      entryDate: '2026-06-01',
      exitDate: '2026-06-10',
      destination: 'FR',
    });
    expect(durations.find((d) => d.id === 't1')).toBeUndefined();
  });

  it('a visa-required nationality in Schengen still gets an untracked entry (regression check)', () => {
    const durations = computeTravelerDurations({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'AF')],
      travelerIds: ['t1'],
      entryDate: '2026-06-01',
      exitDate: '2026-06-10',
      destination: 'FR',
    });
    const dur = durations.find((d) => d.id === 't1');
    expect(dur).toBeDefined();
    expect(dur!.tracked).toBe(false);
  });

  it('a standard visa-free non-EU nationality in Schengen still gets the rolling breakdown (regression check)', () => {
    const durations = computeTravelerDurations({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'US')],
      travelerIds: ['t1'],
      entryDate: '2026-06-01',
      exitDate: '2026-06-10',
      destination: 'FR',
    });
    const dur = durations.find((d) => d.id === 't1');
    expect(dur).toBeDefined();
    expect(dur!.tracked).toBe(true);
    expect(dur!.rollingStatus).toBeDefined();
  });

  it('a region\'s own national (free_movement outside Schengen) also gets no duration entry (Georgia → Georgia)', () => {
    const durations = computeTravelerDurations({
      region: VisaRegion.Georgia,
      travelers: [traveler('t1', 'GE')],
      travelerIds: ['t1'],
      entryDate: '2026-06-01',
      exitDate: '2026-06-10',
      destination: 'GE',
    });
    expect(durations.find((d) => d.id === 't1')).toBeUndefined();
  });

  it('an EU national in Cyprus (free_movement, non-Schengen region) also gets no duration entry', () => {
    const durations = computeTravelerDurations({
      region: VisaRegion.Cyprus,
      travelers: [traveler('t1', 'FR')],
      travelerIds: ['t1'],
      entryDate: '2026-06-01',
      exitDate: '2026-06-10',
      destination: 'CY',
    });
    expect(durations.find((d) => d.id === 't1')).toBeUndefined();
  });
});
