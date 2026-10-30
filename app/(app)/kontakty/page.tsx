import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { contactConsentLabels, contactRoleLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/server';
import type { Contact } from '@/lib/types/database';
import Link from 'next/link';

type ContactWithCompany = Contact & { companies: { name: string } | null };

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('contacts')
    .select('*, companies(name)')
    .order('last_name', { ascending: true });

  const contacts = (data ?? []) as unknown as ContactWithCompany[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Kontakty ({contacts.length})</h1>
        <Link href="/kontakty/nowy">
          <Button size="sm">
            <Plus className="size-4" aria-hidden />
            Dodaj kontakt
          </Button>
        </Link>
      </div>

      {contacts.length === 0 ? (
        <p className="text-sm text-foreground-muted">Brak kontaktów.</p>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
                <tr>
                  <th className="px-4 py-2.5">Imię i nazwisko</th>
                  <th className="px-4 py-2.5">Firma</th>
                  <th className="px-4 py-2.5">Rola</th>
                  <th className="px-4 py-2.5">Kontakt</th>
                  <th className="px-4 py-2.5">Zgoda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-white/[0.04]">
                    <td className="px-4 py-2.5">
                      <Link href={`/kontakty/${c.id}`} className="font-medium text-foreground hover:text-accent">
                        {[c.first_name, c.last_name].filter(Boolean).join(' ') || '(bez nazwiska)'}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-foreground-muted">{c.companies?.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-foreground-muted">{c.role ? contactRoleLabels[c.role] : '—'}</td>
                    <td className="px-4 py-2.5 text-foreground-muted">{c.email || c.phone || '—'}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={c.contact_consent === 'zakaz' ? 'danger' : 'neutral'}>
                        {contactConsentLabels[c.contact_consent]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {contacts.map((c) => (
              <Link
                key={c.id}
                href={`/kontakty/${c.id}`}
                className="block rounded-2xl border border-border bg-surface p-4 transition-colors active:bg-surface-raised"
              >
                <p className="font-medium text-foreground">
                  {[c.first_name, c.last_name].filter(Boolean).join(' ') || '(bez nazwiska)'}
                </p>
                <p className="mt-0.5 text-sm text-foreground-muted">{c.companies?.name ?? '—'}</p>
                <Badge tone={c.contact_consent === 'zakaz' ? 'danger' : 'neutral'} className="mt-2">
                  {contactConsentLabels[c.contact_consent]}
                </Badge>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
