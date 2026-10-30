-- Dane demonstracyjne — WYŁĄCZNIE środowisko local/dev (supabase db reset
-- uruchamia ten plik automatycznie). Nigdy nie uruchamiaj na produkcji.
--
-- Uwaga: konta użytkowników (auth.users) nie są tworzone tutaj — Supabase
-- lokalnie wymaga signUp przez Auth API, nie INSERT bezpośrednio z hasłem
-- zahaszowanym ręcznie w sposób bezpieczny do skryptu. Po signUp trigger
-- handle_new_user (migracja 2) AUTOMATYCZNIE tworzy wiersz w public.profiles
-- z full_name = email i role = 'sprzedaz' domyślnie — zweryfikowane lokalnym
-- testem migracji (patrz STATUS.md). Jeśli potrzebujesz innej roli/konta
-- administratora, zrób UPDATE public.profiles SET role = 'administrator'
-- WHERE id = '<uuid z auth.users>' po utworzeniu konta, nie INSERT.
-- Ten plik seeduje tylko dane biznesowe, zakładając że profile użytkowników
-- już istnieją (podmień UUID po utworzeniu kont w swoim środowisku lokalnym).

-- Firmy demo
insert into public.companies (id, name, country, city, segment, relationship_status, website, email)
values
  ('00000000-0000-0000-0000-000000000101', 'Nordic Home AS', 'Norwegia', 'Oslo', 'marka_meblowa', 'aktywny', 'nordichome.no', 'kontakt@nordichome.no'),
  ('00000000-0000-0000-0000-000000000102', 'Hotel Baltyk Sp. z o.o.', 'Polska', 'Gdańsk', 'hotel', 'nowy', 'hotelbaltyk.pl', 'biuro@hotelbaltyk.pl'),
  ('00000000-0000-0000-0000-000000000103', 'Studio Architektura Plus', 'Niemcy', 'Berlin', 'architekt', 'aktywny', 'architekturaplus.de', 'info@architekturaplus.de')
on conflict (id) do nothing;

insert into public.contacts (id, company_id, first_name, last_name, position, role, email, language, contact_consent)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Lars', 'Andersen', 'Zakupy', 'kupiec', 'lars@nordichome.no', 'en', 'zgoda'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'Anna', 'Kowalska', 'Dyrektor', 'wlasciciel', 'anna.kowalska@hotelbaltyk.pl', 'pl', 'zgoda'),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', 'Felix', 'Weber', 'Architekt prowadzący', 'architekt', 'felix@architekturaplus.de', 'de', 'brak_danych')
on conflict (id) do nothing;

-- Zapytania demo — number nadawany automatycznie przez trigger, nie podajemy go.
insert into public.inquiries (company_id, contact_id, country, project_location, short_description, object_type, source, operational_group, sales_stage, next_step, next_step_due, scope_undetermined)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', 'Norwegia', 'Oslo', 'Meble do nowej linii hoteli butikowych', 'hotel', 'email', 'wymaga_dzialania', 'kwalifikacja', 'Zadzwonić i doprecyzować ilości', current_date + 2, true),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000202', 'Polska', 'Gdańsk', 'Wyposażenie lobby i restauracji hotelowej', 'hotel', 'telefon', 'do_przypomnienia', 'przygotowanie_oferty', 'Przygotować wycenę wstępną', current_date + 5, true),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', 'Niemcy', 'Berlin', 'Dokumentacja techniczna dla projektu biurowego', 'biuro', 'architekt', 'czekamy_na_klienta', 'oferta_wyslana', 'Czekamy na feedback od klienta', current_date + 10, false)
on conflict do nothing;
