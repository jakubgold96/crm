-- Pomocniczy skrypt: insert zapytania, który JAWNIE przerywa transakcję
-- (ROLLBACK) po nadaniu numeru. Symuluje "przerwaną transakcję" — np.
-- błąd aplikacji, utratę połączenia, naruszenie innego constraintu po
-- insercie — DOKŁADNIE to, co ma potwierdzić test z punktu 10 zlecenia:
-- że przerwana transakcja NIE psuje numeracji dla pozostałych, równoległych
-- zapisów (może tylko spowodować lukę w numerach — co jest świadomie
-- zaakceptowanym zachowaniem sekwencji Postgres, patrz docs/DATA_MODEL.md).

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'user_id', true);

insert into public.inquiries (company_id, short_description, created_by)
values (:'company_id', 'Test przerwanej transakcji', :'user_id');

rollback;
