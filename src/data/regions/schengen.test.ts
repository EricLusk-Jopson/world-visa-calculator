import { describe, it, expect } from 'vitest';
import { getSchengenRule, SCHENGEN } from './schengen';

describe('getSchengenRule', () => {
  it('returns visa_free for a visa-free nationality (US)', () => {
    const rule = getSchengenRule('US');
    expect(rule.access).toBe('visa_free');
    expect(rule.allowanceDays).toBe(90);
    expect(rule.windowDays).toBe(180);
  });

  it('returns free_movement for an EU nationality (FR)', () => {
    const rule = getSchengenRule('FR');
    expect(rule.access).toBe('free_movement');
  });

  it('falls back to defaultRule (visa_required) for an unknown code', () => {
    const rule = getSchengenRule('XX');
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(SCHENGEN.defaultRule);
  });

  it('falls back to defaultRule (visa_required) for null input', () => {
    const rule = getSchengenRule(null);
    expect(rule.access).toBe('visa_required');
    expect(rule).toEqual(SCHENGEN.defaultRule);
  });

  it('returns visa_free with suspension note for GE (Georgia ordinary passports)', () => {
    // Ordinary Georgian passports remain visa-free; only diplomatic/service/official
    // passports were suspended (March 2026 – March 2027).
    const rule = getSchengenRule('GE');
    expect(rule.access).toBe('visa_free');
    expect(Array.isArray(rule.notes)).toBe(true);
    expect(rule.notes!.length).toBeGreaterThan(0);
    const suspensionNote = rule.notes!.find((n) => n.text.toLowerCase().includes('suspended'));
    expect(suspensionNote).toBeDefined();
    expect(suspensionNote!.source.directUrl.length).toBeGreaterThan(0);
  });

  it('sets requiresETIAS true for US and false for VA (Vatican)', () => {
    expect(getSchengenRule('US').requiresETIAS).toBe(true);
    expect(getSchengenRule('VA').requiresETIAS).toBe(false);
  });
});
