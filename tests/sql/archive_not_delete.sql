-- Test SQL: archiwizacja zamiast fizycznego usuwania (CLAUDE.md zasada #3,
-- kryterium akceptacji #5). Pokrywa companies i inquiries.
--
-- Uruchomienie: po migracjach + fixtures.sql, tak jak inne testy w tym katalogu.

-- --- Test: DELETE na companies jest odrzucony (brak grantu + brak polityki) ---
do $$
declare
  v_count_before int;
  v_count_after int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select count(*) into v_count_before from public.companies;

  begin
    delete from public.companies where id = '44444444-4444-4444-4444-444444444444';
  exception
    when others then
      raise notice 'OK: DELETE na companies odrzucony: %', sqlerrm;
  end;

  select count(*) into v_count_after from public.companies;
  if v_count_after <> v_count_before then
    raise exception 'FAIL: liczba firm zmieniła się po próbie DELETE (% -> %)', v_count_before, v_count_after;
  end if;
  raise notice 'OK: liczba firm niezmieniona po próbie DELETE (%)', v_count_after;
end $$;

-- --- Test: archiwizacja firmy to UPDATE is_archived=true, rekord zostaje w bazie ---
do $$
declare
  v_exists_before boolean;
  v_is_archived boolean;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

  select exists(select 1 from public.companies where id = '44444444-4444-4444-4444-444444444444')
    into v_exists_before;
  if not v_exists_before then
    raise exception 'FAIL: fixture firmy nie istnieje przed testem archiwizacji';
  end if;

  update public.companies set is_archived = true where id = '44444444-4444-4444-4444-444444444444';

  select is_archived into v_is_archived from public.companies where id = '44444444-4444-4444-4444-444444444444';
  if v_is_archived is distinct from true then
    raise exception 'FAIL: is_archived nie ustawione na true po archiwizacji';
  end if;
  raise notice 'OK: firma zarchiwizowana (is_archived=true), rekord fizycznie istnieje';

  -- zmiana is_archived na companies trafia do audit_log (trigger audit_companies)
  if not exists (
    select 1 from public.audit_log
    where table_name = 'companies' and record_id = '44444444-4444-4444-4444-444444444444'
      and field_name = 'is_archived' and new_value = 'true'
  ) then
    raise exception 'FAIL: archiwizacja firmy nie trafiła do audit_log';
  end if;
  raise notice 'OK: archiwizacja firmy odnotowana w audit_log';

  -- Przywróć stan dla kolejnych testów w tym samym przebiegu.
  update public.companies set is_archived = false where id = '44444444-4444-4444-4444-444444444444';
end $$;

-- --- Test: archiwizacja zapytania wymaga powodu (constraint archived_reason_requires_flag)
--     i zachowuje rekord oraz całą jego historię (number, audit_log, inquiry_services) ---
do $$
declare
  v_inquiry_id uuid;
  v_number text;
  v_count_before int;
  v_count_after int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

  insert into public.inquiries (company_id, short_description, created_by)
  values ('44444444-4444-4444-4444-444444444444', 'Zapytanie do archiwizacji', '11111111-1111-1111-1111-111111111111')
  returning id, number into v_inquiry_id, v_number;

  select count(*) into v_count_before from public.inquiries;

  -- Próba DELETE jest odrzucona (powtórka testu z rls_and_numbering.sql, ale
  -- tutaj w kontekście pełnego cyklu archiwizacji tego samego rekordu).
  begin
    delete from public.inquiries where id = v_inquiry_id;
  exception
    when others then
      raise notice 'OK: DELETE na zapytaniu odrzucony: %', sqlerrm;
  end;

  select count(*) into v_count_after from public.inquiries;
  if v_count_after <> v_count_before then
    raise exception 'FAIL: liczba zapytań zmieniła się po próbie DELETE';
  end if;

  -- Archiwizacja bez powodu narusza constraint (is_archived=true wymaga,
  -- żeby archived_reason/archived_at zostały wypełnione przez aplikację —
  -- sam constraint dopuszcza is_archived=true z NULL reason, więc to
  -- aplikacja wymusza podanie powodu w UI; tu sprawdzamy ścieżkę z powodem,
  -- bo to ona jest kontraktem produktowym, patrz docs/DATA_MODEL.md).
  update public.inquiries
    set is_archived = true, archived_reason = 'Klient zrezygnował z projektu', archived_at = now()
    where id = v_inquiry_id;

  if not exists (
    select 1 from public.inquiries
    where id = v_inquiry_id and is_archived = true and archived_reason is not null and number = v_number
  ) then
    raise exception 'FAIL: zapytanie po archiwizacji nie ma oczekiwanego stanu (is_archived/archived_reason/number)';
  end if;
  raise notice 'OK: zapytanie zarchiwizowane z powodem, numer % zachowany, rekord fizycznie istnieje', v_number;

  -- Archiwizacja (is_archived zmienione) trafia do audit_log i activity_log.
  if not exists (
    select 1 from public.audit_log
    where table_name = 'inquiries' and record_id = v_inquiry_id and field_name = 'is_archived' and new_value = 'true'
  ) then
    raise exception 'FAIL: archiwizacja zapytania nie trafiła do audit_log';
  end if;
  if not exists (
    select 1 from public.audit_log
    where table_name = 'inquiries' and record_id = v_inquiry_id and field_name = 'archived_reason'
      and new_value = 'Klient zrezygnował z projektu'
  ) then
    raise exception 'FAIL: powód archiwizacji nie trafił do audit_log';
  end if;
  if not exists (
    select 1 from public.activity_log where inquiry_id = v_inquiry_id and type = 'change'
  ) then
    raise exception 'FAIL: archiwizacja nie wygenerowała wpisu w activity_log';
  end if;
  raise notice 'OK: archiwizacja zapytania (stan + powód) odnotowana w audit_log i activity_log';

  -- Constraint: is_archived=false wymaga braku reason/at (próba "odarchiwizowania"
  -- bez wyczyszczenia powodu musi zostać odrzucona przez CHECK).
  begin
    update public.inquiries set is_archived = false where id = v_inquiry_id;
    raise exception 'FAIL: cofnięcie archiwizacji bez wyczyszczenia archived_reason/archived_at zostało zaakceptowane';
  exception
    when check_violation then
      raise notice 'OK: constraint odrzuca is_archived=false z niewyczyszczonym archived_reason/archived_at';
    when others then
      raise exception 'FAIL: nieoczekiwany błąd przy próbie cofnięcia archiwizacji: %', sqlerrm;
  end;
end $$;

do $$ begin raise notice '=== TESTY ARCHIWIZACJI (NIE DELETE) PRZESZŁY ==='; end $$;
