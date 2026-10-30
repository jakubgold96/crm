'use client';

import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { companySegmentLabels, relationshipStatusLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/client';
import { companySchema, type CompanyFormValues } from '@/lib/validation/company';
import type { Company } from '@/lib/types/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type DuplicateMatch = { id: string; name: string; reason: string };

export function CompanyForm({ initialData }: { initialData?: Company }) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [values, setValues] = useState<CompanyFormValues>({
    name: initialData?.name ?? '',
    country: initialData?.country ?? '',
    city: initialData?.city ?? '',
    address: initialData?.address ?? '',
    tax_id: initialData?.tax_id ?? '',
    website: initialData?.website ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    segment: initialData?.segment ?? null,
    note: initialData?.note ?? '',
    relationship_status: initialData?.relationship_status ?? 'nowy',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Kontrola duplikatów: miękkie ostrzeżenie, debounced, tylko gdy coś
  // istotnego się zmieniło. Nie blokuje zapisu — PRD sekcja 2.
  useEffect(() => {
    const hasSignal = values.name.trim().length > 1 || values.website || values.email || values.phone || values.tax_id;
    if (!hasSignal) {
      // Brak sygnału do sprawdzenia — wyczyść wynik asynchronicznie (w
      // mikrotasku), żeby nie wywoływać setState synchronicznie w ciele
      // efektu (react-hooks/set-state-in-effect).
      const id = setTimeout(() => setDuplicates([]), 0);
      return () => clearTimeout(id);
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/companies/check-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, excludeId: initialData?.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setDuplicates(data.matches ?? []);
        }
      } catch {
        // Kontrola duplikatów to pomoc, nie krytyczna ścieżka — cichy fail.
      }
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.name, values.website, values.email, values.phone, values.tax_id]);

  function set<K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = companySchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const supabase = createClient();
    const payload = {
      ...parsed.data,
      country: parsed.data.country || null,
      city: parsed.data.city || null,
      address: parsed.data.address || null,
      tax_id: parsed.data.tax_id || null,
      website: parsed.data.website || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      note: parsed.data.note || null,
      segment: parsed.data.segment || null,
    };

    if (isEdit && initialData) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('companies')
        .update({ ...payload, updated_by: user?.id })
        .eq('id', initialData.id);
      setSubmitting(false);
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push(`/firmy/${initialData.id}`);
      router.refresh();
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('companies')
        .insert({ ...payload, created_by: user?.id, updated_by: user?.id })
        .select('id')
        .single();
      setSubmitting(false);
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push(`/firmy/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {duplicates.length > 0 && (
        <div className="rounded-md border border-terracotta/40 bg-terracotta-bg p-3 text-sm text-terracotta">
          <p className="font-medium">Możliwy duplikat — sprawdź przed zapisem:</p>
          <ul className="mt-1 list-inside list-disc">
            {duplicates.map((m) => (
              <li key={`${m.id}-${m.reason}`}>
                {m.name} <span className="text-xs opacity-80">({m.reason})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Nazwa firmy *</Label>
          <Input id="name" value={values.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="segment">Segment</Label>
          <Select
            id="segment"
            value={values.segment ?? ''}
            onChange={(e) => set('segment', (e.target.value || null) as CompanyFormValues['segment'])}
          >
            <option value="">— wybierz —</option>
            {Object.entries(companySegmentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="relationship_status">Status relacji</Label>
          <Select
            id="relationship_status"
            value={values.relationship_status}
            onChange={(e) => set('relationship_status', e.target.value as CompanyFormValues['relationship_status'])}
          >
            {Object.entries(relationshipStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="country">Kraj</Label>
          <Input id="country" value={values.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">Miasto</Label>
          <Input id="city" value={values.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Adres</Label>
          <Input id="address" value={values.address} onChange={(e) => set('address', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="tax_id">NIP / VAT</Label>
          <Input id="tax_id" value={values.tax_id} onChange={(e) => set('tax_id', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="website">Strona WWW</Label>
          <Input id="website" value={values.website} onChange={(e) => set('website', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="email">E-mail ogólny</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="note">Notatka</Label>
          <Textarea id="note" rows={3} value={values.note} onChange={(e) => set('note', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Dodaj firmę'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
