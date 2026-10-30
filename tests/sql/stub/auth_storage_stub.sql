-- Minimalny stub schematów Supabase (auth, storage) do lokalnego testu migracji
-- poza pełnym `supabase start` (brak Dockera w tym środowisku).
-- To NIE jest produkcyjny schemat Supabase — tylko na tyle, żeby nasze
-- migracje biznesowe dały się wykonać i zweryfikować pod kątem składni,
-- ograniczeń, triggerów i RLS.

create schema if not exists auth;
create schema if not exists storage;

create extension if not exists pgcrypto;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- auth.uid() w prawdziwym Supabase czyta z JWT (request.jwt.claims). Tu
-- symulujemy to zmienną sesji ustawianą w testach przez SET LOCAL.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz default now()
);

alter table storage.objects enable row level security;

-- role 'authenticated' musi istnieć, bo migracje robią `to authenticated`.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
end
$$;

grant usage on schema public, auth, storage to authenticated, anon;
