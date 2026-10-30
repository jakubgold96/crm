-- Fixture testowe do lokalnych testów RLS/triggerów na realnym Postgresie.
-- Zakłada istnienie auth.users (symulowanych w teście integracyjnym/CI) —
-- zob. tests/sql/README.md po szczegóły uruchomienia.
--
-- WAŻNE: po INSERT INTO auth.users trigger handle_new_user (migracja 2)
-- automatycznie tworzy wiersz w public.profiles z domyślną rolą 'sprzedaz'.
-- Dlatego tutaj robimy UPDATE, nie INSERT, na profiles.

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'sprzedaz@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'admin@test.local'),
  ('33333333-3333-3333-3333-333333333333', 'nieaktywny@test.local')
on conflict (id) do nothing;

update public.profiles set full_name = 'Jan Sprzedaż', role = 'sprzedaz', is_active = true
  where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set full_name = 'Anna Admin', role = 'administrator', is_active = true
  where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set full_name = 'Piotr Nieaktywny', role = 'realizacja', is_active = false
  where id = '33333333-3333-3333-3333-333333333333';

insert into public.companies (id, name, created_by) values
  ('44444444-4444-4444-4444-444444444444', 'Test Company Sp. z o.o.', '11111111-1111-1111-1111-111111111111')
on conflict (id) do nothing;
