-- Test funkcji RPC create_inquiry_with_services: tworzy zapytanie z 2 usługami
-- w jednej transakcji, sprawdza czy obie tabele są spójne.
do $$
declare
  v_inquiry public.inquiries;
  v_service_count int;
  v_konsultacja_id uuid;
  v_wizualizacje_id uuid;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

  select id into v_konsultacja_id from public.service_scope_options where code = 'konsultacja_planowanie';
  select id into v_wizualizacje_id from public.service_scope_options where code = 'wizualizacje_3d';

  select * into v_inquiry from public.create_inquiry_with_services(
    p_company_id := '44444444-4444-4444-4444-444444444444',
    p_contact_id := null,
    p_inquiry_date := current_date,
    p_country := 'Norwegia',
    p_project_location := 'Oslo',
    p_short_description := 'Test RPC z usługami',
    p_object_type := 'hotel',
    p_object_type_other := null,
    p_scope_notes := null,
    p_scope_undetermined := false,
    p_source := 'email',
    p_operational_group := 'wymaga_dzialania',
    p_sales_stage := 'nowe',
    p_owner_id := '11111111-1111-1111-1111-111111111111',
    p_next_step := 'Zadzwonić',
    p_next_step_due := current_date + 3,
    p_task_status := 'otwarte',
    p_service_option_ids := array[v_konsultacja_id, v_wizualizacje_id]
  );

  if v_inquiry.number !~ '^INQ-\d{6}$' then
    raise exception 'FAIL: RPC nie nadał poprawnego numeru: %', v_inquiry.number;
  end if;

  select count(*) into v_service_count from public.inquiry_services where inquiry_id = v_inquiry.id;
  if v_service_count <> 2 then
    raise exception 'FAIL: oczekiwano 2 usług, jest %', v_service_count;
  end if;

  raise notice 'OK: RPC create_inquiry_with_services działa, numer=%, usług=%', v_inquiry.number, v_service_count;

  -- Test set_inquiry_services: zamiana usług na jedną inną.
  perform public.set_inquiry_services(v_inquiry.id, array[v_konsultacja_id]);
  select count(*) into v_service_count from public.inquiry_services where inquiry_id = v_inquiry.id;
  if v_service_count <> 1 then
    raise exception 'FAIL: po set_inquiry_services oczekiwano 1 usługi, jest %', v_service_count;
  end if;
  raise notice 'OK: set_inquiry_services poprawnie zamienia listę usług';
end $$;
