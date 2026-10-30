'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { cn, formatDate, isDueToday, isOverdue } from '@/lib/utils';
import { operationalGroupLabels, salesStageLabels } from '@/lib/enums';
import type { Inquiry, Profile } from '@/lib/types/database';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type InquiryWithCompany = Inquiry & { companies: { name: string } | null };
type View = 'operacyjne' | 'sprzedaz' | 'moje';

export function InquiriesListClient({
  inquiries,
  profiles,
  currentUserId,
}: {
  inquiries: InquiryWithCompany[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const [view, setView] = useState<View>('operacyjne');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const filtered = useMemo(() => {
    let list = inquiries;

    if (view === 'moje') {
      list = list.filter((i) => i.owner_id === currentUserId);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.number.toLowerCase().includes(q) ||
          (i.companies?.name ?? '').toLowerCase().includes(q) ||
          (i.country ?? '').toLowerCase().includes(q) ||
          (i.short_description ?? '').toLowerCase().includes(q) ||
          (i.next_step ?? '').toLowerCase().includes(q)
      );
    }
    if (ownerFilter) list = list.filter((i) => i.owner_id === ownerFilter);
    if (countryFilter) list = list.filter((i) => (i.country ?? '').toLowerCase() === countryFilter.toLowerCase());
    if (sourceFilter) list = list.filter((i) => i.source === sourceFilter);

    return list;
  }, [inquiries, view, search, ownerFilter, countryFilter, sourceFilter, currentUserId]);

  // W widoku "Sprzedaż" grupujemy po etapie sprzedaży zamiast grupy operacyjnej.
  const groups =
    view === 'sprzedaz'
      ? groupBy(filtered, (i) => i.sales_stage, salesStageLabels)
      : groupBy(filtered, (i) => i.operational_group, operationalGroupLabels);

  const countries = Array.from(new Set(inquiries.map((i) => i.country).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Zapytania ({filtered.length})</h1>
        <Link href="/zapytania/nowe">
          <Button size="sm">+ Nowe zapytanie</Button>
        </Link>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(['operacyjne', 'sprzedaz', 'moje'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'px-4 py-2 text-sm font-medium',
              view === v ? 'border-b-2 border-accent text-accent' : 'text-foreground-muted hover:text-foreground'
            )}
          >
            {v === 'operacyjne' ? 'Operacyjne' : v === 'sprzedaz' ? 'Sprzedaż' : 'Moje'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Input placeholder="Szukaj…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
          <option value="">Wszyscy właściciele</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </Select>
        <Select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
          <option value="">Wszystkie kraje</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">Wszystkie źródła</option>
          <option value="formularz">Formularz</option>
          <option value="email">E-mail</option>
          <option value="telefon">Telefon</option>
          <option value="polecenie">Polecenie</option>
          <option value="architekt">Architekt</option>
          <option value="targi">Targi</option>
          <option value="powrot_klienta">Powrót klienta</option>
          <option value="inne">Inne</option>
        </Select>
      </div>

      <div className="space-y-8">
        {groups.map(([key, label, items]) => (
          <div key={key}>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              {label}
              <span className="rounded-full bg-background px-2 py-0.5 text-xs text-foreground-muted">
                {items.length}
              </span>
            </h2>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-lg border border-border md:block">
              <table className="w-full text-sm">
                <thead className="bg-background text-left text-xs uppercase tracking-wide text-foreground-muted">
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
                    <tr key={inq.id} className="hover:bg-background">
                      <td className="px-4 py-2.5">
                        <Link href={`/zapytania/${inq.id}`} className="font-medium text-foreground hover:text-accent">
                          {inq.number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-foreground-muted">{inq.companies?.name ?? '—'}</td>
                      <td className="max-w-xs truncate px-4 py-2.5 text-foreground-muted">
                        {inq.short_description || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-foreground-muted">{inq.next_step || '—'}</td>
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
                  className="block rounded-lg border border-border bg-surface p-4"
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
  // Zaległe/dzisiejsze na górze wewnątrz każdej grupy.
  for (const [, list] of map) {
    list.sort((a, b) => {
      const aDue = a.next_step_due;
      const bDue = b.next_step_due;
      if (!aDue && !bDue) return 0;
      if (!aDue) return 1;
      if (!bDue) return -1;
      return aDue.localeCompare(bDue);
    });
  }
  return order.filter((k) => map.has(k)).map((k) => [k, labels[k], map.get(k)!]);
}
