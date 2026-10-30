'use client';

import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { cn, formatDate, isDueToday, isOverdue } from '@/lib/utils';
import {
  dueFilterLabels,
  inquirySortLabels,
  inquirySourceLabels,
  operationalGroupLabels,
  salesStageLabels,
} from '@/lib/enums';
import {
  activeFilterCount,
  emptyFilters,
  filterInquiries,
  sortInquiries,
  type DueFilter,
  type InquiryListFilters,
  type InquiryListItem,
  type SortKey,
} from '@/lib/inquiries/list-filters';
import type { Profile } from '@/lib/types/database';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type InquiryWithCompany = InquiryListItem;
type View = 'operacyjne' | 'sprzedaz' | 'moje';

export function InquiriesListClient({
  inquiries,
  profiles,
  currentUserId,
  initialSearch = '',
}: {
  inquiries: InquiryWithCompany[];
  profiles: Profile[];
  currentUserId: string;
  initialSearch?: string;
}) {
  const [view, setView] = useState<View>('operacyjne');
  const [filters, setFilters] = useState<InquiryListFilters>({ ...emptyFilters, search: initialSearch });
  const [sortKey, setSortKey] = useState<SortKey>('termin');
  const [showFilters, setShowFilters] = useState(false);

  const setFilter = <K extends keyof InquiryListFilters>(key: K, value: InquiryListFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const filtered = useMemo(() => {
    const base = view === 'moje' ? inquiries.filter((i) => i.owner_id === currentUserId) : inquiries;
    // Lokalna data użytkownika (YYYY-MM-DD) — nie UTC, żeby "dziś" po północy w PL było dzisiaj.
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return sortInquiries(filterInquiries(base, filters, today), sortKey);
  }, [inquiries, view, filters, sortKey, currentUserId]);

  const extraFilterCount = activeFilterCount({ ...filters, search: '' });

  // W widoku "Sprzedaż" grupujemy po etapie sprzedaży zamiast grupy operacyjnej.
  const groups =
    view === 'sprzedaz'
      ? groupBy(filtered, (i) => i.sales_stage, salesStageLabels)
      : groupBy(filtered, (i) => i.operational_group, operationalGroupLabels);

  const countries = Array.from(new Set(inquiries.map((i) => i.country).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold uppercase tracking-[0.04em] text-foreground">Zapytania ({filtered.length})</h1>
        <Link href="/zapytania/nowe">
          <Button size="sm">
            <Plus className="size-4" aria-hidden />
            Nowe zapytanie
          </Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(['operacyjne', 'sprzedaz', 'moje'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors',
              view === v
                ? 'border-b-2 border-accent text-accent'
                : 'border-b-2 border-transparent text-foreground-muted hover:text-cyan'
            )}
          >
            {v === 'operacyjne' ? 'Operacyjne' : v === 'sprzedaz' ? 'Sprzedaż' : 'Moje'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            className="sm:flex-1"
            placeholder="Szukaj zapytań…"
            title="Szuka w: numer, firma, kontakt, kraj, opis, następny krok"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
          <div className="flex gap-2">
            <Select className="flex-1" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
              {Object.entries(inquirySortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="secondary"
              className="md:hidden"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              Filtry{extraFilterCount > 0 ? ` (${extraFilterCount})` : ''}
            </Button>
          </div>
        </div>

        <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid md:grid-cols-5', !showFilters && 'hidden')}>
          <Select value={filters.due} onChange={(e) => setFilter('due', e.target.value as DueFilter)}>
            <option value="">Każdy termin</option>
            {Object.entries(dueFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select value={filters.ownerId} onChange={(e) => setFilter('ownerId', e.target.value)}>
            <option value="">Wszyscy właściciele</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </Select>
          <Select value={filters.salesStage} onChange={(e) => setFilter('salesStage', e.target.value)}>
            <option value="">Każdy etap</option>
            {Object.entries(salesStageLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select value={filters.country} onChange={(e) => setFilter('country', e.target.value)}>
            <option value="">Wszystkie kraje</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={filters.source} onChange={(e) => setFilter('source', e.target.value)}>
            <option value="">Wszystkie źródła</option>
            {Object.entries(inquirySourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        {activeFilterCount(filters) > 0 && (
          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            className="text-sm text-accent hover:underline"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      <div className="space-y-8">
        {groups.map(([key, label, items]) => (
          <div key={key}>
            <h2 className="mb-2 flex items-center gap-2 font-display text-[15px] font-bold uppercase tracking-[0.08em] text-foreground">
              {label}
              <span className="font-data text-xs font-normal text-foreground-muted tabular">[{items.length}]</span>
            </h2>

            {/* Desktop table */}
            <div className="hud hidden overflow-hidden bg-surface/90 md:block">
              <table className="w-full table-fixed text-sm">
                {/* Wspólne szerokości kolumn — kolumny trzymają linię między grupami. */}
                <colgroup>
                  <col className="w-[9.5rem]" />
                  <col className="w-[17%]" />
                  <col />
                  <col className="w-[24%]" />
                  <col className="w-[14.5rem]" />
                </colgroup>
                <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
                  <tr>
                    <th className="px-4 py-2">Numer</th>
                    <th className="px-4 py-2">Firma</th>
                    <th className="px-4 py-2">Opis</th>
                    <th className="px-4 py-2">Następny krok</th>
                    <th className="px-4 py-2">Termin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((inq) => (
                    <tr key={inq.id} className="transition-colors hover:bg-white/[0.04]">
                      <td className="px-4 py-2.5">
                        <Link href={`/zapytania/${inq.id}`} className="font-medium text-foreground hover:text-accent">
                          {inq.number}
                        </Link>
                      </td>
                      <td className="truncate px-4 py-2.5 text-foreground-muted">{inq.companies?.name ?? '—'}</td>
                      <td className="truncate px-4 py-2.5 text-foreground-muted">
                        {inq.short_description || '—'}
                      </td>
                      <td className="truncate px-4 py-2.5 text-foreground-muted">{inq.next_step || '—'}</td>
                      <td className="px-4 py-2.5">
                        <DueBadge due={inq.next_step_due} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-2 md:hidden">
              {items.map((inq) => (
                <Link
                  key={inq.id}
                  href={`/zapytania/${inq.id}`}
                  className="hud hud-sm block bg-surface/90 p-4 transition-colors hover:bg-cyan/[0.05] active:bg-surface-raised"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{inq.number}</span>
                    <DueBadge due={inq.next_step_due} />
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">{inq.companies?.name ?? '—'}</p>
                  {inq.next_step && <p className="mt-1 text-sm text-foreground">{inq.next_step}</p>}
                </Link>
              ))}
            </div>

            {items.length === 0 && <p className="text-sm text-foreground-muted">Brak pozycji w tej grupie.</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DueBadge({ due }: { due: string | null }) {
  if (isOverdue(due)) return <Badge tone="danger">Po terminie: {formatDate(due)}</Badge>;
  if (isDueToday(due)) return <Badge tone="terracotta">Dziś</Badge>;
  if (!due) return <Badge tone="neutral">Brak terminu</Badge>;
  return <Badge tone="neutral">{formatDate(due)}</Badge>;
}

function groupBy(
  items: InquiryWithCompany[],
  keyFn: (item: InquiryWithCompany) => string,
  labels: Record<string, string>
): [string, string, InquiryWithCompany[]][] {
  const order = Object.keys(labels);
  const map = new Map<string, InquiryWithCompany[]>();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  // Kolejność wewnątrz grupy = kolejność wejścia (już posortowane przez sortInquiries).
  return order.filter((k) => map.has(k)).map((k) => [k, labels[k], map.get(k)!]);
}
