'use client';

import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { PageTitle } from '@/components/ui/page-title';
import { StatusChip } from '@/components/ui/status-chip';
import { leadStatusLabels } from '@/lib/enums';
import type { IcpProfile, Lead, LeadStatus, Profile } from '@/lib/types/database';
import { leadStatusNeon } from '@/lib/ui/urgency';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export type LeadListItem = Lead & { icp_profiles: { name: string } | null };

/** Lista leadów: wyszukiwanie + filtry (status / ICP / właściciel). Zwykły kod, bez AI. */
export function LeadsListClient({
  leads,
  icpProfiles,
  profiles,
}: {
  leads: LeadListItem[];
  icpProfiles: Pick<IcpProfile, 'id' | 'name'>[];
  profiles: Pick<Profile, 'id' | 'full_name'>[];
}) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [icp, setIcp] = useState('');
  const [owner, setOwner] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (q && ![l.company_name, l.domain, l.country, l.need].filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
      if (status && l.status !== status) return false;
      if (icp && l.icp_profile_id !== icp) return false;
      if (owner && l.owner_id !== owner) return false;
      return true;
    });
  }, [leads, search, status, icp, owner]);

  const ownerName = (id: string | null) => profiles.find((p) => p.id === id)?.full_name ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle count={filtered.length}>Leady</PageTitle>
        <Link href="/leady/nowy">
          <Button size="sm">
            <Plus className="size-4" aria-hidden />
            Nowy lead
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Szukaj leadów…" value={search} onChange={(e) => setSearch(e.target.value)} title="Szuka w: firma, domena, kraj, potrzeba" />
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Każdy status</option>
          {Object.entries(leadStatusLabels).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
        <Select value={icp} onChange={(e) => setIcp(e.target.value)} aria-label="Profil ICP">
          <option value="">Każdy profil ICP</option>
          {icpProfiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <Select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Właściciel">
          <option value="">Wszyscy właściciele</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="hud bg-surface/90 p-6">
          <p className="text-sm text-foreground-muted">
            {leads.length === 0
              ? 'Nie ma jeszcze leadów. Dodaj pierwszego — wystarczy sama domena firmy.'
              : 'Żaden lead nie pasuje do filtrów.'}
          </p>
        </div>
      ) : (
        <>
          <div className="hud hidden overflow-hidden bg-surface/90 md:block">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col />
                <col className="w-[18%]" />
                <col className="w-[11rem]" />
                <col className="w-[6rem]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
                <tr>
                  <th className="px-4 py-2">Firma / domena</th>
                  <th className="px-4 py-2">Profil ICP</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Wynik</th>
                  <th className="px-4 py-2">Właściciel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="transition-colors hover:bg-pearl/[0.04]">
                    <td className="truncate px-4 py-2.5">
                      <Link href={`/leady/${l.id}`} className="font-semibold text-foreground hover:underline decoration-cobalt decoration-2 underline-offset-4">
                        {l.company_name || l.domain}
                      </Link>
                      {l.company_name && l.domain && <span className="ml-2 font-data text-xs text-foreground-muted">{l.domain}</span>}
                    </td>
                    <td className="truncate px-4 py-2.5 text-foreground-muted">{l.icp_profiles?.name ?? '—'}</td>
                    <td className="px-4 py-2.5">
                      <StatusChip label={leadStatusLabels[l.status as LeadStatus]} color={leadStatusNeon(l.status)} />
                    </td>
                    <td className="px-4 py-2.5 font-data tabular text-foreground">{l.score ?? '—'}</td>
                    <td className="truncate px-4 py-2.5 text-foreground-muted">{ownerName(l.owner_id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filtered.map((l) => (
              <Link key={l.id} href={`/leady/${l.id}`} className="hud hud-sm block bg-surface/90 p-4 transition-colors hover:bg-pearl/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate font-semibold text-foreground">{l.company_name || l.domain}</span>
                  <StatusChip label={leadStatusLabels[l.status as LeadStatus]} color={leadStatusNeon(l.status)} />
                </div>
                <p className="mt-1 font-data text-xs text-foreground-muted">
                  {[l.domain, l.icp_profiles?.name, l.score !== null ? `wynik ${l.score}` : null].filter(Boolean).join(' · ')}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
