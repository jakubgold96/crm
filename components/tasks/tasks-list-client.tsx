'use client';

import { PageTitle } from '@/components/ui/page-title';

/** Neon grupy zadań wg pilności: po terminie = czerwień, dziś = bursztyn, reszta = cyjan. */
const TONE_NEON = { danger: 'var(--danger)', terracotta: 'var(--terracotta)', neutral: 'var(--neon-cyan)' } as const;

import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { operationalGroupLabels, salesStageLabels, taskStatusLabels } from '@/lib/enums';
import type { Inquiry, Profile, TaskStatus } from '@/lib/types/database';
import { cn, formatDate, isDueToday, isOverdue } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type InquiryWithCompany = Inquiry & { companies: { name: string } | null };
type Scope = 'moje' | 'wszystkie';

/**
 * Widok "Zadania" — tylko zapytania, które mają faktyczny następny krok
 * (next_step) i nie są oznaczone jako zrobione. Inny kąt patrzenia niż
 * /zapytania (tam widać wszystko), tu widać tylko to, co wymaga działania.
 */
export function TasksListClient({
  inquiries,
  currentUserId,
}: {
  inquiries: InquiryWithCompany[];
  profiles: Profile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [scope, setScope] = useState<Scope>('moje');
  const [items, setItems] = useState(inquiries);
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const list = scope === 'moje' ? items.filter((i) => i.owner_id === currentUserId) : items;
    return list;
  }, [items, scope, currentUserId]);

  const overdue = filtered.filter((i) => isOverdue(i.next_step_due));
  const dueToday = filtered.filter((i) => isDueToday(i.next_step_due));
  const upcoming = filtered.filter((i) => i.next_step_due && !isOverdue(i.next_step_due) && !isDueToday(i.next_step_due));
  const noDueDate = filtered.filter((i) => !i.next_step_due);

  async function updateTaskStatus(id: string, status: TaskStatus) {
    setSavingId(id);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('inquiries')
      .update({ task_status: status, updated_by: user?.id })
      .eq('id', id);

    setSavingId(null);
    if (error) return;

    if (status === 'zrobione') {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, task_status: status } : i)));
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle count={filtered.length}>Zadania</PageTitle>
      </div>

      <div className="flex gap-1 border-b border-border">
        {(['moje', 'wszystkie'] as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={cn(
              'px-4 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors',
              scope === s
                ? 'border-b-2 border-accent text-accent'
                : 'border-b-2 border-transparent text-foreground-muted hover:text-cyan'
            )}
          >
            {s === 'moje' ? 'Moje' : 'Wszystkie'}
          </button>
        ))}
      </div>

      <TaskGroup title="Po terminie" items={overdue} tone="danger" savingId={savingId} onStatusChange={updateTaskStatus} />
      <TaskGroup title="Na dziś" items={dueToday} tone="terracotta" savingId={savingId} onStatusChange={updateTaskStatus} />
      <TaskGroup title="Nadchodzące" items={upcoming} tone="neutral" savingId={savingId} onStatusChange={updateTaskStatus} />
      <TaskGroup title="Bez terminu" items={noDueDate} tone="neutral" savingId={savingId} onStatusChange={updateTaskStatus} />

      {filtered.length === 0 && (
        <p className="text-sm text-foreground-muted">
          Brak zadań{scope === 'moje' ? ' przypisanych do Ciebie' : ''}.
        </p>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  items,
  tone,
  savingId,
  onStatusChange,
}: {
  title: string;
  items: InquiryWithCompany[];
  tone: 'danger' | 'terracotta' | 'neutral';
  savingId: string | null;
  onStatusChange: (id: string, status: TaskStatus) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2
        className="neon-text mb-2 flex items-center gap-2 font-display text-[15px] font-bold uppercase tracking-[0.08em]"
        style={{ color: TONE_NEON[tone] }}
      >
        <span aria-hidden className="size-2 rotate-45" style={{ background: TONE_NEON[tone], boxShadow: `0 0 10px ${TONE_NEON[tone]}` }} />
        {title}
        <span className="font-data text-xs font-normal text-foreground-muted tabular">[{items.length}]</span>
      </h2>

      {/* Desktop table */}
      <div
        className="hud hidden overflow-hidden bg-surface/90 md:block"
        style={{ ['--hud-line' as string]: `color-mix(in srgb, ${TONE_NEON[tone]} 45%, transparent)` }}
      >
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
            <tr>
              <th className="px-4 py-2">Numer</th>
              <th className="px-4 py-2">Firma</th>
              <th className="px-4 py-2">Następny krok</th>
              <th className="px-4 py-2">Termin</th>
              <th className="px-4 py-2">Status</th>
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
                <td className="px-4 py-2.5 text-foreground-muted">{inq.companies?.name ?? '—'}</td>
                <td className="max-w-xs truncate px-4 py-2.5 text-foreground-muted">{inq.next_step || '—'}</td>
                <td className="px-4 py-2.5">
                  <DueBadge due={inq.next_step_due} />
                </td>
                <td className="px-4 py-2.5">
                  <Select
                    value={inq.task_status}
                    disabled={savingId === inq.id}
                    onChange={(e) => onStatusChange(inq.id, e.target.value as TaskStatus)}
                    className="h-8 text-xs"
                  >
                    {Object.entries(taskStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {items.map((inq) => (
          <div key={inq.id} className="hud hud-sm bg-surface/90 p-4">
            <Link href={`/zapytania/${inq.id}`} className="block">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{inq.number}</span>
                <DueBadge due={inq.next_step_due} />
              </div>
              <p className="mt-1 text-sm text-foreground-muted">{inq.companies?.name ?? '—'}</p>
              {inq.next_step && <p className="mt-1 text-sm text-foreground">{inq.next_step}</p>}
              <div className="mt-2 flex gap-1.5">
                <Badge tone="accent">{operationalGroupLabels[inq.operational_group]}</Badge>
                <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
              </div>
            </Link>
            <Select
              value={inq.task_status}
              disabled={savingId === inq.id}
              onChange={(e) => onStatusChange(inq.id, e.target.value as TaskStatus)}
              className="mt-3 h-8 text-xs"
            >
              {Object.entries(taskStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
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
