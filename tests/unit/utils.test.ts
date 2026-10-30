import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { isDueToday, isOverdue } from '@/lib/utils';

describe('isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('zwraca false dla pustej daty', () => {
    expect(isOverdue(null)).toBe(false);
    expect(isOverdue(undefined)).toBe(false);
  });

  it('zwraca true dla daty w przeszłości', () => {
    expect(isOverdue('2026-10-29')).toBe(true);
  });

  it('zwraca false dla dzisiejszej daty (nie jest "po terminie", jest "na dziś")', () => {
    expect(isOverdue('2026-10-30')).toBe(false);
  });

  it('zwraca false dla daty w przyszłości', () => {
    expect(isOverdue('2026-11-05')).toBe(false);
  });
});

describe('isDueToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('zwraca false dla pustej daty', () => {
    expect(isDueToday(null)).toBe(false);
  });

  it('zwraca true dla dzisiejszej daty', () => {
    expect(isDueToday('2026-10-30')).toBe(true);
  });

  it('zwraca false dla daty wczorajszej lub jutrzejszej', () => {
    expect(isDueToday('2026-10-29')).toBe(false);
    expect(isDueToday('2026-10-31')).toBe(false);
  });
});
