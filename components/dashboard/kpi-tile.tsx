import { Count } from '@/components/dashboard/count';
import { Sparkline } from '@/components/dashboard/sparkline';
import type { KpiResult } from '@/lib/dashboard/sales-kpis';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const pctFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1, signDisplay: 'exceptZero' });

/**
 * Tafla KPI w świecie HUD: ciemny panel ze ściętym rogiem, neon w kolorze
 * tafli (--kpi-N): krawędź, poświata, liczba i rysująca się linia trendu.
 * `goodWhenUp=false` dla "Przegrane" — wzrost jest wtedy zły.
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
  const color = `var(--kpi-${index})`;
  const up = (kpi.changePct ?? 0) > 0;
  const down = (kpi.changePct ?? 0) < 0;
  const good = (up && goodWhenUp) || (down && !goodWhenUp);
  const bad = (down && goodWhenUp) || (up && !goodWhenUp);
  const weeklyTotal = kpi.weekly.reduce((a, b) => a + b, 0);

  return (
    <article
      className="hud group flex min-h-[10.5rem] min-w-0 flex-col overflow-hidden p-4 sm:min-h-[11.5rem] sm:p-5"
      style={{
        ['--hud-line' as string]: `color-mix(in srgb, ${color} 55%, transparent)`,
        background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${color} 22%, transparent) 0%, transparent 60%), linear-gradient(180deg, color-mix(in srgb, ${color} 7%, var(--surface)) 0%, var(--surface) 100%)`,
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${color}, transparent 80%)` }} />
      <h3 className="flex items-center gap-2 font-data text-[11px] font-medium uppercase tracking-[0.1em] text-foreground-muted">
        <span aria-hidden className="size-2 rotate-45" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        {label}
      </h3>

      <p className="neon-text mt-2 font-display text-4xl font-bold leading-none sm:text-5xl" style={{ color }}>
        <Count value={kpi.current} />
      </p>

      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-data text-[11px] text-foreground-muted">
        {kpi.changePct === null ? (
          <span className="bg-white/[0.06] px-1.5 py-0.5 uppercase text-foreground/80">
            {kpi.current > 0 ? 'nowe' : 'bez zmian'}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 font-semibold tabular"
            style={{ color: good ? 'var(--kpi-up)' : bad ? 'var(--kpi-down)' : 'var(--foreground)' }}
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
        color={color}
        label={`${label}: ostatnie 8 tygodni, łącznie ${weeklyTotal}`}
        className="mt-auto h-12 w-full pt-3"
      />
    </article>
  );
}
