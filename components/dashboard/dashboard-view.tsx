/**
 * Widok pulpitu — czysta prezentacja, dane przychodzą z app/(app)/page.tsx.
 * `now` jest parametrem (nie `new Date()` w środku), żeby widok był
 * deterministyczny dla danej chwili.
 */
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiTile } from '@/components/dashboard/kpi-tile';
import { QuickSearch } from '@/components/dashboard/quick-search';
import { operationalGroupLabels, salesKpiLabels, salesStageLabels } from '@/lib/enums';
import { computeSalesKpis, toLocalDate, type StageChange } from '@/lib/dashboard/sales-kpis';
import { formatDate } from '@/lib/utils';
import type { Inquiry, Profile } from '@/lib/types/database';
import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

const TZ = 'Europe/Warsaw';

export type DashboardInquiry = Inquiry & { companies: { name: string } | null };

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
  const hour = Number(new Intl.DateTimeFormat('pl-PL', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(now));
  const dateLabel = new Intl.DateTimeFormat('pl-PL', {
    timeZone: TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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
  const firstName = profile.full_name.split(' ')[0];
  const greeting = hour < 18 ? 'Dzień dobry' : 'Dobry wieczór';

  const summary =
    overdue.length + dueToday.length === 0
      ? 'Nic nie czeka na dziś.'
      : `${overdue.length + dueToday.length} ${pluralZadanie(overdue.length + dueToday.length)} dziś.`;

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="greeting"
        className="relative overflow-hidden rounded-[1.75rem] text-hero-fg shadow-[0_1px_0_rgb(255_255_255/0.9)_inset,0_30px_60px_-30px_rgb(0_0_0/0.9)]"
        style={{
          background:
            'radial-gradient(90% 120% at 88% 30%, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0) 55%), linear-gradient(160deg, var(--hero-bg) 0%, var(--hero-bg-2) 100%)',
        }}
      >
        <div className="grid grid-cols-1 gap-8 p-5 sm:p-8 lg:min-h-[25rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10 lg:p-12">
          <div className="flex min-w-0 flex-col justify-center">
            <h1 id="greeting" className="text-[2.1rem] font-medium leading-tight tracking-[-0.03em] sm:text-[2.85rem]">
              {greeting},{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--greet-1), var(--greet-2) 55%, var(--greet-3))' }}
              >
                {firstName}
              </span>
            </h1>
            <p className="mt-2 text-[15px] text-hero-muted">
              {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} · {summary}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 sm:mt-7 sm:gap-x-10">
              <HeroStat label="Po terminie" value={overdue.length} tone={overdue.length > 0 ? 'danger' : undefined} />
              <HeroStat label="Na dziś" value={dueToday.length} />
              <HeroStat label="Aktywne zapytania" value={active.length} />
            </dl>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuickSearch />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/zapytania/nowe"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-hero-fg px-4 text-sm font-medium text-white transition-colors hover:bg-hero-ink-hover"
              >
                <Plus className="size-4" aria-hidden /> Nowe zapytanie
              </Link>
              <Link
                href="/firmy/nowa"
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-hero-fg ring-1 ring-hero-line transition-colors hover:bg-white"
              >
                <Plus className="size-4" aria-hidden /> Firma
              </Link>
            </div>
          </div>

          <div className="flex min-w-0 flex-col border-t border-hero-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold tracking-tight">Dzisiaj</h2>
              <Link href="/zadania" className="text-sm font-medium text-hero-muted hover:text-hero-fg">
                Wszystkie zadania
              </Link>
            </div>
            {todayList.length === 0 ? (
              <p className="mt-6 text-sm text-hero-muted">
                Żadne zapytanie nie ma otwartego następnego kroku. Dodaj krok z terminem na karcie zapytania, a pojawi
                się tutaj.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-hero-line">
                {todayList.map((inq) => (
                  <li key={inq.id}>
                    <Link
                      href={`/zapytania/${inq.id}`}
                      className="group -mx-3 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/80"
                    >
                      <DueChip due={due(inq)} today={today} className="hidden sm:block" />
                      <div className="min-w-0 flex-1">
                        <DueChip due={due(inq)} today={today} className="mb-1.5 sm:hidden" />
                        <p className="truncate text-sm font-medium">
                          {inq.number}
                          <span className="font-normal text-hero-muted"> · {inq.companies?.name ?? 'bez firmy'}</span>
                        </p>
                        <p className="line-clamp-2 text-sm text-hero-muted sm:truncate">{inq.next_step}</p>
                      </div>
                      <ChevronRight
                        className="size-4 shrink-0 text-hero-muted transition-transform duration-150 group-hover:translate-x-0.5"
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

      <section aria-label="Sprzedaż w tym miesiącu" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
            <span className="text-sm text-foreground-muted tabular">{myInquiries.length}</span>
          </CardHeader>
          <CardContent className="py-2">
            <InquiryMiniList inquiries={myInquiries.slice(0, 6)} empty="Nie masz przypisanych aktywnych zapytań." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Wymaga działania</CardTitle>
            <span className="text-sm text-foreground-muted tabular">{needsAttention.length}</span>
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

function HeroStat({ label, value, tone }: { label: string; value: number; tone?: 'danger' }) {
  return (
    <div>
      <dt className="text-xs font-medium text-hero-muted">{label}</dt>
      <dd className={`mt-0.5 text-2xl font-semibold tracking-tight tabular ${tone === 'danger' ? 'text-hero-danger' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

function DueChip({ due, today, className = '' }: { due: string | null; today: string; className?: string }) {
  const base = `w-fit min-w-[4.75rem] shrink-0 rounded-full px-2 py-1 text-center text-xs font-medium tabular ${className}`;
  if (!due) return <span className={`${base} bg-black/5 text-hero-muted`}>bez terminu</span>;
  if (due < today) return <span className={`${base} bg-hero-danger-bg text-hero-danger`}>{formatDate(due)}</span>;
  if (due === today) return <span className={`${base} bg-hero-today-bg text-hero-today`}>dziś</span>;
  return <span className={`${base} bg-black/5 text-hero-fg`}>{formatDate(due)}</span>;
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
    return <p className="py-3 text-sm text-foreground-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {inquiries.map((inq) => (
        <li key={inq.id}>
          <Link href={`/zapytania/${inq.id}`} className="group block py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-foreground group-hover:text-accent">
                {inq.number}
                <span className="font-normal text-foreground-muted"> · {inq.short_description || 'bez opisu'}</span>
              </span>
              <span className="shrink-0 text-xs text-foreground-muted tabular">{formatDate(inq.next_step_due)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {showGroup && <Badge tone="accent">{operationalGroupLabels[inq.operational_group]}</Badge>}
              <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
