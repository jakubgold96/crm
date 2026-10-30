import { GroupBadge } from '@/components/ui/group-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  companySegmentLabels,
  relationshipStatusLabels,
  salesStageLabels,
} from '@/lib/enums';
import { createClient } from '@/lib/supabase/server';
import type { Company, Contact, Inquiry } from '@/lib/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase.from('companies').select('*').eq('id', id).single();
  if (!company) notFound();

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', id)
    .order('last_name', { ascending: true });

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('company_id', id)
    .order('created_at', { ascending: false });

  const typedCompany = company as Company;
  const typedContacts = (contacts ?? []) as Contact[];
  const typedInquiries = (inquiries ?? []) as Inquiry[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="rgb-split font-display text-2xl font-bold uppercase tracking-[0.04em] text-foreground">{typedCompany.name}</h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {typedCompany.segment && <Badge tone="accent">{companySegmentLabels[typedCompany.segment]}</Badge>}
            <Badge tone="neutral">{relationshipStatusLabels[typedCompany.relationship_status]}</Badge>
            {typedCompany.country && <Badge tone="neutral">{typedCompany.country}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <a href={`/api/export/company/${id}`} download>
            <Button size="sm" variant="secondary">
              Eksportuj dane (RODO)
            </Button>
          </a>
          <Link href={`/firmy/${id}/edytuj`}>
            <Button size="sm" variant="secondary">
              Edytuj
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dane podstawowe</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Field label="Miasto / adres" value={[typedCompany.city, typedCompany.address].filter(Boolean).join(', ')} />
                <Field label="NIP/VAT" value={typedCompany.tax_id} />
                <Field label="Strona WWW" value={typedCompany.website} />
                <Field label="E-mail" value={typedCompany.email} />
                <Field label="Telefon" value={typedCompany.phone} />
              </dl>
              {typedCompany.note && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Notatka</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{typedCompany.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zapytania ({typedInquiries.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {typedInquiries.length === 0 ? (
                <p className="text-sm text-foreground-muted">Brak zapytań dla tej firmy.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {typedInquiries.map((inq) => (
                    <li key={inq.id} className="py-2.5">
                      <Link href={`/zapytania/${inq.id}`} className="block hover:text-accent">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {inq.number} — {inq.short_description || 'Bez opisu'}
                          </span>
                        </div>
                        <div className="mt-1 flex gap-1.5">
                          <GroupBadge group={inq.operational_group} />
                          <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
                          {inq.is_archived && <Badge tone="neutral">Zarchiwizowane</Badge>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/zapytania/nowe?firma=${id}`} className="mt-3 inline-block text-sm text-accent hover:underline">
                + Nowe zapytanie dla tej firmy
              </Link>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Kontakty ({typedContacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {typedContacts.length === 0 ? (
                <p className="text-sm text-foreground-muted">Brak kontaktów.</p>
              ) : (
                <ul className="space-y-3">
                  {typedContacts.map((c) => (
                    <li key={c.id}>
                      <Link href={`/kontakty/${c.id}`} className="block hover:text-accent">
                        <p className="text-sm font-medium text-foreground">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-xs text-foreground-muted">{c.position || c.email || '—'}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/kontakty/nowy?firma=${id}`}
                className="mt-3 inline-block text-sm text-accent hover:underline"
              >
                + Nowy kontakt
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value || '—'}</dd>
    </div>
  );
}
