import { describe, expect, it } from 'vitest';
import {
  computeSalesKpis,
  monthWindows,
  stageEntries,
  toLocalDate,
  type KpiInquiry,
  type StageChange,
} from '@/lib/dashboard/sales-kpis';

const TZ = 'Europe/Warsaw';
const TODAY = '2026-10-30';

describe('toLocalDate', () => {
  it('przelicza znacznik UTC na datę w Warszawie (23:30 UTC = następny dzień)', () => {
    expect(toLocalDate('2026-10-29T23:30:00Z', TZ)).toBe('2026-10-30');
    expect(toLocalDate('2026-10-29T21:00:00Z', TZ)).toBe('2026-10-29');
  });
  it('zostawia czystą datę bez zmian', () => {
    expect(toLocalDate('2026-10-05', TZ)).toBe('2026-10-05');
  });
});

describe('monthWindows', () => {
  it('porównuje te same dni poprzedniego miesiąca', () => {
    expect(monthWindows('2026-10-30')).toEqual({
      current: { from: '2026-10-01', to: '2026-10-30' },
      previous: { from: '2026-09-01', to: '2026-09-30' },
    });
  });
  it('przycina do końca krótszego miesiąca i obsługuje styczeń', () => {
    expect(monthWindows('2026-03-31').previous).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(monthWindows('2027-01-15').previous).toEqual({ from: '2026-12-01', to: '2026-12-15' });
  });
});

const inquiries: KpiInquiry[] = [
  // Utworzone od razu jako "oferta_wyslana", bez zmian etapu.
  { id: 'a', inquiry_date: '2026-10-02', created_at: '2026-10-02T08:00:00Z', sales_stage: 'oferta_wyslana' },
  // Utworzone jako "nowe", potem oferta, potem wygrane.
  { id: 'b', inquiry_date: '2026-09-10', created_at: '2026-09-10T08:00:00Z', sales_stage: 'wygrane' },
  // Utworzone we wrześniu, przegrane w październiku.
  { id: 'c', inquiry_date: '2026-09-20', created_at: '2026-09-20T08:00:00Z', sales_stage: 'przegrane' },
];
const changes: StageChange[] = [
  { record_id: 'b', old_value: 'nowe', new_value: 'oferta_wyslana', changed_at: '2026-09-25T10:00:00Z' },
  { record_id: 'b', old_value: 'oferta_wyslana', new_value: 'wygrane', changed_at: '2026-10-20T10:00:00Z' },
  { record_id: 'c', old_value: 'kwalifikacja', new_value: 'przegrane', changed_at: '2026-10-29T23:30:00Z' },
];

describe('stageEntries', () => {
  it('odtwarza etap początkowy z old_value pierwszej zmiany', () => {
    const e = stageEntries(inquiries, changes, TZ);
    expect(e.get('nowe')).toEqual(['2026-09-10']);
    expect(e.get('kwalifikacja')).toEqual(['2026-09-20']);
    expect(e.get('oferta_wyslana')?.sort()).toEqual(['2026-09-25', '2026-10-02']);
  });
});

describe('computeSalesKpis', () => {
  const kpis = Object.fromEntries(computeSalesKpis(inquiries, changes, TODAY, TZ).map((k) => [k.key, k]));

  it('liczy bieżący miesiąc i ten sam okres poprzedniego', () => {
    expect(kpis.nowe.current).toBe(1);
    expect(kpis.nowe.previous).toBe(2);
    expect(kpis.nowe.changePct).toBe(-50);
    expect(kpis.oferta_wyslana.current).toBe(1);
    expect(kpis.oferta_wyslana.previous).toBe(1);
    expect(kpis.oferta_wyslana.changePct).toBe(0);
  });

  it('zwraca null zamiast nieskończoności, gdy poprzednio było 0', () => {
    expect(kpis.wygrane.current).toBe(1);
    expect(kpis.wygrane.changePct).toBeNull();
    // przegrana o 23:30 UTC 29.10 to 30.10 w Warszawie — nadal październik
    expect(kpis.przegrane.current).toBe(1);
  });

  it('historia ma 8 tygodni, a suma zgadza się z wejściami w tym oknie', () => {
    expect(kpis.wygrane.weekly).toHaveLength(8);
    expect(kpis.wygrane.weekly.at(-2)).toBe(1); // 20.10 = tydzień 17–23.10
    expect(kpis.przegrane.weekly.at(-1)).toBe(1); // 30.10 = bieżący tydzień
    expect(kpis.nowe.weekly.reduce((a, b) => a + b, 0)).toBe(3);
  });
});
