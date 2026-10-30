-- INNDES CRM — Faza 1 — migracja 8: funkcje RPC dla zapytań
--
-- Zapis zapytania + wybranych usług (inquiry_services) musi być atomowy —
-- inaczej przy błędzie w połowie insertu moglibyśmy zostać z zapytaniem bez
-- żadnej usługi mimo że użytkownik je wybrał. Supabase JS po stronie klienta
-- nie oferuje wielotabelowych transakcji, więc owijamy to w funkcję
-- SECURITY INVOKER (działa z uprawnieniami wywołującego, czyli RLS nadal
-- obowiązuje — to NIE jest ominięcie RLS, tylko atomowość operacji).

create function public.create_inquiry_with_services(
  p_company_id uuid,
  p_contact_id uuid,
  p_inquiry_date date,
  p_country text,
  p_project_location text,
  p_short_description text,
  p_object_type object_type,
  p_object_type_other text,
  p_scope_notes text,
  p_scope_undetermined boolean,
  p_source inquiry_source,
  p_operational_group operational_group,
  p_sales_stage sales_stage,
  p_owner_id uuid,
  p_next_step text,
  p_next_step_due date,
  p_task_status task_status,
  p_service_option_ids uuid[]
)
returns public.inquiries
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_inquiry public.inquiries;
  v_service_id uuid;
begin
  insert into public.inquiries (
    company_id, contact_id, inquiry_date, country, project_location,
    short_description, object_type, object_type_other, scope_notes,
    scope_undetermined, source, operational_group, sales_stage, owner_id,
    next_step, next_step_due, task_status, created_by, updated_by
  ) values (
    p_company_id, p_contact_id, p_inquiry_date, p_country, p_project_location,
    p_short_description, p_object_type, p_object_type_other, p_scope_notes,
    p_scope_undetermined, p_source, p_operational_group, p_sales_stage, p_owner_id,
    p_next_step, p_next_step_due, p_task_status, auth.uid(), auth.uid()
  )
  returning * into v_inquiry;

  if p_service_option_ids is not null then
    foreach v_service_id in array p_service_option_ids loop
      insert into public.inquiry_services (inquiry_id, service_option_id)
      values (v_inquiry.id, v_service_id);
    end loop;
  end if;

  return v_inquiry;
end;
$$;

comment on function public.create_inquiry_with_services is
  'Tworzy zapytanie razem z wybranymi usługami (inquiry_services) w jednej '
  'transakcji. SECURITY INVOKER: RLS i tak obowiązuje, to tylko atomowość.';

-- Analogicznie dla aktualizacji listy usług przy edycji (replace całości,
-- prostsze niż diff — liczba usług jest mała, max ~13).
create function public.set_inquiry_services(
  p_inquiry_id uuid,
  p_service_option_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_service_id uuid;
begin
  delete from public.inquiry_services where inquiry_id = p_inquiry_id;
  if p_service_option_ids is not null then
    foreach v_service_id in array p_service_option_ids loop
      insert into public.inquiry_services (inquiry_id, service_option_id)
      values (p_inquiry_id, v_service_id);
    end loop;
  end if;
end;
$$;

grant execute on function public.create_inquiry_with_services to authenticated;
grant execute on function public.set_inquiry_services to authenticated;
