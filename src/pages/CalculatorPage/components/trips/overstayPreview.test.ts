import { describe, it, expect } from 'vitest';
import { createOverstayPreview } from './overstayPreview';
import { VisaRegion } from '@/types';
import type { Traveler } from '@/types';

function traveler(id: string, passportCode: string | null, trips: Traveler['trips'] = []): Traveler {
  return { id, name: id, passportCode, trips };
}

describe('createOverstayPreview', () => {
  it('finds the first Schengen exit past 90 days for a fresh traveler', () => {
    const p = createOverstayPreview({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'US')],
      travelerIds: ['t1'],
    });
    // 2026-06-01 + 89 days is day 90 (legal); day 91 overstays.
    expect(p.overstays('2026-06-01', '2026-08-29')).toBe(false);
    expect(p.overstays('2026-06-01', '2026-08-30')).toBe(true);
    expect(p.firstOverstayExit('2026-06-01')).toBe('2026-08-30');
  });

  it('flags any traveler: the one with prior Schengen days sets the limit', () => {
    const used = traveler('t2', 'US', [
      { id: 'a', entryDate: '2026-03-01', exitDate: '2026-04-29', region: VisaRegion.Schengen },
    ]); // 60 days
    const p = createOverstayPreview({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'US'), used],
      travelerIds: ['t1', 't2'],
    });
    expect(p.overstays('2026-06-01', '2026-06-30')).toBe(false); // 30 + 60 = 90
    expect(p.overstays('2026-06-01', '2026-07-01')).toBe(true);
    expect(p.firstOverstayExit('2026-06-01')).toBe('2026-07-01');
  });

  it('a day with the allowance already used up overstays as a one-day trip', () => {
    const full = traveler('t1', 'US', [
      { id: 'a', entryDate: '2026-03-01', exitDate: '2026-05-29', region: VisaRegion.Schengen },
    ]); // 90 days
    const p = createOverstayPreview({
      region: VisaRegion.Schengen,
      travelers: [full],
      travelerIds: ['t1'],
    });
    expect(p.overstays('2026-06-01', '2026-06-01')).toBe(true);
    expect(p.firstOverstayExit('2026-06-01')).toBe('2026-06-01');
  });

  it('excludes every copy of the trip being edited', () => {
    const trip = { entryDate: '2026-06-01', exitDate: '2026-08-29', region: VisaRegion.Schengen };
    const p = createOverstayPreview({
      region: VisaRegion.Schengen,
      travelers: [
        traveler('t1', 'US', [{ id: 'copy-1', ...trip }]),
        traveler('t2', 'US', [{ id: 'copy-2', ...trip }]),
      ],
      travelerIds: ['t1', 't2'],
      excludeTripId: 'copy-1',
      excludeTrip: trip,
    });
    expect(p.overstays(trip.entryDate, trip.exitDate)).toBe(false);
  });

  it('never flags free movement, Elsewhere, or no travelers', () => {
    const fr = createOverstayPreview({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'FR')],
      travelerIds: ['t1'],
    });
    expect(fr.firstOverstayExit('2026-06-01')).toBeNull();
    const elsewhere = createOverstayPreview({
      region: VisaRegion.Elsewhere,
      travelers: [traveler('t1', 'US')],
      travelerIds: ['t1'],
    });
    expect(elsewhere.overstays('2026-01-01', '2028-01-01')).toBe(false);
    const none = createOverstayPreview({
      region: VisaRegion.Schengen,
      travelers: [traveler('t1', 'US')],
      travelerIds: [],
    });
    expect(none.firstOverstayExit('2026-06-01')).toBeNull();
  });
});
