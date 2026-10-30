import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { operationalGroupLabels, salesStageLabels } from '@/lib/enums';
import { formatDate, isDueToday, isOverdue } from '@/lib/utils';
import type { Inquiry } from '@/lib/types/database';
import Link from 'next/link';

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('is_archived', false)
    .order('next_step_due', { ascending: true, nullsFirst: false });

  const all = (inquiries ?? []) as Inquiry[];
  const overdue = all.filter((i) => isOverdue(i.next_step_due));
  const dueToday = all.filter((i) => isDueToday(i.next_step_due));
  const noMovement = all.filter((i) => !i.next_step_due);
  const myInquiries = all.filter((i) => i.owner_id === profile.id);
  const needsAttention = all.filter((i) => i.operational_group === 'wymaga_dzialania');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pulpit</h1>
          <p className="text-sm text-foreground-muted">Witaj, {profile.full_name.split(' ')[0]}.</p>
        </div>
        <div className="hidden gap-2 md:flex">
          <Link href="/zapytania/nowe">
            <Button size="sm">+ Zapytanie</Button>
          </Link>
          <Link href="/firmy/nowa">
            <Button size="sm" variant="secondary">+ Firma</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dzisiaj</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <DashboardStat label="Po terminie" count={overdue.length} tone="danger" />
            <DashboardStat label="Na dziś" count={dueToday.length} tone="terracotta" />
            <DashboardStat label="Bez ruchu (brak terminu)" count={noMovement.length} tone="neutral" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moje zadania ({myInquiries.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InquiryMiniList inquiries={myInquiries.slice(0, 6)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zapytania wymagające uwagi ({needsAttention.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InquiryMiniList inquiries={needsAttention.slice(0, 6)} />
          </CardContent>
        </Card>
      </div>

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Rekomendacje agenta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">
            Moduł Agent INNDES pojawi się w kolejnej fazie (Faza 4–5).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardStat({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: 'danger' | 'terracotta' | 'neutral';
}) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-2xl font-semibold text-foreground">{count}</p>
      <p className="mt-1 text-sm text-foreground-muted">{label}</p>
      {tone !== 'neutral' && count > 0 && (
        <Badge tone={tone === 'danger' ? 'danger' : 'terracotta'} className="mt-2">
          Wymaga uwagi
        </Badge>
      )}
    </div>
  );
}

function InquiryMiniList({ inquiries }: { inquiries: Inquiry[] }) {
  if (inquiries.length === 0) {
    return <p className="text-sm text-foreground-muted">Brak pozycji.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {inquiries.map((inq) => (
        <li key={inq.id} className="py-2">
          <Link href={`/zapytania/${inq.id}`} className="block hover:text-accent">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">
                {inq.number} — {inq.short_description || 'Bez opisu'}
              </span>
              <span className="shrink-0 text-xs text-foreground-muted">
                {formatDate(inq.next_step_due)}
              </span>
            </div>
            <div className="mt-1 flex gap-1.5">
              <Badge tone="accent">{operationalGroupLabels[inq.operational_group]}</Badge>
              <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
