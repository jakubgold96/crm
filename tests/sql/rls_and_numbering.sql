-- Test SQL: numeracja zapytań + RLS, z twardymi asercjami (DO $$ ... RAISE
-- EXCEPTION, jeśli warunek nie jest spełniony — skrypt kończy się błędem,
-- co łatwo spiąć z CI: `psql ... -v ON_ERROR_STOP=1 -f this.sql` zwraca
-- kod wyjścia != 0 przy niepowodzeniu dowolnej asercji).
--
-- Uruchomienie lokalne (poza supabase start, bezpośrednio na Postgresie
-- z zaaplikowanymi migracjami i stubem auth/storage — patrz tests/sql/README.md):
--   psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/fixtures.sql
--   psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/rls_and_numbering.sql

-- --- Test: nieaktywny użytkownik nie widzi żadnych zapytań ---
do $$
declare
  v_count int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
  select count(*) into v_count from public.inquiries;
  if v_count <> 0 then
    raise exception 'FAIL: nieaktywny użytkownik widzi % zapytań, oczekiwano 0', v_count;
  end if;
  raise notice 'OK: nieaktywny użytkownik nie widzi zapytań';
end $$;

-- --- Test: numeracja — insert bez numeru dostaje unikalny INQ-NNNNNN ---
do $$
declare
  v_number text;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  insert into public.inquiries (company_id, short_description, created_by)
  values ('44444444-4444-4444-4444-444444444444', 'Test numeracji', '11111111-1111-1111-1111-111111111111')
  returning number into v_number;

  if v_number !~ '^INQ-\d{6}$' then
    raise exception 'FAIL: numer "%" nie pasuje do formatu INQ-NNNNNN', v_number;
  end if;
  raise notice 'OK: numer nadany automatycznie: %', v_number;
end $$;

-- --- Test: próba ręcznego numeru przy INSERT jest odrzucana ---
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  begin
    insert into public.inquiries (number, company_id, short_description, created_by)
    values ('INQ-999999', '44444444-4444-4444-4444-444444444444', 'x', '11111111-1111-1111-1111-111111111111');
    raise exception 'FAIL: ręczny numer został zaakceptowany, nie powinien';
  exception
    when others then
      if sqlerrm like '%nadawany automatycznie%' then
        raise notice 'OK: ręczny numer odrzucony: %', sqlerrm;
      else
        raise exception 'FAIL: nieoczekiwany błąd: %', sqlerrm;
      end if;
  end;
end $$;

-- --- Test: numer jest niezmienny po UPDATE ---
do $$
declare
  v_first_number text;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select number into v_first_number from public.inquiries order by created_at limit 1;

  begin
    update public.inquiries set number = 'INQ-000099' where number = v_first_number;
    raise exception 'FAIL: numer dał się zmienić przez UPDATE';
  exception
    when others then
      if sqlerrm like '%niezmienny%' then
        raise notice 'OK: numer niezmienny po UPDATE';
      else
        raise exception 'FAIL: nieoczekiwany błąd przy UPDATE numeru: %', sqlerrm;
      end if;
  end;
end $$;

-- --- Test: DELETE na inquiries jest odrzucany (brak polityki + brak grantu) ---
do $$
declare
  v_number text;
  v_count_before int;
  v_count_after int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select number into v_number from public.inquiries order by created_at limit 1;
  select count(*) into v_count_before from public.inquiries;

  begin
    delete from public.inquiries where number = v_number;
  exception
    when others then
      raise notice 'OK: DELETE odrzucony na poziomie uprawnień: %', sqlerrm;
  end;

  select count(*) into v_count_after from public.inquiries;
  if v_count_after <> v_count_before then
    raise exception 'FAIL: liczba zapytań zmieniła się po próbie DELETE (% -> %)', v_count_before, v_count_after;
  end if;
  raise notice 'OK: liczba zapytań niezmieniona po próbie DELETE (%).', v_count_after;
end $$;

-- --- Test: audit_log zapisuje prawdziwego użytkownika z sesji ---
do $$
declare
  v_inquiry_id uuid;
  v_changed_by uuid;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);

  select id into v_inquiry_id from public.inquiries order by created_at limit 1;
  update public.inquiries set sales_stage = 'kwalifikacja' where id = v_inquiry_id;

  select changed_by into v_changed_by
  from public.audit_log
  where record_id = v_inquiry_id and field_name = 'sales_stage'
  order by changed_at desc limit 1;

  if v_changed_by is distinct from '22222222-2222-2222-2222-222222222222'::uuid then
    raise exception 'FAIL: audit_log.changed_by = %, oczekiwano 22222222-...', v_changed_by;
  end if;
  raise notice 'OK: audit_log poprawnie zapisuje autora zmiany';
end $$;

-- --- Test: operational_group i sales_stage są niezależne (zmiana jednego nie rusza drugiego) ---
do $$
declare
  v_inquiry_id uuid;
  v_group_before operational_group;
  v_group_after operational_group;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

  select id, operational_group into v_inquiry_id, v_group_before
  from public.inquiries order by created_at limit 1;

  update public.inquiries set sales_stage = 'negocjacje' where id = v_inquiry_id;

  select operational_group into v_group_after from public.inquiries where id = v_inquiry_id;

  if v_group_before is distinct from v_group_after then
    raise exception 'FAIL: zmiana sales_stage zmieniła operational_group (% -> %)', v_group_before, v_group_after;
  end if;
  raise notice 'OK: operational_group i sales_stage są niezależne';
end $$;

do $$ begin raise notice '=== WSZYSTKIE TESTY SQL PRZESZŁY ==='; end $$;
