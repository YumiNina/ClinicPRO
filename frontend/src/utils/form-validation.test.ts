import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  currentYearEndInputValue,
  isDateNotFuture,
  isDateWithinCurrentYearFromToday,
  isDigits,
  isEmail,
  isLetters,
  isPhone,
  keepDigits,
  keepLetters,
  todayInputValue,
} from './form-validation';

describe('form validation helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-20T12:00:00-04:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps only numeric characters for CI and phone inputs', () => {
    expect(keepDigits('CI 123-45A')).toBe('12345');
  });

  it('keeps letters with Spanish accents and removes numbers from names', () => {
    expect(keepLetters('María José 123!')).toBe('María José ');
  });

  it('accepts valid letter-only names and rejects names with numbers', () => {
    expect(isLetters('Ana María Rojas')).toBe(true);
    expect(isLetters('Ana 123')).toBe(false);
  });

  it('validates digit length boundaries', () => {
    expect(isDigits('12345', 5, 8)).toBe(true);
    expect(isDigits('1234', 5, 8)).toBe(false);
    expect(isDigits('123456789', 5, 8)).toBe(false);
  });

  it('validates phone and email happy paths', () => {
    expect(isPhone('70123456')).toBe(true);
    expect(isEmail('recepcion@clinicpro.test')).toBe(true);
  });

  it('rejects malformed phone and email values', () => {
    expect(isPhone('70A23456')).toBe(false);
    expect(isEmail('recepcion clinicpro.test')).toBe(false);
  });

  it('does not allow future dates for birth date validation', () => {
    expect(todayInputValue()).toBe('2026-05-20');
    expect(isDateNotFuture('2026-05-20')).toBe(true);
    expect(isDateNotFuture('2026-05-21')).toBe(false);
  });

  it('TDD rule: allows appointments only from today through the current year', () => {
    expect(currentYearEndInputValue()).toBe('2026-12-31');
    expect(isDateWithinCurrentYearFromToday('2026-05-20')).toBe(true);
    expect(isDateWithinCurrentYearFromToday('2026-12-31')).toBe(true);
    expect(isDateWithinCurrentYearFromToday('2027-01-01')).toBe(false);
    expect(isDateWithinCurrentYearFromToday('2026-05-19')).toBe(false);
  });
});
