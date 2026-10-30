import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { companySegmentLabels, relationshipStatusLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/server';
import type { Company } from '@/lib/types/database';
import Link from 'next/link';

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('companies')
    .select('*')
    .eq('is_archived', false)
    .order('name', { ascending: true });

  const companies = (data ?? []) as Company[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Firmy ({companies.length})</h1>
        <Link href="/firmy/nowa">
          <Button size="sm">+ Dodaj firmę</Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <p className="text-sm text-foreground-muted">Brak firm. Dodaj pierwszą.</p>
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-background text-left text-xs uppercase tracking-wide text-foreground-muted">
                <tr>
                  <th className="px-4 py-2.5">Nazwa</th>
                  <th className="px-4 py-2.5">Segment</th>
                  <th className="px-4 py-2.5">Kraj</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-background">
                    <td className="px-4 py-2.5">
                      <Link href={`/firmy/${c.id}`} className="font-medium text-foreground hover:text-accent">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-foreground-muted">
                      {c.segment ? companySegmentLabels[c.segment] : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-foreground-muted">{c.country || '—'}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone="neutral">{relationshipStatusLabels[c.relationship_status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: karty, nie pomniejszona tabela (PRD sekcja 5) */}
          <div className="space-y-3 md:hidden">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/firmy/${c.id}`}
                className="block rounded-lg border border-border bg-surface p-4"
              >
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  {c.segment ? companySegmentLabels[c.segment] : '—'} · {c.country || '—'}
                </p>
                <Badge tone="neutral" className="mt-2">
                  {relationshipStatusLabels[c.relationship_status]}
                </Badge>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
