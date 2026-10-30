import { GroupBadge } from '@/components/ui/group-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contactConsentLabels, contactRoleLabels, salesStageLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/server';
import type { Contact, Inquiry } from '@/lib/types/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type ContactWithCompany = Contact & { companies: { id: string; name: string } | null };

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: contact } = await supabase
    .from('contacts')
    .select('*, companies(id, name)')
    .eq('id', id)
    .single();
  if (!contact) notFound();

  const typedContact = contact as unknown as ContactWithCompany;

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('contact_id', id)
    .order('created_at', { ascending: false });

  const typedInquiries = (inquiries ?? []) as Inquiry[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="rgb-split font-display text-2xl font-bold uppercase tracking-[0.06em] text-foreground sm:text-3xl">
            {[typedContact.first_name, typedContact.last_name].filter(Boolean).join(' ') || '(bez nazwiska)'}
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {typedContact.companies && (
              <Link href={`/firmy/${typedContact.companies.id}`} className="hover:text-accent hover:underline">
                {typedContact.companies.name}
              </Link>
            )}
            {typedContact.position && ` · ${typedContact.position}`}
          </p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/export/contact/${id}`} download>
            <Button size="sm" variant="secondary">
              Eksportuj dane (RODO)
            </Button>
          </a>
          <Link href={`/kontakty/${id}/edytuj`}>
            <Button size="sm" variant="secondary">
              Edytuj
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane kontaktowe</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="Rola" value={typedContact.role ? contactRoleLabels[typedContact.role] : null} />
            <Field label="Język" value={typedContact.language} />
            <Field label="E-mail" value={typedContact.email} />
            <Field label="Telefon" value={typedContact.phone} />
          </dl>
          <div className="mt-4 border-t border-border pt-4">
            <Badge tone={typedContact.contact_consent === 'zakaz' ? 'danger' : 'neutral'}>
              {contactConsentLabels[typedContact.contact_consent]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Powiązane zapytania ({typedInquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {typedInquiries.length === 0 ? (
            <p className="text-sm text-foreground-muted">Brak zapytań.</p>
          ) : (
            <ul className="divide-y divide-border">
              {typedInquiries.map((inq) => (
                <li key={inq.id} className="py-2.5">
                  <Link href={`/zapytania/${inq.id}`} className="block hover:text-accent">
                    <span className="text-sm font-medium text-foreground">
                      {inq.number} — {inq.short_description || 'Bez opisu'}
                    </span>
                    <div className="mt-1 flex gap-1.5">
                      <GroupBadge group={inq.operational_group} />
                      <Badge tone="neutral">{salesStageLabels[inq.sales_stage]}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
