import { GroupBadge } from '@/components/ui/group-badge';
import { Badge } from '@/components/ui/badge';
import { companySegmentLabels, salesStageLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { Company, Inquiry } from '@/lib/types/database';
import Link from 'next/link';

type ArchivedInquiry = Inquiry & { companies: { name: string } | null };

/**
 * Faza 2: zapytania i firmy nie są nigdy usuwane (CLAUDE.md #3) — ta strona
 * jest jedynym miejscem, gdzie zarchiwizowane rekordy są zebrane razem,
 * żeby "ukryte z głównej listy" nie znaczyło "zgubione".
 */
export default async function ArchivePage() {
  const supabase = await createClient();

  const [{ data: inquiriesData }, { data: companiesData }] = await Promise.all([
    supabase
      .from('inquiries')
      .select('*, companies(name)')
      .eq('is_archived', true)
      .order('archived_at', { ascending: false }),
    supabase.from('companies').select('*').eq('is_archived', true).order('name', { ascending: true }),
  ]);

  const inquiries = (inquiriesData ?? []) as ArchivedInquiry[];
  const companies = (companiesData ?? []) as Company[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="rgb-split font-display text-2xl font-bold uppercase tracking-[0.04em] text-foreground">Archiwum</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Zarchiwizowane zapytania i firmy — nic nie jest tu usuwane, tylko ukryte z głównych list.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Zapytania ({inquiries.length})</h2>

        {inquiries.length === 0 ? (
          <p className="text-sm text-foreground-muted">Brak zarchiwizowanych zapytań.</p>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hud hidden overflow-hidden bg-surface/90 md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
                  <tr>
                    <th className="px-4 py-2.5">Numer</th>
                    <th className="px-4 py-2.5">Firma</th>
                    <th className="px-4 py-2.5">Powód archiwizacji</th>
                    <th className="px-4 py-2.5">Zarchiwizowano</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="transition-colors hover:bg-white/[0.04]">
                      <td className="px-4 py-2.5">
                        <Link href={`/zapytania/${inq.id}`} className="font-medium text-foreground hover:text-accent">
                          {inq.number}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-foreground-muted">{inq.companies?.name ?? '—'}</td>
                      <td className="px-4 py-2.5 text-foreground-muted">{inq.archived_reason || '—'}</td>
                      <td className="px-4 py-2.5 text-foreground-muted">{formatDate(inq.archived_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: karty, nie pomniejszona tabela */}
            <div className="space-y-2 md:hidden">
              {inquiries.map((inq) => (
                <Link
                  key={inq.id}
                  href={`/zapytania/${inq.id}`}
                  className="hud hud-sm block bg-surface/90 p-4 transition-colors hover:bg-cyan/[0.05] active:bg-surface-raised"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{inq.number}</span>
                    <Badge tone="neutral">{formatDate(inq.archived_at)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground-muted">{inq.companies?.name ?? '—'}</p>
                  {inq.archived_reason && (
                    <p className="mt-1 text-sm text-foreground">{inq.archived_reason}</p>
                  )}
                  <div className="mt-2 flex gap-1.5">
                    <GroupBadge group={inq.operational_group} />
                    <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-sm font-semibold text-foreground">Firmy ({companies.length})</h2>

        {companies.length === 0 ? (
          <p className="text-sm text-foreground-muted">Brak zarchiwizowanych firm.</p>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hud hidden overflow-hidden bg-surface/90 md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
                  <tr>
                    <th className="px-4 py-2.5">Nazwa</th>
                    <th className="px-4 py-2.5">Segment</th>
                    <th className="px-4 py-2.5">Kraj</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-white/[0.04]">
                      <td className="px-4 py-2.5">
                        <Link href={`/firmy/${c.id}`} className="font-medium text-foreground hover:text-accent">
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-foreground-muted">
                        {c.segment ? companySegmentLabels[c.segment] : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-foreground-muted">{c.country || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: karty */}
            <div className="space-y-2 md:hidden">
              {companies.map((c) => (
                <Link
                  key={c.id}
                  href={`/firmy/${c.id}`}
                  className="hud hud-sm block bg-surface/90 p-4 transition-colors hover:bg-cyan/[0.05] active:bg-surface-raised"
                >
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="mt-0.5 text-sm text-foreground-muted">
                    {c.segment ? companySegmentLabels[c.segment] : '—'} · {c.country || '—'}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
