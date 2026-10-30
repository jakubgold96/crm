-- INNDES CRM — Faza 1 — migracja 4: zapytania (inquiries) + numeracja + zakres usług

-- Tabela konfiguracyjna zakresu usługi (multi-select, nie enum — patrz
-- docs/DATA_MODEL.md, decyzja właściciela produktu 2026-10-30).
create table public.service_scope_options (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_pl text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

comment on table public.service_scope_options is
  'Konfigurowalna lista opcji zakresu usługi. Dezaktywuj (is_active=false) '
  'zamiast usuwać, żeby nie złamać historycznych inquiry_services.';

insert into public.service_scope_options (code, label_pl, sort_order) values
  ('konsultacja_planowanie', 'Konsultacja i planowanie', 10),
  ('projektowanie_mebli', 'Projektowanie mebli', 20),
  ('wizualizacje_3d', 'Wizualizacje 3D', 30),
  ('dokumentacja_techniczna', 'Dokumentacja techniczna', 40),
  ('dobor_materialow', 'Dobór materiałów', 50),
  ('prototypowanie', 'Prototypowanie', 60),
  ('produkcja_jednostkowa', 'Produkcja jednostkowa', 70),
  ('produkcja_seryjna', 'Produkcja seryjna', 80),
  ('optymalizacja_kosztow', 'Optymalizacja kosztów', 90),
  ('transport', 'Transport', 100),
  ('montaz', 'Montaż', 110),
  ('nadzor_realizacji', 'Nadzór nad realizacją', 120),
  ('inne', 'Inne', 130);

-- Sekwencja dla numeru zapytania: ciągła, bez resetu rocznego, bez cyklu.
-- nextval() jest atomowy względem współbieżnych transakcji z definicji
-- Postgresa (sekwencje nie są objęte zwykłym MVCC/blokadami wierszy),
-- więc nie potrzeba SELECT ... FOR UPDATE ani żadnej ręcznej blokady.
create sequence public.inquiry_number_seq as bigint start 1 no cycle;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  inquiry_date date not null default current_date,
  company_id uuid references public.companies (id),
  contact_id uuid references public.contacts (id),
  country text,
  project_location text,
  short_description text,
  object_type object_type,
  object_type_other text,
  scope_notes text,
  scope_undetermined boolean not null default true,
  source inquiry_source,
  operational_group operational_group not null default 'wymaga_dzialania',
  sales_stage sales_stage not null default 'nowe',
  owner_id uuid references public.profiles (id),
  next_step text,
  next_step_due date,
  task_status task_status not null default 'otwarte',
  is_archived boolean not null default false,
  archived_reason text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),

  -- object_type_other ma sens tylko gdy object_type = 'inne'.
  constraint object_type_other_requires_inne check (
    object_type_other is null or object_type = 'inne'
  ),
  constraint archived_reason_requires_flag check (
    (is_archived = false and archived_reason is null and archived_at is null)
    or (is_archived = true)
  )
);

comment on table public.inquiries is
  'Zapytania ofertowe — serce systemu. number nadawany triggerem, '
  'niezmienny po utworzeniu. operational_group i sales_stage to DWA '
  'niezależne pola — nigdy nie łączyć ani nie wyprowadzać jednego z drugiego.';

-- Numer nadawany wyłącznie przez trigger, format INQ-000001 (ciągły, 6 cyfr
-- z zerami wiodącymi — jeśli przekroczymy 999999, format po prostu się
-- wydłuży, lpad nie obcina wyższych wartości).
create function public.set_inquiry_number()
returns trigger
language plpgsql
as $$
begin
  if new.number is not null then
    raise exception 'Numer zapytania jest nadawany automatycznie i nie może być ustawiony ręcznie.';
  end if;
  new.number := 'INQ-' || lpad(nextval('public.inquiry_number_seq')::text, 6, '0');
  return new;
end;
$$;

create trigger inquiries_set_number
  before insert on public.inquiries
  for each row execute function public.set_inquiry_number();

-- Numer jest niezmienny po utworzeniu — blokujemy próbę jego edycji na
-- poziomie bazy (niezależnie od RLS/grantów), żeby nie dało się go nadpisać
-- nawet przez funkcję service-role napisaną niedbale w przyszłości.
create function public.prevent_inquiry_number_update()
returns trigger
language plpgsql
as $$
begin
  if new.number <> old.number then
    raise exception 'Numer zapytania jest niezmienny i nie może być edytowany po utworzeniu.';
  end if;
  return new;
end;
$$;

create trigger inquiries_prevent_number_update
  before update on public.inquiries
  for each row execute function public.prevent_inquiry_number_update();

create trigger inquiries_set_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

create index inquiries_company_idx on public.inquiries (company_id);
create index inquiries_contact_idx on public.inquiries (contact_id);
create index inquiries_owner_idx on public.inquiries (owner_id);
create index inquiries_operational_group_idx on public.inquiries (operational_group) where is_archived = false;
create index inquiries_sales_stage_idx on public.inquiries (sales_stage) where is_archived = false;
create index inquiries_next_step_due_idx on public.inquiries (next_step_due) where is_archived = false;
create index inquiries_number_idx on public.inquiries (number);
create index inquiries_search_idx on public.inquiries
  using gin (lower(coalesce(short_description, '') || ' ' || coalesce(next_step, '') || ' ' || coalesce(country, '')) gin_trgm_ops);

