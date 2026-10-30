import { z } from 'zod';

export const objectTypes = [
  'hotel',
  'restauracja',
  'bar_kawiarnia',
  'biuro',
  'sklep_retail',
  'obiekt_publiczny_komercyjny',
  'mieszkanie_dom_prywatny',
  'inne',
] as const;

export const inquirySources = [
  'formularz',
  'email',
  'telefon',
  'polecenie',
  'architekt',
  'targi',
  'powrot_klienta',
  'inne',
] as const;

export const operationalGroups = ['wymaga_dzialania', 'do_przypomnienia', 'czekamy_na_klienta'] as const;

export const salesStages = [
  'nowe',
  'kwalifikacja',
  'kompletowanie_danych',
  'przygotowanie_oferty',
  'oferta_wyslana',
  'negocjacje',
  'wygrane',
  'przegrane',
  'wstrzymane',
] as const;

export const taskStatuses = ['otwarte', 'w_toku', 'zrobione'] as const;

export const inquirySchema = z
  .object({
    company_id: z.string().uuid('Wybierz firmę'),
    contact_id: z.string().uuid().optional().nullable(),
    inquiry_date: z.string().min(1, 'Data zapytania jest wymagana'),
    country: z.string().trim().optional().or(z.literal('')),
    project_location: z.string().trim().optional().or(z.literal('')),
    short_description: z.string().trim().optional().or(z.literal('')),
    object_type: z.enum(objectTypes).optional().nullable(),
    object_type_other: z.string().trim().optional().or(z.literal('')),
    service_option_ids: z.array(z.string().uuid()).default([]),
    scope_notes: z.string().trim().optional().or(z.literal('')),
    scope_undetermined: z.boolean().default(true),
    source: z.enum(inquirySources).optional().nullable(),
    operational_group: z.enum(operationalGroups).default('wymaga_dzialania'),
    sales_stage: z.enum(salesStages).default('nowe'),
    owner_id: z.string().uuid().optional().nullable(),
    next_step: z.string().trim().optional().or(z.literal('')),
    next_step_due: z.string().optional().or(z.literal('')),
    task_status: z.enum(taskStatuses).default('otwarte'),
  })
  .refine((data) => data.object_type !== 'inne' || (data.object_type_other && data.object_type_other.length > 0), {
    message: 'Doprecyzuj typ obiektu dla wartości "Inne"',
    path: ['object_type_other'],
  });

export type InquiryFormValues = z.infer<typeof inquirySchema>;

/**
 * Zgodnie z decyzją właściciela produktu: zakres usługi jest wymagany
 * dopiero przy przejściu do etapu przygotowania oferty (i dalszych etapów
 * lejka sprzedaży), nie przy tworzeniu zapytania. Patrz docs/DATA_MODEL.md.
 */
export function scopeRequiredForStage(stage: (typeof salesStages)[number]): boolean {
  return ['przygotowanie_oferty', 'oferta_wyslana', 'negocjacje', 'wygrane'].includes(stage);
}

export function validateScopeForStage(values: {
  sales_stage: string;
  scope_undetermined: boolean;
  service_option_ids: string[];
}): string | null {
  if (!scopeRequiredForStage(values.sales_stage as (typeof salesStages)[number])) return null;
  if (values.scope_undetermined || values.service_option_ids.length === 0) {
    return 'Przy tym etapie sprzedaży zakres usługi musi być ustalony (odznacz "Nieustalone" i wybierz co najmniej jedną usługę).';
  }
  return null;
}
