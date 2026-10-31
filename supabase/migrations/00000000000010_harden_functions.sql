-- INNDES CRM — migracja 10: utwardzenie funkcji (Supabase security advisor)
--
-- 1) search_path ustalony w każdej funkcji (lint 0011) — bez tego funkcja
--    mogłaby rozwiązać nazwę tabeli przez schemat podstawiony w sesji.
-- 2) Funkcje triggerów nie są do wywoływania przez REST (/rpc/...). Postgres
--    nie sprawdza EXECUTE przy odpalaniu triggera, więc odebranie EXECUTE
--    niczego nie psuje, a zamyka ścieżkę wywołania z zewnątrz (lint 0028/0029).
-- 3) Funkcje pomocnicze RLS (is_active_user, current_user_role,
--    current_user_can_view_financials) są potrzebne tylko zalogowanym —
--    wszystkie polityki są "to authenticated". Odbieramy je anon/public.

alter function public.set_updated_at() set search_path = public;
alter function public.set_inquiry_number() set search_path = public;
alter function public.prevent_inquiry_number_update() set search_path = public;
alter function public.lead_facts_only_hide() set search_path = public;

revoke execute on function public.audit_companies() from public, anon, authenticated;
revoke execute on function public.audit_contacts() from public, anon, authenticated;
revoke execute on function public.audit_inquiries() from public, anon, authenticated;
revoke execute on function public.audit_leads() from public, anon, authenticated;
revoke execute on function public.log_note_activity() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.set_inquiry_number() from public, anon, authenticated;
revoke execute on function public.prevent_inquiry_number_update() from public, anon, authenticated;
revoke execute on function public.lead_facts_only_hide() from public, anon, authenticated;

revoke execute on function public.is_active_user() from public, anon;
revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.current_user_can_view_financials() from public, anon;
grant execute on function public.is_active_user() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_can_view_financials() to authenticated;

-- RPC biznesowe: tylko zalogowani (RLS i tak obowiązuje — security invoker).
revoke execute on function public.convert_lead_to_inquiry(uuid) from public, anon;
grant execute on function public.convert_lead_to_inquiry(uuid) to authenticated;
revoke execute on function public.create_inquiry_with_services from public, anon;
revoke execute on function public.set_inquiry_services from public, anon;
