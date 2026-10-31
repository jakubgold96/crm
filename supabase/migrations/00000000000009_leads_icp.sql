-- INNDES CRM — Faza 3a — migracja 9: profile ICP, leady, fakty o leadach
--
-- Zakres (docs/PRD.md §7, docs/DATA_MODEL.md "Faza 3"): leady z
-- domeny/nazwy firmy, profile ICP, fakty ze źródłami, scoring z
-- uzasadnieniem, ręczna konwersja lead -> zapytanie. BEZ agenta AI — ten
-- dochodzi w Fazie 3b i będzie zapisywał do tych samych tabel.
--
-- Twarde reguły pilnowane przez bazę (nie tylko UI):
--   #8  lead może powstać z samej domeny (company_name opcjonalne)
--   #9  fakt bez linku źródłowego = confidence 'brak_potwierdzenia'
--   #10 score bez score_rationale jest niemożliwy
--   CLAUDE.md #3: brak DELETE — archiwizacja leadów, ukrywanie faktów.

-- ---------- Enumy ----------
create type lead_status as enum (
  'nowy',
  'do_researchu',
  'zbadany',
  'do_zatwierdzenia',
  'gotowy_do_kontaktu',
  'kontakt_wyslany',
  'odpowiedzial',
  'zakwalifikowany',
  'rozmowa_umowiona',
  'nie_teraz',
  'nie_pasuje',
  'zakaz_kontaktu'
);

create type fact_confidence as enum ('wysoka', 'srednia', 'niska', 'brak_potwierdzenia');

-- Zapytanie utworzone z leada ma jawne źródło (nie "inne").
alter type inquiry_source add value if not exists 'lead';

-- ---------- Profile ICP ----------
create table public.icp_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  segment company_segment,
  countries text[] not null default '{}',
  object_type object_type,
  min_scope text,
  typical_problem text,
  matching_services text[] not null default '{}',
  positive_criteria text[] not null default '{}',
  exclusion_criteria text[] not null default '{}',
  example_projects text[] not null default '{}',
  preferred_language text,
  message_tone text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

comment on table public.icp_profiles is 'Profile idealnego klienta (ICP). Nie usuwane fizycznie — is_archived.';

-- ---------- Leady ----------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  domain text,
  company_id uuid references public.companies (id),
  contact_id uuid references public.contacts (id),
  country text,
  icp_profile_id uuid references public.icp_profiles (id),
  status lead_status not null default 'nowy',
  score int check (score between 0 and 100),
  score_rationale text,
  need text,
  proposed_service text,
  owner_id uuid references public.profiles (id),
  researched_at timestamptz,
  contact_consent contact_consent not null default 'brak_danych',
  converted_inquiry_id uuid references public.inquiries (id),
  is_archived boolean not null default false,
  archived_reason text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id),

  -- #8: wystarczy domena ALBO nazwa firmy
  constraint leads_domain_or_name check (
    nullif(trim(coalesce(domain, '')), '') is not null
    or nullif(trim(coalesce(company_name, '')), '') is not null
  ),
  -- #10: wynik scoringu zawsze z uzasadnieniem
  constraint leads_score_has_rationale check (
    score is null or nullif(trim(coalesce(score_rationale, '')), '') is not null
  ),
  -- domena trzymana znormalizowana: małe litery, bez protokołu/ścieżki/www
  constraint leads_domain_normalized check (
    domain is null or domain ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'
  ),
  constraint leads_archive_reason check (is_archived = false or nullif(trim(coalesce(archived_reason, '')), '') is not null)
);

comment on table public.leads is 'Leady (potencjalni klienci przed zapytaniem). Konwersja do zapytania tylko ręcznie (RPC convert_lead_to_inquiry).';

create index leads_domain_idx on public.leads (domain);
create index leads_status_idx on public.leads (status) where is_archived = false;
create index leads_owner_idx on public.leads (owner_id);
create index leads_icp_idx on public.leads (icp_profile_id);

