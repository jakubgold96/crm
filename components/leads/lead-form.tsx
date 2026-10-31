'use client';

import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { IcpProfile, Profile } from '@/lib/types/database';
import { leadSchema, normalizeDomain, type LeadFormValues } from '@/lib/validation/lead';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Duplicate = { href: string; label: string };

/**
 * Nowy lead (kryterium #8): wystarczy sama domena albo nazwa firmy.
 * Domena jest normalizowana ("https://www.X.pl/kontakt" -> "x.pl").
 * Duplikaty to ostrzeżenie, nie blokada (jak przy firmach, PRD §2).
 */
export function LeadForm({
  icpProfiles,
  profiles,
  currentUserId,
}: {
  icpProfiles: Pick<IcpProfile, 'id' | 'name'>[];
  profiles: Pick<Profile, 'id' | 'full_name'>[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<LeadFormValues>({
    domain: '',
    company_name: '',
    country: '',
    icp_profile_id: '',
    owner_id: currentUserId,
    need: '',
    proposed_service: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const domain = normalizeDomain(values.domain ?? '');

  useEffect(() => {
    if (!domain) {
      const id = setTimeout(() => setDuplicates([]), 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(async () => {
      const supabase = createClient();
      const [{ data: leads }, { data: companies }] = await Promise.all([
        supabase.from('leads').select('id, company_name, domain').eq('domain', domain).limit(3),
        supabase.from('companies').select('id, name').ilike('website', `%${domain}%`).limit(3),
      ]);
      setDuplicates([
        ...(leads ?? []).map((l) => ({ href: `/leady/${l.id}`, label: `Lead: ${l.company_name || l.domain}` })),
        ...(companies ?? []).map((c) => ({ href: `/firmy/${c.id}`, label: `Firma: ${c.name}` })),
      ]);
    }, 350);
    return () => clearTimeout(id);
  }, [domain]);

  const set = <K extends keyof LeadFormValues>(k: K, v: LeadFormValues[K]) => setValues((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const v = parsed.data;
    const { data, error } = await supabase
      .from('leads')
      .insert({
        domain: domain || null,
        company_name: v.company_name || null,
        country: v.country || null,
        icp_profile_id: v.icp_profile_id || null,
        owner_id: v.owner_id || null,
        need: v.need || null,
        proposed_service: v.proposed_service || null,
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select('id')
      .single();
    setSubmitting(false);
    if (error || !data) {
      setServerError(error?.message ?? 'Nie udało się zapisać leada.');
      return;
    }
    router.push(`/leady/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="hud space-y-5 bg-surface/90 p-5 sm:p-6" noValidate>
      {serverError && (
        <p role="alert" className="bg-danger-bg px-3 py-2 text-sm text-danger shadow-[inset_0_0_0_1px_rgb(255_47_163/0.45)]">
          {serverError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="domain">Domena</Label>
          <Input
            id="domain"
            value={values.domain}
            onChange={(e) => set('domain', e.target.value)}
            placeholder="studio-przyklad.pl"
            aria-invalid={Boolean(errors.domain)}
            autoFocus
          />
          {domain && domain !== (values.domain ?? '').trim() && (
            <p className="mt-1 font-data text-xs text-foreground-muted">Zapiszę jako: {domain}</p>
          )}
          {errors.domain && <p className="mt-1 text-xs text-danger">{errors.domain}</p>}
        </div>
        <div>
          <Label htmlFor="company_name">Nazwa firmy (opcjonalnie)</Label>
          <Input id="company_name" value={values.company_name} onChange={(e) => set('company_name', e.target.value)} />
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="border border-terracotta/40 bg-terracotta-bg p-3 text-sm text-terracotta">
          <p className="font-medium">Ta domena już jest w CRM — sprawdź, zanim dodasz drugi raz:</p>
          <ul className="mt-1 space-y-0.5">
            {duplicates.map((d) => (
              <li key={d.href}>
                <Link href={d.href} className="text-pearl underline decoration-terracotta decoration-2 underline-offset-4">
                  {d.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="country">Kraj</Label>
          <Input id="country" value={values.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="icp">Profil ICP</Label>
          <Select id="icp" value={values.icp_profile_id ?? ''} onChange={(e) => set('icp_profile_id', e.target.value)}>
            <option value="">— nie wybrano —</option>
            {icpProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="owner">Właściciel</Label>
          <Select id="owner" value={values.owner_id ?? ''} onChange={(e) => set('owner_id', e.target.value)}>
            <option value="">— brak —</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="need">Potrzeba (co mogą od nas chcieć)</Label>
        <Textarea id="need" rows={2} value={values.need} onChange={(e) => set('need', e.target.value)} />
      </div>
      <div>
        <Label htmlFor="proposed_service">Proponowana usługa</Label>
        <Input id="proposed_service" value={values.proposed_service} onChange={(e) => set('proposed_service', e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Zapisywanie…' : 'Zapisz lead'}
        </Button>
        <Link href="/leady">
          <Button type="button" variant="secondary">
            Anuluj
          </Button>
        </Link>
      </div>
    </form>
  );
}
