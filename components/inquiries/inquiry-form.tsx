'use client';

import { CompanyPicker } from '@/components/companies/company-picker';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import {
  inquirySourceLabels,
  objectTypeLabels,
  operationalGroupLabels,
  salesStageLabels,
} from '@/lib/enums';
import { createClient } from '@/lib/supabase/client';
import {
  inquirySchema,
  validateScopeForStage,
  type InquiryFormValues,
} from '@/lib/validation/inquiry';
import type { Contact, CreateInquiryWithServicesArgs, Profile, ServiceScopeOption } from '@/lib/types/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function InquiryForm({ defaultCompanyId }: { defaultCompanyId?: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [values, setValues] = useState<InquiryFormValues>({
    company_id: defaultCompanyId ?? '',
    contact_id: null,
    inquiry_date: new Date().toISOString().slice(0, 10),
    country: '',
    project_location: '',
    short_description: '',
    object_type: null,
    object_type_other: '',
    service_option_ids: [],
    scope_notes: '',
    scope_undetermined: true,
    source: null,
    operational_group: 'wymaga_dzialania',
    sales_stage: 'nowe',
    owner_id: null,
    next_step: '',
    next_step_due: '',
    task_status: 'otwarte',
  });

  const [companyLabel, setCompanyLabel] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceScopeOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('service_scope_options')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setServiceOptions((data ?? []) as ServiceScopeOption[]));

    supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name')
      .then(({ data }) => setProfiles((data ?? []) as Profile[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!values.company_id) {
      const id = setTimeout(() => setContacts([]), 0);
      return () => clearTimeout(id);
    }
    supabase
      .from('contacts')
      .select('*')
      .eq('company_id', values.company_id)
      .order('last_name')
      .then(({ data }) => setContacts((data ?? []) as Contact[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.company_id]);

  function set<K extends keyof InquiryFormValues>(key: K, value: InquiryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleService(id: string) {
    setValues((v) => ({
      ...v,
      service_option_ids: v.service_option_ids.includes(id)
        ? v.service_option_ids.filter((s) => s !== id)
        : [...v.service_option_ids, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = inquirySchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    const scopeError = validateScopeForStage(parsed.data);
    if (scopeError) {
      setErrors({ scope: scopeError });
      return;
    }

    setErrors({});
    setSubmitting(true);

    const args: CreateInquiryWithServicesArgs = {
      p_company_id: parsed.data.company_id,
      p_contact_id: parsed.data.contact_id || null,
      p_inquiry_date: parsed.data.inquiry_date,
      p_country: parsed.data.country || null,
      p_project_location: parsed.data.project_location || null,
      p_short_description: parsed.data.short_description || null,
      p_object_type: parsed.data.object_type || null,
      p_object_type_other: parsed.data.object_type === 'inne' ? parsed.data.object_type_other || null : null,
      p_scope_notes: parsed.data.scope_notes || null,
      p_scope_undetermined: parsed.data.scope_undetermined,
      p_source: parsed.data.source || null,
      p_operational_group: parsed.data.operational_group,
      p_sales_stage: parsed.data.sales_stage,
      p_owner_id: parsed.data.owner_id || null,
      p_next_step: parsed.data.next_step || null,
      p_next_step_due: parsed.data.next_step_due || null,
      p_task_status: parsed.data.task_status,
      p_service_option_ids: parsed.data.service_option_ids,
    };

    const { data, error } = await supabase.rpc('create_inquiry_with_services', args);
    setSubmitting(false);

    if (error || !data) {
      setServerError(error?.message ?? 'Nie udało się zapisać zapytania.');
      return;
    }

    router.push(`/zapytania/${(data as { id: string }).id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Podstawowe</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Firma *</Label>
            <CompanyPicker
              value={values.company_id}
              initialLabel={companyLabel}
              onChange={(id, name) => {
                set('company_id', id);
                set('contact_id', null);
                setCompanyLabel(name);
              }}
            />
            {errors.company_id && <p className="mt-1 text-xs text-danger">{errors.company_id}</p>}
          </div>

          <div>
            <Label htmlFor="contact_id">Osoba kontaktowa</Label>
            <Select
              id="contact_id"
              value={values.contact_id ?? ''}
              onChange={(e) => set('contact_id', e.target.value || null)}
              disabled={!values.company_id}
            >
              <option value="">— brak / nie wybrano —</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.first_name, c.last_name].filter(Boolean).join(' ') || '(bez nazwiska)'}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="inquiry_date">Data zapytania *</Label>
            <Input
              id="inquiry_date"
              type="date"
              value={values.inquiry_date}
              onChange={(e) => set('inquiry_date', e.target.value)}
            />
            {errors.inquiry_date && <p className="mt-1 text-xs text-danger">{errors.inquiry_date}</p>}
          </div>

          <div>
            <Label htmlFor="country">Kraj</Label>
            <Input id="country" value={values.country} onChange={(e) => set('country', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="project_location">Miejsce projektu</Label>
            <Input
              id="project_location"
              value={values.project_location}
              onChange={(e) => set('project_location', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="short_description">Krótki opis</Label>
            <Textarea
              id="short_description"
              rows={2}
              value={values.short_description}
              onChange={(e) => set('short_description', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="object_type">Typ obiektu</Label>
            <Select
              id="object_type"
              value={values.object_type ?? ''}
              onChange={(e) => set('object_type', (e.target.value || null) as InquiryFormValues['object_type'])}
            >
              <option value="">— wybierz —</option>
              {Object.entries(objectTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          {values.object_type === 'inne' && (
            <div>
              <Label htmlFor="object_type_other">Doprecyzuj typ obiektu *</Label>
              <Input
                id="object_type_other"
                value={values.object_type_other}
                onChange={(e) => set('object_type_other', e.target.value)}
              />
              {errors.object_type_other && <p className="mt-1 text-xs text-danger">{errors.object_type_other}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="source">Źródło zapytania</Label>
            <Select
              id="source"
              value={values.source ?? ''}
              onChange={(e) => set('source', (e.target.value || null) as InquiryFormValues['source'])}
            >
              <option value="">— wybierz —</option>
              {Object.entries(inquirySourceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-4">
        <h2 className="text-sm font-semibold text-foreground">Zakres usługi</h2>
        <p className="text-xs text-foreground-muted">
          Nie musi być ustalony od razu — wymagany dopiero przy przejściu do etapu przygotowania oferty i dalej.
        </p>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={values.scope_undetermined}
            onChange={(e) => set('scope_undetermined', e.target.checked)}
          />
          Nieustalone
        </label>

        {!values.scope_undetermined && (
          <>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {serviceOptions.map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={values.service_option_ids.includes(opt.id)}
                    onChange={() => toggleService(opt.id)}
                  />
                  {opt.label_pl}
                </label>
              ))}
            </div>
            <div>
              <Label htmlFor="scope_notes">Doprecyzowanie zakresu</Label>
              <Textarea
                id="scope_notes"
                rows={2}
                value={values.scope_notes}
                onChange={(e) => set('scope_notes', e.target.value)}
              />
            </div>
          </>
        )}
        {errors.scope && <p className="text-xs text-danger">{errors.scope}</p>}
      </section>

      <section className="space-y-4 border-t border-border pt-4">
        <h2 className="text-sm font-semibold text-foreground">Status i następny krok</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="operational_group">Grupa operacyjna *</Label>
            <Select
              id="operational_group"
              value={values.operational_group}
              onChange={(e) => set('operational_group', e.target.value as InquiryFormValues['operational_group'])}
            >
              {Object.entries(operationalGroupLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sales_stage">Etap sprzedaży *</Label>
            <Select
              id="sales_stage"
              value={values.sales_stage}
              onChange={(e) => set('sales_stage', e.target.value as InquiryFormValues['sales_stage'])}
            >
              {Object.entries(salesStageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="owner_id">Właściciel</Label>
            <Select id="owner_id" value={values.owner_id ?? ''} onChange={(e) => set('owner_id', e.target.value || null)}>
              <option value="">— nie przypisano —</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="next_step_due">Termin następnego kroku</Label>
            <Input
              id="next_step_due"
              type="date"
              value={values.next_step_due}
              onChange={(e) => set('next_step_due', e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="next_step">Następny krok</Label>
            <Input id="next_step" value={values.next_step} onChange={(e) => set('next_step', e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Zapisywanie…' : 'Dodaj zapytanie'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
