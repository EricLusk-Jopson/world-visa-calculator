import { describe, it, expect } from 'vitest';
import {
  CAPTION_HEIGHT,
  MONTH_GAP,
  ROW_HEIGHT,
  buildLayout,
  describeMonth,
  monthIndexAt,
  monthIndexOf,
  nextRange,
} from './dateRangeCalendar';

describe('calendar layout', () => {
  it('counts week rows from the first weekday', () => {
    expect(describeMonth(2026, 1).weeks).toBe(4); // Feb 2026 starts on a Sunday
    expect(describeMonth(2026, 4).weeks).toBe(6); // May 2026 starts on a Friday
    expect(describeMonth(2026, 9).weeks).toBe(5);
  });

  it('places months at fixed, cumulative offsets', () => {
    const layout = buildLayout(2026, 0, 12);
    const h = (w: number) => CAPTION_HEIGHT + w * ROW_HEIGHT + MONTH_GAP;
    expect(layout.offsets[1]).toBe(h(describeMonth(2026, 0).weeks));
    expect(layout.offsets[12]).toBe(
      layout.months.reduce((sum, m) => sum + h(m.weeks), 0),
    );
  });

  it('rolls month numbers over the year boundary', () => {
    const layout = buildLayout(2025, 10, 4);
    expect(layout.months.map((m) => [m.year, m.month])).toEqual([
      [2025, 10], [2025, 11], [2026, 0], [2026, 1],
    ]);
    expect(monthIndexOf(layout, '2026-01-15')).toBe(2);
    expect(monthIndexOf(layout, '2025-01-15')).toBe(-1);
  });

  it('maps a pixel to the month containing it', () => {
    const layout = buildLayout(2026, 0, 6);
    expect(monthIndexAt(layout, -100)).toBe(0);
    expect(monthIndexAt(layout, layout.offsets[3])).toBe(3);
    expect(monthIndexAt(layout, layout.offsets[3] - 1)).toBe(2);
    expect(monthIndexAt(layout, 1e9)).toBe(5);
  });
});

describe('nextRange', () => {
  it('first tap selects a one-day trip; tapping it again clears', () => {
    expect(nextRange('2026-06-10', undefined, [])).toEqual({ from: '2026-06-10', to: '2026-06-10' });
    expect(nextRange('2026-06-10', { from: '2026-06-10', to: '2026-06-10' }, [])).toBeUndefined();
  });

  it('moves the end the tap falls beyond', () => {
    const r = { from: '2026-06-10', to: '2026-06-20' };
    expect(nextRange('2026-06-25', r, [])).toEqual({ from: '2026-06-10', to: '2026-06-25' });
    expect(nextRange('2026-06-15', r, [])).toEqual({ from: '2026-06-10', to: '2026-06-15' });
    expect(nextRange('2026-06-01', r, [])).toEqual({ from: '2026-06-01', to: '2026-06-20' });
    expect(nextRange('2026-06-20', r, [])).toEqual({ from: '2026-06-20', to: '2026-06-20' });
  });

  it('completes an open range', () => {
    expect(nextRange('2026-06-15', { from: '2026-06-10' }, [])).toEqual({
      from: '2026-06-10',
      to: '2026-06-15',
    });
  });

  it('restarts from the tapped day when the range would span a blocked day', () => {
    const blocked = [{ from: '2026-06-12', to: '2026-06-14' }];
    expect(nextRange('2026-06-20', { from: '2026-06-10', to: '2026-06-10' }, blocked)).toEqual({
      from: '2026-06-20',
    });
    // Touching a blocked range's edge is fine.
    expect(nextRange('2026-06-11', { from: '2026-06-10', to: '2026-06-10' }, blocked)).toEqual({
      from: '2026-06-10',
      to: '2026-06-11',
    });
  });
});