-- ---------- Fakty o leadach ----------
create table public.lead_facts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id),
  fact text not null check (length(trim(fact)) > 0),
  source_url text check (source_url is null or source_url ~* '^https?://'),
  verified_at date,
  confidence fact_confidence not null,
  is_hidden boolean not null default false,
  hidden_reason text,
  hidden_at timestamptz,
  hidden_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),

  -- #9: brak źródła = brak potwierdzenia (agent i człowiek pod tą samą regułą)
  constraint lead_facts_source_or_unconfirmed check (
    nullif(trim(coalesce(source_url, '')), '') is not null or confidence = 'brak_potwierdzenia'
  ),
  constraint lead_facts_hidden_reason check (is_hidden = false or nullif(trim(coalesce(hidden_reason, '')), '') is not null)
);

comment on table public.lead_facts is 'Fakty o leadzie z linkiem do źródła. Nigdy nie usuwane — is_hidden z powodem.';

create index lead_facts_lead_idx on public.lead_facts (lead_id, created_at desc);

-- ---------- updated_at ----------
create trigger icp_profiles_set_updated_at
  before update on public.icp_profiles
  for each row execute function public.set_updated_at();

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ---------- Historia zmian leada (audit_log, jak inquiries) ----------
create function public.audit_leads()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'status', old.status::text, new.status::text, auth.uid());
  end if;
  if old.score is distinct from new.score then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'score', old.score::text, new.score::text, auth.uid());
  end if;
  if old.score_rationale is distinct from new.score_rationale then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'score_rationale', old.score_rationale, new.score_rationale, auth.uid());
  end if;
  if old.owner_id is distinct from new.owner_id then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'owner_id', old.owner_id::text, new.owner_id::text, auth.uid());
  end if;
  if old.icp_profile_id is distinct from new.icp_profile_id then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'icp_profile_id', old.icp_profile_id::text, new.icp_profile_id::text, auth.uid());
  end if;
  if old.contact_consent is distinct from new.contact_consent then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'contact_consent', old.contact_consent::text, new.contact_consent::text, auth.uid());
  end if;
  if old.converted_inquiry_id is distinct from new.converted_inquiry_id then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'converted_inquiry_id', old.converted_inquiry_id::text, new.converted_inquiry_id::text, auth.uid());
  end if;
  if old.is_archived is distinct from new.is_archived then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('leads', new.id, 'is_archived', old.is_archived::text, new.is_archived::text, auth.uid());
    if new.is_archived then
      insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
      values ('leads', new.id, 'archived_reason', null, new.archived_reason, auth.uid());
    end if;
  end if;
  return new;
end;
$$;

create trigger leads_audit
  after update on public.leads
  for each row execute function public.audit_leads();

-- ---------- RLS (jak reszta: aktywni użytkownicy, bez DELETE) ----------
alter table public.icp_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_facts enable row level security;

create policy "icp_profiles_select_active_users" on public.icp_profiles for select to authenticated using (public.is_active_user());
create policy "icp_profiles_insert_active_users" on public.icp_profiles for insert to authenticated with check (public.is_active_user());
create policy "icp_profiles_update_active_users" on public.icp_profiles for update to authenticated using (public.is_active_user()) with check (public.is_active_user());

create policy "leads_select_active_users" on public.leads for select to authenticated using (public.is_active_user());
create policy "leads_insert_active_users" on public.leads for insert to authenticated with check (public.is_active_user());
create policy "leads_update_active_users" on public.leads for update to authenticated using (public.is_active_user()) with check (public.is_active_user());

create policy "lead_facts_select_active_users" on public.lead_facts for select to authenticated using (public.is_active_user());
create policy "lead_facts_insert_active_users" on public.lead_facts for insert to authenticated with check (public.is_active_user());
-- UPDATE faktów tylko do ukrywania; treść faktu się nie zmienia (nowa wersja = nowy fakt).
create policy "lead_facts_update_active_users" on public.lead_facts for update to authenticated using (public.is_active_user()) with check (public.is_active_user());