-- Zakres usługi: relacja wiele-do-wielu, multi-select.
create table public.inquiry_services (
  inquiry_id uuid not null references public.inquiries (id),
  service_option_id uuid not null references public.service_scope_options (id),
  primary key (inquiry_id, service_option_id)
);

comment on table public.inquiry_services is
  'Wielokrotny wybór zakresu usługi per zapytanie. Brak wierszy razem z '
  'inquiries.scope_undetermined=true oznacza "zakres nieustalony".';

create table public.inquiry_files (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id),
  storage_path text not null,
  file_name text not null,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references public.profiles (id)
);

create index inquiry_files_inquiry_idx on public.inquiry_files (inquiry_id);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id),
  body text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  is_hidden boolean not null default false,
  hidden_reason text,
  hidden_at timestamptz,
  hidden_by uuid references public.profiles (id),
  constraint hidden_reason_requires_flag check (
    (is_hidden = false and hidden_reason is null and hidden_at is null and hidden_by is null)
    or (is_hidden = true)
  )
);

comment on table public.inquiry_notes is
  'Notatki na zapytaniu. Nigdy fizycznie usuwane — ukrywane przez is_hidden '
  'z powodem (CLAUDE.md zasada #3).';

create index inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id);

-- Uproszczona aktywność (Faza 1): zapis notatek + zmian pól, zdenormalizowany
-- widok chronologiczny. E-maile/spotkania jako źródła dochodzą w Fazie 4.
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id),
  type activity_type not null,
  summary text not null,
  occurred_at timestamptz not null default now(),
  created_by uuid references public.profiles (id)
);

create index activity_log_inquiry_idx on public.activity_log (inquiry_id, occurred_at desc);

-- Audyt zmian — uniwersalna tabela dla companies/contacts/inquiries (i
-- przyszłych leads). Wypełniana przez triggery AFTER UPDATE per tabela
-- (patrz migracja 00000000000005_audit.sql), nie ręcznie przez aplikację.
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  field_name text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now(),
  changed_by uuid references public.profiles (id)
);

create index audit_log_record_idx on public.audit_log (table_name, record_id, changed_at desc);

-- RLS

alter table public.service_scope_options enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_services enable row level security;
alter table public.inquiry_files enable row level security;
alter table public.inquiry_notes enable row level security;
alter table public.activity_log enable row level security;
alter table public.audit_log enable row level security;

create policy "service_scope_options_select_active_users"
  on public.service_scope_options for select
  to authenticated
  using (public.is_active_user());

-- Tylko administrator zarządza listą opcji zakresu usługi (dane konfiguracyjne).
create policy "service_scope_options_write_admin"
  on public.service_scope_options for all
  to authenticated
  using (public.current_user_role() = 'administrator' and public.is_active_user())
  with check (public.current_user_role() = 'administrator');

create policy "inquiries_select_active_users"
  on public.inquiries for select
  to authenticated
  using (public.is_active_user());

create policy "inquiries_insert_active_users"
  on public.inquiries for insert
  to authenticated
  with check (public.is_active_user());

create policy "inquiries_update_active_users"
  on public.inquiries for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

-- Brak polityki DELETE na inquiries — nigdy fizyczne usuwanie (CLAUDE.md #3,
-- kryterium akceptacji #5). Jedyna droga to is_archived.

create policy "inquiry_services_select_active_users"
  on public.inquiry_services for select
  to authenticated
  using (public.is_active_user());

create policy "inquiry_services_insert_active_users"
  on public.inquiry_services for insert
  to authenticated
  with check (public.is_active_user());

create policy "inquiry_services_delete_active_users"
  on public.inquiry_services for delete
  to authenticated
  using (public.is_active_user());
-- Usuwanie wiersza z tabeli łączącej (zmiana wyboru checkboxa) to NIE jest
-- usuwanie historii zapytania — sama historia zmian jest w audit_log.

create policy "inquiry_files_select_active_users"
  on public.inquiry_files for select
  to authenticated
  using (public.is_active_user());

create policy "inquiry_files_insert_active_users"
  on public.inquiry_files for insert
  to authenticated
  with check (public.is_active_user());

create policy "inquiry_notes_select_active_users"
  on public.inquiry_notes for select
  to authenticated
  using (public.is_active_user());

create policy "inquiry_notes_insert_active_users"
  on public.inquiry_notes for insert
  to authenticated
  with check (public.is_active_user());

-- Edycja notatki dozwolona tylko do ustawienia is_hidden/hidden_* (ukrycie),
-- nie do zmiany treści body (treść notatki jest niezmienna po zapisie —
-- egzekwowane w Fazie 1 na poziomie aplikacji; twardy constraint bazodanowy
-- można dodać później, jeśli okaże się potrzebny).
create policy "inquiry_notes_update_active_users"
  on public.inquiry_notes for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

create policy "activity_log_select_active_users"
  on public.activity_log for select
  to authenticated
  using (public.is_active_user());

create policy "activity_log_insert_active_users"
  on public.activity_log for insert
  to authenticated
  with check (public.is_active_user());

-- audit_log: tylko odczyt przez klienta. Zapis WYŁĄCZNIE przez triggery
-- SECURITY DEFINER (patrz migracja 5), żadna rola aplikacyjna nie ma
-- grantu INSERT na tę tabelę bezpośrednio.
create policy "audit_log_select_active_users"
  on public.audit_log for select
  to authenticated
  using (public.is_active_user());

revoke insert, update, delete on public.audit_log from authenticated;
