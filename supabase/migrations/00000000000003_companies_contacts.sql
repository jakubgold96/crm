-- INNDES CRM — Faza 1 — migracja 3: companies, contacts

create extension if not exists pg_trgm;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  city text,
  address text,
  tax_id text,
  website text,
  email text,
  phone text,
  segment company_segment,
  note text,
  relationship_status relationship_status not null default 'nowy',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

comment on table public.companies is 'Firmy (klienci/kontrahenci). Nigdy nie usuwane fizycznie — patrz is_archived.';

-- Indeksy wspierające kontrolę duplikatów przy zapisie (ostrzeżenie, nie blokada — logika w aplikacji).
create index companies_name_trgm_idx on public.companies using gin (lower(name) gin_trgm_ops);
create index companies_website_idx on public.companies (lower(website));
create index companies_email_idx on public.companies (lower(email));
create index companies_phone_idx on public.companies (phone);
-- NIP/VAT unikalny tylko gdy podany (wiele firm może nie mieć NIP wypełnionego).
create unique index companies_tax_id_unique_idx on public.companies (tax_id) where tax_id is not null and tax_id <> '';

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id),
  first_name text,
  last_name text,
  position text,
  role contact_role,
  email text,
  phone text,
  language text,
  contact_consent contact_consent not null default 'brak_danych',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

comment on table public.contacts is 'Osoby kontaktowe w firmach klientów.';

create index contacts_company_idx on public.contacts (company_id);
create index contacts_email_idx on public.contacts (lower(email));
create index contacts_phone_idx on public.contacts (phone);
create index contacts_company_lastname_idx on public.contacts (company_id, lower(last_name));

-- Trigger updated_at/updated_by — generyczny, reużywany przez kolejne tabele.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  -- updated_by jest ustawiane jawnie przez aplikację (auth.uid()) w UPDATE,
  -- ten trigger tylko pilnuje updated_at, żeby nie dało się go sfałszować.
  return new;
end;
$$;

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
alter table public.contacts enable row level security;

-- Faza 1 decyzja: sprzedaz i realizacja widzą wszystko. Brak kolumn
-- finansowych na companies/contacts w Fazie 1, więc nie ma tu jeszcze
-- polityki opartej o can_view_financials — doda się przy module Ofert.
create policy "companies_select_active_users"
  on public.companies for select
  to authenticated
  using (public.is_active_user());

create policy "companies_insert_active_users"
  on public.companies for insert
  to authenticated
  with check (public.is_active_user());

create policy "companies_update_active_users"
  on public.companies for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

-- Brak polityki DELETE na companies — archiwizacja przez is_archived, nigdy DELETE.

create policy "contacts_select_active_users"
  on public.contacts for select
  to authenticated
  using (public.is_active_user());

create policy "contacts_insert_active_users"
  on public.contacts for insert
  to authenticated
  with check (public.is_active_user());

create policy "contacts_update_active_users"
  on public.contacts for update
  to authenticated
  using (public.is_active_user())
  with check (public.is_active_user());

-- Brak polityki DELETE na contacts (jedyny wyjątek: RODO, obsługiwane poza RLS
-- przez funkcję service-role opisaną w docs/MIGRATIONS_BACKUP.md).
