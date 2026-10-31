-- Faza 3a: leady, profile ICP, fakty — RLS, reguły #8/#9/#10, brak DELETE,
-- niezmienność faktów, historia zmian, konwersja lead -> zapytanie.
-- Wymaga tests/sql/fixtures.sql (użytkownicy 1111… aktywny, 3333… nieaktywny).

-- --- Seed: 4 profile ICP z PRD ---
do $$
declare v_count int;
begin
  select count(*) into v_count from public.icp_profiles
  where name in ('Studio architektoniczne', 'Hotel / restauracja', 'Marka meblowa', 'Generalny wykonawca');
  if v_count <> 4 then raise exception 'FAIL: oczekiwano 4 profili ICP z PRD, jest %', v_count; end if;
  raise notice 'OK: 4 profile ICP z PRD istnieją';
end $$;

-- --- #8: lead z samą domeną ---
do $$
declare v_id uuid;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  insert into public.leads (domain, created_by, updated_by)
  values ('studio-przyklad.pl', auth.uid(), auth.uid())
  returning id into v_id;
  if v_id is null then raise exception 'FAIL: lead z samą domeną nie powstał'; end if;
  raise notice 'OK #8: lead z samą domeną';
end $$;

do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  begin
    insert into public.leads (country) values ('Polska');
    raise exception 'FAIL: lead bez domeny i nazwy przeszedł';
  exception when check_violation then
    raise notice 'OK: lead bez domeny i nazwy odrzucony';
  end;
  begin
    insert into public.leads (domain) values ('https://www.Przyklad.pl/kontakt');
    raise exception 'FAIL: nieznormalizowana domena przeszła';
  exception when check_violation then
    raise notice 'OK: domena musi być znormalizowana';
  end;
end $$;

-- --- #10: score bez uzasadnienia niemożliwy ---
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  begin
    insert into public.leads (domain, score) values ('bez-uzasadnienia.pl', 70);
    raise exception 'FAIL: score bez uzasadnienia przeszedł';
  exception when check_violation then
    raise notice 'OK #10: score bez uzasadnienia odrzucony';
  end;
  begin
    insert into public.leads (domain, score, score_rationale) values ('pusty.pl', 70, '   ');
    raise exception 'FAIL: score z pustym uzasadnieniem przeszedł';
  exception when check_violation then
    raise notice 'OK #10: puste uzasadnienie też odrzucone';
  end;
  insert into public.leads (domain, score, score_rationale) values ('z-uzasadnieniem.pl', 70, 'Segment hotelowy, 3 obiekty w PL');
  raise notice 'OK #10: score z uzasadnieniem zapisany';
end $$;

-- --- #9: fakt bez źródła tylko jako "brak potwierdzenia"; fakty niezmienne ---
do $$
declare v_lead uuid; v_fact uuid;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select id into v_lead from public.leads where domain = 'studio-przyklad.pl';

  begin
    insert into public.lead_facts (lead_id, fact, confidence) values (v_lead, 'Ma 3 hotele', 'wysoka');
    raise exception 'FAIL: fakt bez źródła z pewnością "wysoka" przeszedł';
  exception when check_violation then
    raise notice 'OK #9: fakt bez źródła nie może mieć pewności';
  end;

  insert into public.lead_facts (lead_id, fact, confidence) values (v_lead, 'Podobno otwiera nowy obiekt', 'brak_potwierdzenia');
  insert into public.lead_facts (lead_id, fact, source_url, verified_at, confidence, created_by)
  values (v_lead, 'Projektuje wnętrza hoteli', 'https://studio-przyklad.pl/realizacje', current_date, 'wysoka', auth.uid())
  returning id into v_fact;

  begin
    insert into public.lead_facts (lead_id, fact, source_url, confidence) values (v_lead, 'x', 'studio.pl', 'niska');
    raise exception 'FAIL: źródło bez http(s) przeszło';
  exception when check_violation then
    raise notice 'OK: źródło musi być linkiem http(s)';
  end;

  begin
    update public.lead_facts set fact = 'zmieniona treść' where id = v_fact;
    raise exception 'FAIL: treść faktu dała się zmienić';
  exception when raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'OK: treść faktu niezmienna';
  end;

  begin
    update public.lead_facts set is_hidden = true where id = v_fact;
    raise exception 'FAIL: ukrycie bez powodu przeszło';
  exception when check_violation then
    raise notice 'OK: ukrycie faktu wymaga powodu';
  end;
  update public.lead_facts set is_hidden = true, hidden_reason = 'Nieaktualne', hidden_at = now(), hidden_by = auth.uid() where id = v_fact;
  raise notice 'OK: fakt ukryty z powodem';
end $$;