create function public.lead_facts_only_hide()
returns trigger
language plpgsql
as $$
begin
  if new.fact is distinct from old.fact
     or new.source_url is distinct from old.source_url
     or new.confidence is distinct from old.confidence
     or new.verified_at is distinct from old.verified_at
     or new.lead_id is distinct from old.lead_id then
    raise exception 'Fakty są niezmienne — dodaj nowy fakt i ukryj stary (z powodem).';
  end if;
  return new;
end;
$$;

create trigger lead_facts_only_hide
  before update on public.lead_facts
  for each row execute function public.lead_facts_only_hide();

-- Granty (wzorzec z migracji 7): SELECT/INSERT/UPDATE, nigdy DELETE.
grant select, insert, update on public.icp_profiles, public.leads, public.lead_facts to authenticated;

-- ---------- Konwersja lead -> zapytanie (atomowa, ręczna) ----------
-- SECURITY INVOKER: RLS nadal obowiązuje. Blokuje wiersz leada, żeby dwa
-- równoczesne kliknięcia nie utworzyły dwóch zapytań.
create function public.convert_lead_to_inquiry(p_lead_id uuid)
returns public.inquiries
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_lead public.leads;
  v_company_id uuid;
  v_inquiry public.inquiries;
begin
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'Lead nie istnieje albo brak dostępu.';
  end if;
  if v_lead.converted_inquiry_id is not null then
    raise exception 'Ten lead ma już zapytanie (%).', v_lead.converted_inquiry_id;
  end if;
  if v_lead.is_archived then
    raise exception 'Lead jest zarchiwizowany.';
  end if;
  if v_lead.contact_consent = 'zakaz' or v_lead.status = 'zakaz_kontaktu' then
    raise exception 'Lead ma zakaz kontaktu — nie można utworzyć zapytania.';
  end if;

  v_company_id := v_lead.company_id;
  if v_company_id is null then
    insert into public.companies (name, website, country, created_by, updated_by)
    values (coalesce(nullif(trim(v_lead.company_name), ''), v_lead.domain), v_lead.domain, v_lead.country, auth.uid(), auth.uid())
    returning id into v_company_id;
  end if;

  insert into public.inquiries (
    company_id, contact_id, inquiry_date, country, short_description, source,
    operational_group, sales_stage, owner_id, next_step, next_step_due, task_status,
    scope_notes, created_by, updated_by
  ) values (
    v_company_id, v_lead.contact_id, current_date, v_lead.country,
    coalesce(nullif(trim(v_lead.need), ''), 'Zapytanie z leada: ' || coalesce(nullif(trim(v_lead.company_name), ''), v_lead.domain)),
    'lead', 'wymaga_dzialania', 'nowe', coalesce(v_lead.owner_id, auth.uid()),
    'Skontaktować się z klientem i potwierdzić potrzebę', current_date + 2, 'otwarte',
    nullif(trim(coalesce(v_lead.proposed_service, '')), ''), auth.uid(), auth.uid()
  )
  returning * into v_inquiry;

  update public.leads
  set converted_inquiry_id = v_inquiry.id,
      company_id = v_company_id,
      status = 'zakwalifikowany',
      updated_by = auth.uid()
  where id = p_lead_id;

  return v_inquiry;
end;
$$;

grant execute on function public.convert_lead_to_inquiry(uuid) to authenticated;

-- ---------- 4 profile ICP z PRD (tylko nazwa + segment) ----------
-- Szczegóły (kraje, kryteria, wykluczenia, ton) były w oryginalnym briefie,
-- którego nie ma w repo — nie zgadujemy ich (CLAUDE.md #5/#7). Uzupełnia
-- właściciel w UI /icp.
insert into public.icp_profiles (name, segment) values
  ('Studio architektoniczne', 'architekt'),
  ('Hotel / restauracja', 'hotel'),
  ('Marka meblowa', 'marka_meblowa'),
  ('Generalny wykonawca', 'generalny_wykonawca');
