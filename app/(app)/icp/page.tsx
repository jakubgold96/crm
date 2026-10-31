import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { StatusChip } from '@/components/ui/status-chip';
import { requireUser } from '@/lib/auth';
import { companySegmentLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/server';
import { plural } from '@/lib/utils';
import type { IcpProfile } from '@/lib/types/database';
import { Plus } from 'lucide-react';
import Link from 'next/link';

/** Ile pól profilu jest wypełnionych — puste profile z migracji są jawnie "do uzupełnienia". */
function completeness(p: IcpProfile) {
  const checks = [
    p.countries.length > 0,
    Boolean(p.typical_problem),
    p.matching_services.length > 0,
    p.positive_criteria.length > 0,
    p.exclusion_criteria.length > 0,
    Boolean(p.message_tone),
  ];
  return { done: checks.filter(Boolean).length, total: checks.length };
}

export default async function IcpPage() {
  await requireUser();
  const supabase = await createClient();
  const [{ data }, { data: leadCounts }] = await Promise.all([
    supabase.from('icp_profiles').select('*').eq('is_archived', false).order('name'),
    supabase.from('leads').select('icp_profile_id').eq('is_archived', false),
  ]);
  const profiles = (data ?? []) as IcpProfile[];
  const countFor = (id: string) => (leadCounts ?? []).filter((l) => l.icp_profile_id === id).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageTitle count={profiles.length}>Profile ICP</PageTitle>
          <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
            Opis idealnego klienta dla każdego segmentu. Lead przypięty do profilu jest oceniany według jego kryteriów — w Fazie 3b
            także przez agenta.
          </p>
        </div>
        <Link href="/icp/nowy">
          <Button size="sm">
            <Plus className="size-4" aria-hidden />
            Nowy profil
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {profiles.map((p) => {
          const c = completeness(p);
          return (
            <Link key={p.id} href={`/icp/${p.id}`} className="hud group block bg-surface/90 p-5 transition-colors hover:bg-pearl/[0.04]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-lg font-bold uppercase tracking-[0.06em] text-foreground group-hover:underline decoration-cobalt decoration-2 underline-offset-4">
                  {p.name}
                </h2>
                {c.done < c.total ? (
                  <StatusChip label={`do uzupełnienia ${c.done}/${c.total}`} color="var(--terracotta)" />
                ) : (
                  <StatusChip label="kompletny" color="var(--sage)" />
                )}
              </div>
              <p className="mt-1 font-data text-xs text-foreground-muted">
                {[p.segment ? companySegmentLabels[p.segment] : null, p.countries.join(', ') || null, plural(countFor(p.id), 'lead', 'leady', 'leadów')]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {p.typical_problem && <p className="mt-3 line-clamp-2 text-sm text-foreground">{p.typical_problem}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
