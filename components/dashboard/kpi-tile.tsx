import { Sparkline } from '@/components/dashboard/sparkline';
import type { KpiResult } from '@/lib/dashboard/sales-kpis';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const pctFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1, signDisplay: 'exceptZero' });

/**
 * Tafla KPI: nasycony gradient (tokeny --kpi-N-*), liczba z bieżącego
 * miesiąca, zmiana vs ten sam okres poprzedniego miesiąca, 8 tygodni historii.
 * `goodWhenUp=false` dla "Przegrane" — wzrost jest wtedy zły, więc kolor chipa
 * się odwraca.
 */
export function KpiTile({
  index,
  label,
  kpi,
  goodWhenUp = true,
}: {
  index: 1 | 2 | 3 | 4;
  label: string;
  kpi: KpiResult;
  goodWhenUp?: boolean;
}) {
  const up = (kpi.changePct ?? 0) > 0;
  const down = (kpi.changePct ?? 0) < 0;
  const good = (up && goodWhenUp) || (down && !goodWhenUp);
  const bad = (down && goodWhenUp) || (up && !goodWhenUp);
  const weeklyTotal = kpi.weekly.reduce((a, b) => a + b, 0);

  return (
    <article
      className="relative flex min-h-[10rem] min-w-0 flex-col overflow-hidden rounded-2xl border p-4 text-white sm:min-h-[10.5rem] sm:p-5"
      style={{
        background: `linear-gradient(140deg, var(--kpi-${index}-from) 0%, var(--kpi-${index}-to) 100%)`,
        // Obrzeże w odcieniu tafli + wewnętrzna poświata od góry, zamiast neutralnej białej ramki.
        borderColor: `color-mix(in srgb, var(--kpi-${index}-to) 65%, white 22%)`,
        boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.18), inset 0 0 28px color-mix(in srgb, var(--kpi-${index}-to) 45%, transparent), 0 18px 40px -20px rgb(0 0 0 / 0.8)`,
      }}
    >
      <h3 className="flex items-center gap-2 text-[13px] font-medium text-white/80">
        <span aria-hidden className="size-1.5 rounded-full" style={{ background: `var(--kpi-${index}-line)` }} />
        {label}
      </h3>

      <p className="mt-2 text-3xl font-semibold sm:text-4xl tracking-tight tabular">{kpi.current}</p>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/75">
        {kpi.changePct === null ? (
          <span className="rounded-full bg-white/12 px-2 py-0.5 font-medium text-white/90">
            {kpi.current > 0 ? 'nowe' : 'bez zmian'}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-0.5 rounded-full bg-black/20 px-2 py-0.5 font-semibold tabular"
            style={{ color: good ? 'var(--kpi-up)' : bad ? 'var(--kpi-down)' : 'rgb(255 255 255 / 0.9)' }}
          >
            {up && <ArrowUpRight className="size-3.5" aria-hidden />}
            {down && <ArrowDownRight className="size-3.5" aria-hidden />}
            {pctFormat.format(kpi.changePct)}%
          </span>
        )}
        <span className="tabular">
          poprz.<span className="hidden sm:inline"> miesiąc</span>: {kpi.previous}
        </span>
      </p>

      <Sparkline
        values={kpi.weekly}
        color={`var(--kpi-${index}-line)`}
        label={`${label}: ostatnie 8 tygodni, łącznie ${weeklyTotal}`}
        className="mt-auto h-12 w-full pt-3"
      />
    </article>
  );
}
