'use client';

import { CompanyPicker } from '@/components/companies/company-picker';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { contactConsentLabels, contactRoleLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/client';
import { contactSchema, type ContactFormValues } from '@/lib/validation/contact';
import type { Contact } from '@/lib/types/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type DuplicateMatch = { id: string; name: string; reason: string };

export function ContactForm({
  initialData,
  defaultCompanyId,
  defaultCompanyName,
}: {
  initialData?: Contact;
  defaultCompanyId?: string;
  defaultCompanyName?: string;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialData);

  const [values, setValues] = useState<ContactFormValues>({
    company_id: initialData?.company_id ?? defaultCompanyId ?? '',
    first_name: initialData?.first_name ?? '',
    last_name: initialData?.last_name ?? '',
    position: initialData?.position ?? '',
    role: initialData?.role ?? null,
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    language: initialData?.language ?? '',
    contact_consent: initialData?.contact_consent ?? 'brak_danych',
  });
  const [companyLabel, setCompanyLabel] = useState(defaultCompanyName ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!values.email && !values.phone && !(values.company_id && values.last_name)) {
      const id = setTimeout(() => setDuplicates([]), 0);
      return () => clearTimeout(id);
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/contacts/check-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, excludeId: initialData?.id }),
        });
        if (res.ok) {
          const data = await res.json();
          setDuplicates(data.matches ?? []);
        }
      } catch {
        // pomocnicze — cichy fail
      }
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.email, values.phone, values.company_id, values.last_name]);

  function set<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = contactSchema.safeParse(values);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      company_id: parsed.data.company_id,
      first_name: parsed.data.first_name || null,
      last_name: parsed.data.last_name || null,
      position: parsed.data.position || null,
      role: parsed.data.role || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      language: parsed.data.language || null,
      contact_consent: parsed.data.contact_consent,
    };

    if (isEdit && initialData) {
      const { error } = await supabase
        .from('contacts')
        .update({ ...payload, updated_by: user?.id })
        .eq('id', initialData.id);
      setSubmitting(false);
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push(`/kontakty/${initialData.id}`);
      router.refresh();
    } else {
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...payload, created_by: user?.id, updated_by: user?.id })
        .select('id')
        .single();
      setSubmitting(false);
      if (error) {
        setServerError(error.message);
        return;
      }
      router.push(`/kontakty/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {duplicates.length > 0 && (
        <div className="border border-terracotta/40 bg-terracotta-bg p-3 text-sm text-terracotta">
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
          <Label>Firma *</Label>
          <CompanyPicker
            value={values.company_id}
            initialLabel={companyLabel}
            onChange={(id, name) => {
              set('company_id', id);
              setCompanyLabel(name);
            }}
          />
          {errors.company_id && <p className="mt-1 text-xs text-danger">{errors.company_id}</p>}
        </div>

        <div>
          <Label htmlFor="first_name">Imię</Label>
          <Input id="first_name" value={values.first_name} onChange={(e) => set('first_name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="last_name">Nazwisko</Label>
          <Input id="last_name" value={values.last_name} onChange={(e) => set('last_name', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="position">Stanowisko</Label>
          <Input id="position" value={values.position} onChange={(e) => set('position', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="role">Rola</Label>
          <Select
            id="role"
            value={values.role ?? ''}
            onChange={(e) => set('role', (e.target.value || null) as ContactFormValues['role'])}
          >
            <option value="">— wybierz —</option>
            {Object.entries(contactRoleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" value={values.email} onChange={(e) => set('email', e.target.value)} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input id="phone" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>

        <div>
          <Label htmlFor="language">Język</Label>
          <Input id="language" placeholder="np. pl, en, no" value={values.language} onChange={(e) => set('language', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="contact_consent">Zgoda na kontakt</Label>
          <Select
            id="contact_consent"
            value={values.contact_consent}
            onChange={(e) => set('contact_consent', e.target.value as ContactFormValues['contact_consent'])}
          >
            {Object.entries(contactConsentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Zapisywanie…' : isEdit ? 'Zapisz zmiany' : 'Dodaj kontakt'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
