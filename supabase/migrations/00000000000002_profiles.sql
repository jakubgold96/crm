-- INNDES CRM — Faza 1 — migracja 2: profiles (rozszerzenie auth.users)
-- Supabase nie pozwala dowolnie modyfikować auth.users, więc trzymamy dane
-- aplikacyjne użytkownika w osobnej tabeli 1:1 z auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role user_role not null default 'sprzedaz',
  -- Uprawnienie NIEZALEŻNE od roli organizacyjnej: osoba finansowa może mieć
  -- rolę 'sprzedaz'. Patrz docs/DATA_MODEL.md sekcja `profiles`.
  can_view_financials boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Dane aplikacyjne użytkownika. role = rola organizacyjna (wpływa na UI). '
  'can_view_financials = osobne uprawnienie do pól finansowych/marży, '
  'niewyprowadzane z role. is_active = false to sposób odebrania dostępu '
  '(nigdy nie usuwamy konta fizycznie).';

-- Funkcja pomocnicza: tworzy profil automatycznie po rejestracji w auth.users.
-- full_name i role są ustawiane z user_metadata przekazanego przy signUp;
-- jeśli brak — rozsądny default, administrator poprawia ręcznie w Ustawieniach.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'sprzedaz')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Funkcja pomocnicza do polityk RLS w innych tabelach: czy bieżący użytkownik
-- jest aktywny. Używana zamiast powtarzania podzapytania w każdej polityce.
create function public.is_active_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active = true
  );
$$;

create function public.current_user_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.current_user_can_view_financials()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select can_view_financials or role = 'administrator'
     from public.profiles where id = auth.uid()),
    false
  );
$$;

alter table public.profiles enable row level security;

-- Każdy aktywny zalogowany użytkownik widzi wszystkie aktywne I nieaktywne
-- profile (potrzebne np. żeby administrator widział kogo reaktywować,
-- a zwykły user widział listę właścicieli do przypisania — ale lista
-- właścicieli w UI filtruje po is_active, to kwestia frontendu, nie RLS).
create policy "profiles_select_active_users"
  on public.profiles for select
  to authenticated
  using (public.is_active_user());

-- Użytkownik może edytować tylko własne dane niewrażliwe (np. full_name),
-- nigdy swoją rolę ani can_view_financials ani is_active.
create policy "profiles_update_own_basic"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() and public.is_active_user())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and can_view_financials = (select can_view_financials from public.profiles where id = auth.uid())
    and is_active = (select is_active from public.profiles where id = auth.uid())
  );

-- Administrator może modyfikować dowolny profil (rola, uprawnienia, aktywność).
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.current_user_role() = 'administrator' and public.is_active_user())
  with check (public.current_user_role() = 'administrator');

-- Brak polityki DELETE — konta nie są usuwane fizycznie, tylko dezaktywowane
-- (is_active = false). Brak polityki = odmowa domyślna w Postgres RLS.
