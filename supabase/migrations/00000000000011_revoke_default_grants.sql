-- INNDES CRM — migracja 11: odebranie domyślnych uprawnień Supabase
--
-- Wykryte na hostowanym "CRM Test" (2026-10-31): Supabase nadaje każdej nowej
-- tabeli w schemacie public pełne uprawnienia rolom anon i authenticated
-- (w tym DELETE i TRUNCATE — TRUNCATE omija RLS). Migracja 7 tylko DODAWAŁA
-- granty, więc "druga warstwa" ochrony przed fizycznym usuwaniem (CLAUDE.md
-- #3) działała lokalnie, ale nie na hostingu. Tu ją faktycznie zakładamy:
--   - anon: zero dostępu do tabel biznesowych (wszystkie polityki są "to authenticated")
--   - authenticated: nigdy DELETE ani TRUNCATE (wyjątek: inquiry_services DELETE,
--     tabela łącząca — patrz migracja 7)
--   - to samo dla tabel tworzonych w przyszłości (default privileges).

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'companies', 'contacts', 'service_scope_options', 'inquiries', 'inquiry_services',
    'inquiry_files', 'inquiry_notes', 'activity_log', 'audit_log', 'icp_profiles', 'leads', 'lead_facts'
  ] loop
    execute format('revoke all on table public.%I from anon', t);
    execute format('revoke delete, truncate, references, trigger on table public.%I from authenticated', t);
  end loop;
end $$;

grant delete on public.inquiry_services to authenticated;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke delete, truncate, references, trigger on tables from authenticated;
alter default privileges in schema public revoke execute on functions from anon;