-- --- Brak DELETE (grant + RLS) ---
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  begin
    delete from public.leads where domain = 'studio-przyklad.pl';
    raise exception 'FAIL: DELETE na leads przeszedł';
  exception when insufficient_privilege then
    raise notice 'OK: brak DELETE na leads';
  end;
  begin
    delete from public.lead_facts;
    raise exception 'FAIL: DELETE na lead_facts przeszedł';
  exception when insufficient_privilege then
    raise notice 'OK: brak DELETE na lead_facts';
  end;
end $$;

-- --- RLS: nieaktywny użytkownik nic nie widzi ani nie wstawia ---
do $$
declare v_count int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
  select count(*) into v_count from public.leads;
  if v_count <> 0 then raise exception 'FAIL: nieaktywny widzi % leadów', v_count; end if;
  select count(*) into v_count from public.icp_profiles;
  if v_count <> 0 then raise exception 'FAIL: nieaktywny widzi % profili ICP', v_count; end if;
  begin
    insert into public.leads (domain) values ('nieaktywny.pl');
    raise exception 'FAIL: nieaktywny wstawił leada';
  exception when insufficient_privilege then
    raise notice 'OK: RLS blokuje nieaktywnego (select + insert)';
  end;
end $$;

-- --- Historia zmian leada ---
do $$
declare v_lead uuid; v_count int;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select id into v_lead from public.leads where domain = 'studio-przyklad.pl';
  update public.leads set status = 'zbadany', score = 80, score_rationale = 'Projekty hotelowe w PL i NO', updated_by = auth.uid() where id = v_lead;
  select count(*) into v_count from public.audit_log
  where table_name = 'leads' and record_id = v_lead and field_name in ('status', 'score', 'score_rationale')
    and changed_by = '11111111-1111-1111-1111-111111111111';
  if v_count <> 3 then raise exception 'FAIL: oczekiwano 3 wpisów historii, jest %', v_count; end if;
  raise notice 'OK: zmiany statusu/score/uzasadnienia w audit_log z autorem';
end $$;

-- --- Konwersja lead -> zapytanie ---
do $$
declare v_lead uuid; v_inq public.inquiries; v_after public.leads;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select id into v_lead from public.leads where domain = 'studio-przyklad.pl';
  update public.leads set company_name = 'Studio Przykład', need = 'Meble do 2 hoteli', country = 'Polska', updated_by = auth.uid() where id = v_lead;

  select * into v_inq from public.convert_lead_to_inquiry(v_lead);
  if v_inq.source <> 'lead' then raise exception 'FAIL: źródło zapytania = %, oczekiwano lead', v_inq.source; end if;
  if v_inq.short_description <> 'Meble do 2 hoteli' then raise exception 'FAIL: opis nie z potrzeby leada'; end if;
  if v_inq.next_step is null or v_inq.next_step_due is null then raise exception 'FAIL: zapytanie bez następnego kroku'; end if;
  if v_inq.owner_id <> '11111111-1111-1111-1111-111111111111' then raise exception 'FAIL: właściciel zapytania niepoprawny'; end if;

  select * into v_after from public.leads where id = v_lead;
  if v_after.converted_inquiry_id <> v_inq.id then raise exception 'FAIL: lead nie wskazuje zapytania'; end if;
  if v_after.status <> 'zakwalifikowany' then raise exception 'FAIL: status leada po konwersji = %', v_after.status; end if;
  if v_after.company_id is null or v_after.company_id <> v_inq.company_id then raise exception 'FAIL: firma nie utworzona/podpięta'; end if;
  if not exists (select 1 from public.companies where id = v_after.company_id and name = 'Studio Przykład' and website = 'studio-przyklad.pl') then
    raise exception 'FAIL: utworzona firma ma złe dane';
  end if;
  raise notice 'OK: konwersja tworzy firmę + zapytanie (źródło lead, następny krok) i oznacza leada';

  begin
    perform public.convert_lead_to_inquiry(v_lead);
    raise exception 'FAIL: druga konwersja tego samego leada przeszła';
  exception when raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'OK: drugiej konwersji nie da się zrobić';
  end;
end $$;

do $$
declare v_lead uuid;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  insert into public.leads (domain, contact_consent) values ('zakaz.pl', 'zakaz') returning id into v_lead;
  begin
    perform public.convert_lead_to_inquiry(v_lead);
    raise exception 'FAIL: konwersja leada z zakazem kontaktu przeszła';
  exception when raise_exception then
    if sqlerrm like 'FAIL:%' then raise; end if;
    raise notice 'OK: lead z zakazem kontaktu nie przechodzi w zapytanie';
  end;
end $$;

do $$ begin raise notice '=== TESTY FAZY 3a (leady/ICP/fakty) PRZESZŁY ==='; end $$;
