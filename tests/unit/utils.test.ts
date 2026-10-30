import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { greetingName, isDueToday, isOverdue } from '@/lib/utils';

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

describe('isOverdue i isDueToday są spójne', () => {
  afterEach(() => vi.useRealTimers());

  it('ten sam termin nigdy nie jest jednocześnie po terminie i na dziś (o każdej porze doby)', () => {
    vi.useFakeTimers();
    for (const iso of ['2026-10-30T00:05:00', '2026-10-30T00:59:00', '2026-10-30T12:00:00', '2026-10-30T23:59:00']) {
      vi.setSystemTime(new Date(iso)); // czas lokalny urządzenia
      for (const due of ['2026-10-29', '2026-10-30', '2026-10-31']) {
        expect(isOverdue(due) && isDueToday(due)).toBe(false);
      }
      expect(isDueToday('2026-10-30')).toBe(true);
      expect(isOverdue('2026-10-29')).toBe(true);
    }
  });
});

describe('greetingName', () => {
  it('bierze pierwsze słowo imienia i nazwiska', () => {
    expect(greetingName('Jakub Gołaszewski')).toBe('Jakub');
  });
  it('gdy w profilu jest e-mail, bierze pierwszy człon loginu', () => {
    expect(greetingName('sprzedaz.test@inndes.local')).toBe('sprzedaz');
    expect(greetingName('jakubgolaszewski96@gmail.com')).toBe('jakubgolaszewski96');
  });
  it('pusty profil daje pusty napis', () => {
    expect(greetingName('')).toBe('');
    expect(greetingName(null)).toBe('');
  });
});
