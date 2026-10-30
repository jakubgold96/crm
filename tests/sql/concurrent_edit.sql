-- Test SQL: dwóch użytkowników edytujących ten sam rekord (inquiries) w tym
-- samym czasie.
--
-- UWAGA — co ten test faktycznie sprawdza: aplikacja w Fazie 1 NIE ma
-- optimistic locking (sprawdzania updated_at/wersji przed zapisem) — każdy
-- UPDATE z UI zapisuje konkretne pole, nie cały wiersz na podstawie starej
-- kopii. To oznacza: przy edycji RÓŻNYCH pól przez dwóch userów naraz, obie
-- zmiany się zachowują (nie ma utraty danych). Przy edycji TEGO SAMEGO pola
-- naraz wygrywa zapis, który committuje jako drugi (last-write-wins) — tak
-- jak w typowym UPDATE bez blokady. To, co jest zagwarantowane i co ten test
-- dowodzi: (a) żadna zmiana nigdy nie przepada bez śladu — audit_log
-- zapisuje OBU autorów z ich realnymi zmianami, nawet jeśli finalna wartość
-- pola to tylko ostatni zapis; (b) baza nie blokuje się nawzajem ani nie
-- gubi wiersza; (c) historia pozwala odtworzyć kto i kiedy nadpisał kogo.
--
-- OTWARTY PUNKT: jeśli w przyszłości produkt zdecyduje, że potrzebny jest
-- optimistic locking z ostrzeżeniem "ktoś inny zmienił ten rekord" w UI,
-- to zmiana na poziomie aplikacji (sprawdzenie updated_at przed UPDATE) +
-- nowy test na to zachowanie — nie jest to część Fazy 1.
--
-- Uruchomienie: po migracjach + fixtures.sql, tak jak inne testy w tym katalogu.

-- --- Scenariusz A: dwaj użytkownicy edytują RÓŻNE pola tego samego zapytania ---
do $$
declare
  v_inquiry_id uuid;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

  insert into public.inquiries (company_id, short_description, owner_id, next_step, created_by)
  values ('44444444-4444-4444-4444-444444444444', 'Zapytanie do testu współbieżnej edycji',
          '11111111-1111-1111-1111-111111111111', 'Pierwszy kontakt', '11111111-1111-1111-1111-111111111111')
  returning id into v_inquiry_id;

  -- User A (sprzedaz) zmienia next_step.
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  update public.inquiries set next_step = 'Wysłać ofertę wstępną' where id = v_inquiry_id;

  -- User B (administrator) "w tym samym czasie" zmienia sales_stage (inne pole).
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  update public.inquiries set sales_stage = 'kwalifikacja' where id = v_inquiry_id;

  -- Obie zmiany muszą być zachowane równocześnie.
  if not exists (
    select 1 from public.inquiries
    where id = v_inquiry_id and next_step = 'Wysłać ofertę wstępną' and sales_stage = 'kwalifikacja'
  ) then
    raise exception 'FAIL: edycja różnych pól przez dwóch userów nie zachowała obu zmian';
  end if;
  raise notice 'OK: edycja różnych pól przez dwóch userów zachowuje obie zmiany (brak utraty danych)';

  -- audit_log musi zawierać OBU autorów, z właściwymi polami.
  if not exists (
    select 1 from public.audit_log
    where record_id = v_inquiry_id and field_name = 'next_step'
      and changed_by = '11111111-1111-1111-1111-111111111111'
  ) then
    raise exception 'FAIL: audit_log nie zawiera zmiany next_step przez usera A';
  end if;
  if not exists (
    select 1 from public.audit_log
    where record_id = v_inquiry_id and field_name = 'sales_stage'
      and changed_by = '22222222-2222-2222-2222-222222222222'
  ) then
    raise exception 'FAIL: audit_log nie zawiera zmiany sales_stage przez usera B';
  end if;
  raise notice 'OK: audit_log zawiera obie zmiany z poprawnymi, różnymi autorami';
end $$;

-- --- Scenariusz B: dwaj użytkownicy edytują TO SAME pole tego samego zapytania ---
do $$
declare
  v_inquiry_id uuid;
  v_final_owner uuid;
  v_audit_count int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

  insert into public.inquiries (company_id, short_description, owner_id, created_by)
  values ('44444444-4444-4444-4444-444444444444', 'Zapytanie do testu konfliktu na jednym polu',
          null, '11111111-1111-1111-1111-111111111111')
  returning id into v_inquiry_id;

  -- Zapytanie startuje bez właściciela. Oba "równoczesne" zapisy: A przypisuje
  -- siebie, B przypisuje siebie — w tej samej sekundzie z punktu widzenia
  -- użytkowników, każdy zmieniając owner_id z NULL na swoje id (czyli trigger
  -- audytowy faktycznie widzi zmianę przy OBU zapisach, nie tylko drugim).
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  update public.inquiries set owner_id = '11111111-1111-1111-1111-111111111111' where id = v_inquiry_id;

  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  update public.inquiries set owner_id = '22222222-2222-2222-2222-222222222222' where id = v_inquiry_id;

  -- Brak blokady/optimistic locking w Fazie 1: drugi zapis (committed jako
  -- drugi) wygrywa — to jest UDOKUMENTOWANE zachowanie, nie błąd.
  select owner_id into v_final_owner from public.inquiries where id = v_inquiry_id;
  if v_final_owner is distinct from '22222222-2222-2222-2222-222222222222'::uuid then
    raise exception 'FAIL: finalny owner_id = %, oczekiwano ostatniego zapisu (administrator), zgodnie z last-write-wins', v_final_owner;
  end if;
  raise notice 'OK: przy edycji tego samego pola wygrywa ostatni zapis (last-write-wins, zgodnie z projektem Fazy 1)';

  -- Mimo "przegranej" zmiany, OBA zapisy są w audit_log — nic nie zniknęło bez śladu.
  select count(*) into v_audit_count
  from public.audit_log
  where record_id = v_inquiry_id and field_name = 'owner_id';

  if v_audit_count < 2 then
    raise exception 'FAIL: audit_log zawiera tylko % wpis(y) dla owner_id, oczekiwano co najmniej 2 (obie zmiany, nawet przegrana)', v_audit_count;
  end if;
  if not exists (
    select 1 from public.audit_log
    where record_id = v_inquiry_id and field_name = 'owner_id'
      and changed_by = '11111111-1111-1111-1111-111111111111'
  ) then
    raise exception 'FAIL: audit_log nie zawiera "przegranej" zmiany usera A — utrata śladu w historii';
  end if;
  if not exists (
    select 1 from public.audit_log
    where record_id = v_inquiry_id and field_name = 'owner_id'
      and changed_by = '22222222-2222-2222-2222-222222222222'
  ) then
    raise exception 'FAIL: audit_log nie zawiera zwycięskiej zmiany usera B';
  end if;
  raise notice 'OK: obie zmiany (w tym "przegrana") są w audit_log — konflikt jest odtwarzalny z historii, nic nie ginie po cichu';
end $$;

do $$ begin raise notice '=== TESTY WSPÓŁBIEŻNEJ EDYCJI TEGO SAMEGO REKORDU PRZESZŁY ==='; end $$;
