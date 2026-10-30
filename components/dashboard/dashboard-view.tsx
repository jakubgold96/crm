/**
 * Widok pulpitu — czysta prezentacja, dane przychodzą z app/(app)/page.tsx.
 * `now` jest parametrem (nie `new Date()` w środku), żeby widok był
 * deterministyczny dla danej chwili.
 */
import { GroupBadge } from '@/components/ui/group-badge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Count } from '@/components/dashboard/count';
import { KpiTile } from '@/components/dashboard/kpi-tile';
import { LiveClock } from '@/components/dashboard/live-clock';
import { QuickSearch } from '@/components/dashboard/quick-search';
import { salesKpiLabels, salesStageLabels } from '@/lib/enums';
import { computeSalesKpis, toLocalDate, type StageChange } from '@/lib/dashboard/sales-kpis';
import { formatDate, greetingName } from '@/lib/utils';
import type { Inquiry, Profile } from '@/lib/types/database';
import { ArrowRight, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

const TZ = 'Europe/Warsaw';

export type DashboardInquiry = Inquiry & { companies: { name: string } | null };

const pctFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0, signDisplay: 'exceptZero' });

export function DashboardView({
  profile,
  all,
  stageChanges,
  now,
}: {
  profile: Profile;
  all: DashboardInquiry[];
  stageChanges: StageChange[];
  now: Date;
}) {
  const today = toLocalDate(now.toISOString(), TZ);
  const dateLabel = new Intl.DateTimeFormat('pl-PL', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
  const clock = new Intl.DateTimeFormat('pl-PL', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  const active = all.filter((i) => !i.is_archived);
  const tasks = active.filter((i) => i.next_step && i.task_status !== 'zrobione');
  const due = (i: DashboardInquiry) => i.next_step_due?.slice(0, 10) ?? null;
  const overdue = tasks.filter((i) => due(i) !== null && due(i)! < today);
  const dueToday = tasks.filter((i) => due(i) === today);
  const todayList = [...tasks]
    .sort((a, b) => {
      const da = due(a);
      const db = due(b);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    })
    .slice(0, 4);

  const myInquiries = active.filter((i) => i.owner_id === profile.id);
  // Bez pozycji, które już są w "Dzisiaj" — żeby to samo zapytanie nie wisiało na pulpicie dwa razy.
  const shownToday = new Set(todayList.map((i) => i.id));
  const needsAttention = active.filter((i) => i.operational_group === 'wymaga_dzialania' && !shownToday.has(i.id));

  const kpis = computeSalesKpis(all, stageChanges, today, TZ);
  // Imię z profilu (pierwsze słowo pola imię i nazwisko) — decyzja właściciela produktu.
  const firstName = (greetingName(profile.full_name) || 'operatorze').toUpperCase();
  const waiting = overdue.length + dueToday.length;
  const summary = waiting === 0 ? 'nic nie czeka na dziś' : `${waiting} ${pluralZadanie(waiting)} dziś`;

  const tickerItems = [
    `PO TERMINIE: ${overdue.length}`,
    `NA DZIŚ: ${dueToday.length}`,
    `AKTYWNE ZAPYTANIA: ${active.length}`,
    ...kpis.map(
      (k) =>
        `${salesKpiLabels[k.key].toUpperCase()} (MIESIĄC): ${k.current}${
          k.changePct === null ? '' : ` [${pctFormat.format(k.changePct)}%]`
        }`
    ),
  ];

  return (
    <div className="space-y-5">
      {/* Pasek statusu: stałe odczyty + przewijana taśma z bieżącymi liczbami */}
      <div className="hud hud-sm flex flex-wrap items-stretch overflow-hidden bg-void/60 font-data text-[11px] uppercase tracking-[0.08em] sm:flex-nowrap">
        <div className="flex shrink-0 items-center gap-2 bg-accent px-3 py-2 font-semibold text-accent-foreground sm:py-0">
          <span aria-hidden className="size-1.5 bg-accent-foreground" />
          <LiveClock initial={clock} />
        </div>
        <div className="hidden shrink-0 items-center border-r border-border px-3 text-foreground-muted sm:flex">
          {dateLabel}
        </div>
        <div className="relative order-last w-full min-w-0 overflow-hidden border-t border-border py-2 sm:order-none sm:w-auto sm:flex-1 sm:border-t-0" aria-hidden>
          <div className="ticker gap-10 whitespace-nowrap text-foreground-muted">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex gap-10 pr-10">
                {tickerItems.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1">
                    <ChevronRight className="size-3 text-magenta" strokeWidth={2.5} aria-hidden />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {overdue.length > 0 && (
          <Link
            href="/zadania"
            className="ml-auto flex shrink-0 items-center gap-2 bg-danger/15 px-3 py-2 font-semibold text-danger hover:bg-danger/25 sm:ml-0 sm:py-0"
          >
            <span aria-hidden className="neon-hum size-1.5 bg-danger" />
            Alarm: {overdue.length} po terminie
          </Link>
        )}
      </div>

      {/* Panel główny */}
      <section aria-labelledby="greeting" className="hud hud-lg overflow-hidden bg-surface/80">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="grid-floor" />
          <div className="absolute -right-20 -top-24 size-[28rem] rounded-full bg-magenta/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 size-[22rem] rounded-full bg-cobalt/10 blur-3xl" />
          <div className="hazard absolute right-10 top-0 h-2 w-40 opacity-70 [clip-path:polygon(0_0,100%_0,calc(100%-8px)_100%,8px_100%)]" />
        </div>

        <div className="relative grid grid-cols-1 gap-8 p-5 sm:p-8 lg:min-h-[27rem] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10 lg:p-12">
          <div className="stagger flex min-w-0 flex-col justify-center">
            <h1
              id="greeting"
              className="font-display text-[2.6rem] font-bold uppercase leading-[0.95] tracking-[0.01em] text-foreground sm:text-6xl xl:text-7xl"
            >
              Hey,{' '}
              <span data-text={firstName} className="glitch rgb-split text-accent">
                {firstName}
              </span>
              <span aria-hidden className="caret" />
            </h1>
            <p className="mt-4 font-data text-[13px] text-foreground-muted">
              <span className="text-magenta">&gt;</span> {dateLabel} · {summary}
            </p>

            <dl className="mt-7 grid max-w-md grid-cols-3 gap-px bg-border">
              <Readout label="Po terminie" value={overdue.length} color={overdue.length > 0 ? 'var(--danger)' : undefined} />
              <Readout label="Na dziś" value={dueToday.length} color={dueToday.length > 0 ? 'var(--terracotta)' : undefined} />
              <Readout label="Aktywne" value={active.length} color="var(--cobalt)" />
            </dl>

            <div className="mt-7">
              <QuickSearch />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/zapytania/nowe">
                <Button>
                  <Plus className="size-4" aria-hidden /> Nowe zapytanie
                </Button>
              </Link>
              <Link href="/firmy/nowa">
                <Button variant="secondary">
                  <Plus className="size-4" aria-hidden /> Firma
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 flex-col border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold uppercase tracking-[0.08em] text-foreground">
                Dzisiaj <span className="font-data text-xs font-normal text-foreground-muted">[{todayList.length}]</span>
              </h2>
              <Link
                href="/zadania"
                className="font-data text-[11px] uppercase tracking-[0.08em] text-fog hover:text-pearl"
              >
                Wszystkie zadania <ArrowRight className="ml-1 inline size-3" strokeWidth={2.25} aria-hidden />
              </Link>
            </div>
            {todayList.length === 0 ? (
              <p className="mt-6 font-data text-sm text-foreground-muted">
                Żadne zapytanie nie ma otwartego następnego kroku. Dodaj krok z terminem na karcie zapytania, a pojawi
                się tutaj.
              </p>
            ) : (
              <ul className="stagger mt-3 divide-y divide-border">
                {todayList.map((inq) => (
                  <li key={inq.id}>
                    <Link
                      href={`/zapytania/${inq.id}`}
                      className="group -mx-3 flex items-center gap-3 px-3 py-3 transition-colors hover:bg-cobalt/[0.06]"
                    >
                      <DueChip due={due(inq)} today={today} className="hidden sm:inline-flex" />
                      <div className="min-w-0 flex-1">
                        <DueChip due={due(inq)} today={today} className="mb-1.5 sm:hidden" />
                        <p className="truncate text-sm">
                          <span className="font-data font-semibold text-foreground group-hover:underline decoration-cobalt decoration-2 underline-offset-4">
                            {inq.number}
                          </span>
                          <span className="text-foreground-muted"> · {inq.companies?.name ?? 'bez firmy'}</span>
                        </p>
                        <p className="line-clamp-2 text-sm text-foreground/85 sm:truncate">{inq.next_step}</p>
                      </div>
                      <ChevronRight
                        className="size-4 shrink-0 text-foreground-muted transition-[transform,color] duration-150 group-hover:translate-x-0.5 group-hover:underline decoration-cobalt decoration-2 underline-offset-4"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section aria-label="Sprzedaż w tym miesiącu" className="stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <KpiTile
            key={kpi.key}
            index={(i + 1) as 1 | 2 | 3 | 4}
            label={salesKpiLabels[kpi.key]}
            kpi={kpi}
            goodWhenUp={kpi.key !== 'przegrane'}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Moje zapytania</CardTitle>
            <span className="font-data text-sm text-foreground-muted tabular">[{myInquiries.length}]</span>
          </CardHeader>
          <CardContent className="py-2">
            <InquiryMiniList inquiries={myInquiries.slice(0, 6)} empty="Nie masz przypisanych aktywnych zapytań." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Wymaga działania</CardTitle>
            <span className="font-data text-sm text-foreground-muted tabular">[{needsAttention.length}]</span>
          </CardHeader>
          <CardContent className="py-2">
            <InquiryMiniList
              inquiries={needsAttention.slice(0, 6)}
              showGroup={false}
              empty="Poza listą „Dzisiaj” nic więcej nie czeka na działanie."
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden">
        <Link href="/zapytania">
          <Button variant="secondary" className="w-full">
            Wszystkie zapytania
          </Button>
        </Link>
      </div>
    </div>
  );
}

/** "1 zadanie czeka", "3 zadania czekają", "5 zadań czeka" — odmiana liczebnika z czasownikiem. */
function pluralZadanie(n: number) {
  if (n === 1) return 'zadanie czeka';
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? 'zadania czekają' : 'zadań czeka';
}

function Readout({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-void/70 px-3 py-3 sm:px-4">
      <dt className="font-data text-[10.5px] uppercase tracking-[0.1em] text-foreground-muted">{label}</dt>
      <dd
        className="neon-text mt-1 font-display text-3xl font-bold leading-none sm:text-4xl"
        style={{ color: color ?? 'var(--foreground)' }}
      >
        <Count value={value} />
      </dd>
    </div>
  );
}

function DueChip({ due, today, className = '' }: { due: string | null; today: string; className?: string }) {
  if (!due)
    return (
      <Badge tone="neutral" className={`min-w-[5.5rem] justify-center ${className}`}>
        bez terminu
      </Badge>
    );
  if (due < today)
    return (
      <Badge tone="danger" className={`min-w-[5.5rem] justify-center ${className}`}>
        {formatDate(due)}
      </Badge>
    );
  if (due === today)
    return (
      <Badge tone="terracotta" className={`min-w-[5.5rem] justify-center ${className}`}>
        dziś
      </Badge>
    );
  return (
    <Badge tone="neutral" className={`min-w-[5.5rem] justify-center ${className}`}>
      {formatDate(due)}
    </Badge>
  );
}

function InquiryMiniList({
  inquiries,
  empty,
  showGroup = true,
}: {
  inquiries: DashboardInquiry[];
  empty: string;
  showGroup?: boolean;
}) {
  if (inquiries.length === 0) {
    return <p className="py-3 font-data text-sm text-foreground-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {inquiries.map((inq) => (
        <li key={inq.id}>
          <Link href={`/zapytania/${inq.id}`} className="group block py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm">
                <span className="font-data font-semibold text-foreground group-hover:underline decoration-cobalt decoration-2 underline-offset-4">{inq.number}</span>
                <span className="text-foreground-muted"> · {inq.short_description || 'bez opisu'}</span>
              </span>
              <span className="shrink-0 font-data text-xs text-foreground-muted tabular">
                {formatDate(inq.next_step_due)}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {showGroup && <GroupBadge group={inq.operational_group} />}
              <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
