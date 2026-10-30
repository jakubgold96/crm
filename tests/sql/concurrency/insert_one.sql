-- Pomocniczy skrypt dla testu współbieżności (tests/sql/concurrency/run.sh).
-- Jeden proces psql = jeden insert zapytania jako dany użytkownik.
-- Zmienne podawane przez psql -v: user_id (uuid sesji), company_id.

set local role authenticated;
select set_config('request.jwt.claim.sub', :'user_id', true);

insert into public.inquiries (company_id, short_description, created_by)
values (:'company_id', 'Test współbieżności numeracji', :'user_id');
