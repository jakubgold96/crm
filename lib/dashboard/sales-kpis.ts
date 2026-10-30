import type { SalesStage } from '@/lib/types/database';

/**
 * KPI sprzedaży na pulpicie — liczone z prawdziwych danych, bez AI i bez
 * zmyślania (CLAUDE.md zasady #5, #10):
 *
 * - "Nowe zapytania": zapytania wg `inquiry_date`.
 * - "Oferty wysłane" / "Wygrane" / "Przegrane": WEJŚCIA w dany etap
 *   sprzedaży. Moment wejścia bierzemy z `audit_log` (trigger zapisuje każdą
 *   zmianę `sales_stage` z `changed_at`). Etap, w którym zapytanie powstało,
 *   nie ma wpisu w audit_log (trigger jest AFTER UPDATE), więc odtwarzamy go:
 *   = `old_value` najwcześniejszej zmiany etapu, a gdy zmian nie było —
 *   bieżący `sales_stage`; data wejścia = `created_at`.
 *
 * Porównanie miesiąc do miesiąca jest uczciwe: bieżący miesiąc do dziś vs
 * te same dni poprzedniego miesiąca (nie cały poprzedni miesiąc).
 * Historia: 8 tygodniowych koszyków, ostatni kończy się dziś.
 */

export type KpiInquiry = {
  id: string;
  inquiry_date: string;
  created_at: string;
  sales_stage: SalesStage;
};

export type StageChange = {
  record_id: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
};

export type KpiKey = 'nowe' | 'oferta_wyslana' | 'wygrane' | 'przegrane';

export type KpiResult = {
  key: KpiKey;
  current: number;
  previous: number;
  /** Zmiana procentowa vs ten sam okres poprzedniego miesiąca; null gdy poprzednio 0. */
  changePct: number | null;
  /** 8 tygodni, od najstarszego do bieżącego. */
  weekly: number[];
};

export const KPI_WEEKS = 8;

/** Data kalendarzowa (YYYY-MM-DD) chwili `iso` w danej strefie. */
export function toLocalDate(iso: string, timeZone: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

/** Okno bieżącego miesiąca do dziś i to samo okno w poprzednim miesiącu. */
export function monthWindows(today: string) {
  const [y, m, d] = today.split('-').map(Number);
  const pad = (n: number) => String(n).padStart(2, '0');
  const curStart = `${y}-${pad(m)}-01`;
  const py = m === 1 ? y - 1 : y;
  const pm = m === 1 ? 12 : m - 1;
  const prevEndDay = Math.min(d, daysInMonth(py, pm));
  return {
    current: { from: curStart, to: today },
    previous: { from: `${py}-${pad(pm)}-01`, to: `${py}-${pad(pm)}-${pad(prevEndDay)}` },
  };
}

/** Daty wejść zapytań w każdy etap (lokalne YYYY-MM-DD). */
export function stageEntries(
  inquiries: KpiInquiry[],
  changes: StageChange[],
  timeZone: string
): Map<string, string[]> {
  const byRecord = new Map<string, StageChange[]>();
  for (const c of changes) {
    const list = byRecord.get(c.record_id) ?? [];
    list.push(c);
    byRecord.set(c.record_id, list);
  }

  const entries = new Map<string, string[]>();
  const push = (stage: string | null, iso: string) => {
    if (!stage) return;
    const list = entries.get(stage) ?? [];
    list.push(toLocalDate(iso, timeZone));
    entries.set(stage, list);
  };

  for (const inq of inquiries) {
    const recordChanges = (byRecord.get(inq.id) ?? []).sort((a, b) => a.changed_at.localeCompare(b.changed_at));
    const initialStage = recordChanges.length > 0 ? recordChanges[0].old_value : inq.sales_stage;
    push(initialStage, inq.created_at);
    for (const c of recordChanges) push(c.new_value, c.changed_at);
  }
  return entries;
}

function countBetween(dates: string[], from: string, to: string): number {
  let n = 0;
  for (const d of dates) if (d >= from && d <= to) n++;
  return n;
}

function weeklySeries(dates: string[], today: string): number[] {
  const series: number[] = [];
  for (let i = KPI_WEEKS - 1; i >= 0; i--) {
    const to = addDays(today, -7 * i);
    const from = addDays(to, -6);
    series.push(countBetween(dates, from, to));
  }
  return series;
}

function changePct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function computeSalesKpis(
  inquiries: KpiInquiry[],
  changes: StageChange[],
  today: string,
  timeZone = 'Europe/Warsaw'
): KpiResult[] {
  const { current, previous } = monthWindows(today);
  const entries = stageEntries(inquiries, changes, timeZone);

  const datesFor: Record<KpiKey, string[]> = {
    nowe: inquiries.map((i) => i.inquiry_date.slice(0, 10)),
    oferta_wyslana: entries.get('oferta_wyslana') ?? [],
    wygrane: entries.get('wygrane') ?? [],
    przegrane: entries.get('przegrane') ?? [],
  };

  return (Object.keys(datesFor) as KpiKey[]).map((key) => {
    const dates = datesFor[key];
    const cur = countBetween(dates, current.from, current.to);
    const prev = countBetween(dates, previous.from, previous.to);
    return {
      key,
      current: cur,
      previous: prev,
      changePct: changePct(cur, prev),
      weekly: weeklySeries(dates, today),
    };
  });
}
