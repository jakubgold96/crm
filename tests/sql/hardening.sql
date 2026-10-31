-- Migracja 10: funkcje triggerów i pomocnicze RLS niedostępne z zewnątrz.
do $$
declare v_fn text;
begin
  foreach v_fn in array array['audit_leads()', 'audit_inquiries()', 'handle_new_user()', 'set_updated_at()', 'lead_facts_only_hide()'] loop
    if has_function_privilege('authenticated', 'public.' || v_fn, 'execute') then
      raise exception 'FAIL: authenticated może wywołać funkcję triggera %', v_fn;
    end if;
    if has_function_privilege('anon', 'public.' || v_fn, 'execute') then
      raise exception 'FAIL: anon może wywołać funkcję triggera %', v_fn;
    end if;
  end loop;
  raise notice 'OK: funkcje triggerów niewywoływalne przez REST';

  if has_function_privilege('anon', 'public.is_active_user()', 'execute') then
    raise exception 'FAIL: anon może wywołać is_active_user()';
  end if;
  if not has_function_privilege('authenticated', 'public.is_active_user()', 'execute') then
    raise exception 'FAIL: authenticated stracił is_active_user() — RLS by nie działało';
  end if;
  if has_function_privilege('anon', 'public.convert_lead_to_inquiry(uuid)', 'execute') then
    raise exception 'FAIL: anon może wywołać convert_lead_to_inquiry';
  end if;
  raise notice 'OK: pomocnicze RLS i RPC tylko dla zalogowanych';

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname in ('set_updated_at', 'set_inquiry_number', 'prevent_inquiry_number_update', 'lead_facts_only_hide')
      and (p.proconfig is null or not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))
  ) then
    raise exception 'FAIL: funkcja bez ustalonego search_path';
  end if;
  raise notice 'OK: search_path ustalony';
end $$;

do $$ begin raise notice '=== TESTY UTWARDZENIA FUNKCJI PRZESZŁY ==='; end $$;

-- Migracja 11: żadnych DELETE/TRUNCATE dla zalogowanych, zero dostępu anon.
do $$
declare t text;
begin
  foreach t in array array['profiles','companies','contacts','inquiries','inquiry_notes','inquiry_files','activity_log','audit_log','icp_profiles','leads','lead_facts'] loop
    if has_table_privilege('authenticated', 'public.' || t, 'delete') then raise exception 'FAIL: authenticated ma DELETE na %', t; end if;
    if has_table_privilege('authenticated', 'public.' || t, 'truncate') then raise exception 'FAIL: authenticated ma TRUNCATE na %', t; end if;
    if has_table_privilege('anon', 'public.' || t, 'select') or has_table_privilege('anon', 'public.' || t, 'insert') then
      raise exception 'FAIL: anon ma dostęp do %', t;
    end if;
  end loop;
  if not has_table_privilege('authenticated', 'public.inquiry_services', 'delete') then
    raise exception 'FAIL: inquiry_services straciło DELETE (zmiana wyboru usług by nie działała)';
  end if;
  raise notice 'OK: brak DELETE/TRUNCATE dla zalogowanych, brak dostępu anon (wyjątek inquiry_services DELETE)';
end $$;

do $$ begin raise notice '=== TESTY UPRAWNIEŃ TABEL PRZESZŁY ==='; end $$;
