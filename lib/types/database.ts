/**
 * Typy TypeScript odzwierciedlające schemat bazy (supabase/migrations/).
 *
 * UWAGA: w normalnym cyklu pracy te typy powinny być generowane poleceniem
 * `supabase gen types typescript --local > lib/types/database.ts`, żeby nigdy
 * nie rozjechały się ze schematem. W tej sesji nie mam uruchomionego Supabase
 * (brak Dockera w środowisku — patrz STATUS.md), więc typy są napisane
 * ręcznie 1:1 ze zweryfikowanymi migracjami SQL. Pierwsza rzecz do zrobienia
 * po podłączeniu prawdziwego Supabase: wygenerować ten plik na nowo i
 * zastąpić ręczną wersję — potem traktować jako auto-generowany (nie edytować
 * ręcznie).
 */

export type UserRole = 'administrator' | 'sprzedaz' | 'realizacja';

export type CompanySegment =
  | 'hotel'
  | 'restauracja'
  | 'biuro'
  | 'retail'
  | 'architekt'
  | 'marka_meblowa'
  | 'generalny_wykonawca'
  | 'inne';

export type RelationshipStatus = 'nowy' | 'aktywny' | 'uspiony' | 'zakonczony';

export type ContactRole =
  | 'wlasciciel'
  | 'kupiec'
  | 'architekt'
  | 'projektant'
  | 'project_manager'
  | 'techniczny'
  | 'finanse'
  | 'montaz'
  | 'inna';

export type ContactConsent = 'zgoda' | 'brak_danych' | 'zakaz';

export type ObjectType =
  | 'hotel'
  | 'restauracja'
  | 'bar_kawiarnia'
  | 'biuro'
  | 'sklep_retail'
  | 'obiekt_publiczny_komercyjny'
  | 'mieszkanie_dom_prywatny'
  | 'inne';

export type InquirySource =
  | 'formularz'
  | 'email'
  | 'telefon'
  | 'polecenie'
  | 'architekt'
  | 'targi'
  | 'powrot_klienta'
  | 'inne';

export type OperationalGroup = 'wymaga_dzialania' | 'do_przypomnienia' | 'czekamy_na_klienta';

export type SalesStage =
  | 'nowe'
  | 'kwalifikacja'
  | 'kompletowanie_danych'
  | 'przygotowanie_oferty'
  | 'oferta_wyslana'
  | 'negocjacje'
  | 'wygrane'
  | 'przegrane'
  | 'wstrzymane';

export type TaskStatus = 'otwarte' | 'w_toku' | 'zrobione';

export type ActivityType = 'note' | 'change' | 'task' | 'email' | 'meeting' | 'call';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  can_view_financials: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  address: string | null;
  tax_id: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  segment: CompanySegment | null;
  note: string | null;
  relationship_status: RelationshipStatus;
  is_archived: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface Contact {
  id: string;
  company_id: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  role: ContactRole | null;
  email: string | null;
  phone: string | null;
  language: string | null;
  contact_consent: ContactConsent;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface ServiceScopeOption {
  id: string;
  code: string;
  label_pl: string;
  sort_order: number;
  is_active: boolean;
}

export interface Inquiry {
  id: string;
  number: string;
  inquiry_date: string;
  company_id: string | null;
  contact_id: string | null;
  country: string | null;
  project_location: string | null;
  short_description: string | null;
  object_type: ObjectType | null;
  object_type_other: string | null;
  scope_notes: string | null;
  scope_undetermined: boolean;
  source: InquirySource | null;
  operational_group: OperationalGroup;
  sales_stage: SalesStage;
  owner_id: string | null;
  next_step: string | null;
  next_step_due: string | null;
  task_status: TaskStatus;
  is_archived: boolean;
  archived_reason: string | null;
  archived_at: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface InquiryNote {
  id: string;
  inquiry_id: string;
  body: string;
  created_at: string;
  created_by: string | null;
  is_hidden: boolean;
  hidden_reason: string | null;
  hidden_at: string | null;
  hidden_by: string | null;
}

export interface InquiryFile {
  id: string;
  inquiry_id: string;
  storage_path: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface ActivityLogEntry {
  id: string;
  inquiry_id: string;
  type: ActivityType;
  summary: string;
  occurred_at: string;
  created_by: string | null;
}

export interface CreateInquiryWithServicesArgs {
  p_company_id: string;
  p_contact_id: string | null;
  p_inquiry_date: string;
  p_country: string | null;
  p_project_location: string | null;
  p_short_description: string | null;
  p_object_type: ObjectType | null;
  p_object_type_other: string | null;
  p_scope_notes: string | null;
  p_scope_undetermined: boolean;
  p_source: InquirySource | null;
  p_operational_group: OperationalGroup;
  p_sales_stage: SalesStage;
  p_owner_id: string | null;
  p_next_step: string | null;
  p_next_step_due: string | null;
  p_task_status: TaskStatus;
  p_service_option_ids: string[];
}

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  changed_by: string | null;
}
