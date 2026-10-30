-- INNDES CRM — Faza 1 — migracja 7: granty tabelowe dla roli authenticated
--
-- RLS działa NA POZIOMIE WIERSZY, ale Postgres wymaga osobno grantu NA
-- POZIOMIE TABELI, inaczej rola w ogóle nie może wykonać zapytania (dostaje
-- "permission denied for table", zanim RLS zdąży cokolwiek przefiltrować).
-- Supabase nadaje takie granty domyślnie dla ról `authenticated`/`anon` przy
-- tworzeniu projektu — tu robimy to jawnie i pod kontrolą wersji, żeby
-- środowisko lokalne/CI zachowywało się identycznie jak hostowany Supabase,
-- i żeby nie polegać na niewidocznej konfiguracji panelu.
--
-- Rzeczywista kontrola dostępu i tak jest w politykach RLS (migracje 2-6):
-- te granty same w sobie NIE otwierają dostępu do danych, które polityka
-- RLS i tak odrzuci.

grant usage on schema public to authenticated;
grant select, insert, update on all tables in schema public to authenticated;
grant usage on all sequences in schema public to authenticated;

-- Wyjątek zgodny z zasadą produktu: żadna tabela biznesowa nie dostaje
-- grantu DELETE dla authenticated — usuwanie fizyczne jest wyłączone na
-- poziomie uprawnień, nie tylko polityki RLS (podwójna warstwa ochrony
-- przed "nic nie usuwamy fizycznie", CLAUDE.md zasada #3).
-- audit_log: insert/update/delete już odebrane jawnie w migracji 4.

grant select, insert on storage.objects to authenticated;

-- Przyszłe tabele (kolejne migracje) powinny powtórzyć ten wzorzec:
-- SELECT/INSERT/UPDATE dla authenticated, NIGDY DELETE, chyba że tabela
-- jest z natury efemeryczna (np. tabela łącząca jak inquiry_services, gdzie
-- usunięcie wiersza = zmiana wyboru checkboxa, nie usunięcie historii).
grant delete on public.inquiry_services to authenticated;
