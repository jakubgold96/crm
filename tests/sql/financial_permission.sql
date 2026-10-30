-- Test SQL: mechanizm uprawnienia finansowego (profiles.can_view_financials).
--
-- UWAGA — zakres tego testu, przeczytaj przed interpretacją wyniku:
-- W Fazie 1 nie istnieje żadna kolumna finansowa (koszt/cena/marża) na
-- `inquiries` ani `companies` — dokumentacja (docs/DATA_MODEL.md) mówi
-- wprost, że te pola powstają realnie przy module Ofert. Ten test NIE
-- dowodzi, że konkretne pole finansowe jest chronione (bo takiego pola
-- jeszcze nie ma) — dowodzi, że MECHANIZM uprawnienia, na którym taka
-- ochrona ma się oprzeć (funkcja current_user_can_view_financials() +
-- polityki update na profiles.can_view_financials), działa poprawnie i nie
-- da się go obejść przez zwykłego użytkownika, zanim jakiekolwiek pole
-- finansowe powstanie.
--
-- OTWARTY PUNKT (patrz STATUS.md i checklist Fazy 1): gdy powstanie moduł
-- Ofert z realnymi polami finansowymi, trzeba dopisać analogiczny test na
-- tych polach, obejmujący odczyt przez UI/API/RPC, zapis, eksport i
-- bezpośrednie zapytanie do bazy — nie tylko samą flagę na profilu.
--
-- Uruchomienie: po migracjach + fixtures.sql, tak jak inne testy w tym katalogu.

-- --- Test: current_user_can_view_financials() = false dla użytkownika bez uprawnienia ---
do $$
declare
  v_result boolean;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true); -- sprzedaz, can_view_financials=false
  select public.current_user_can_view_financials() into v_result;
  if v_result is distinct from false then
    raise exception 'FAIL: current_user_can_view_financials() = % dla użytkownika bez uprawnienia, oczekiwano false', v_result;
  end if;
  raise notice 'OK: current_user_can_view_financials() = false dla użytkownika bez uprawnienia finansowego';
end $$;

-- --- Test: current_user_can_view_financials() = true dla administratora (zawsze, niezależnie od flagi) ---
do $$
declare
  v_result boolean;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true); -- administrator
  select public.current_user_can_view_financials() into v_result;
  if v_result is distinct from true then
    raise exception 'FAIL: current_user_can_view_financials() = % dla administratora, oczekiwano true', v_result;
  end if;
  raise notice 'OK: current_user_can_view_financials() = true dla administratora';
end $$;

-- --- Test: po nadaniu flagi przez admina, current_user_can_view_financials() = true dla tego użytkownika ---
do $$
declare
  v_result boolean;
begin
  -- Administrator nadaje uprawnienie finansowe użytkownikowi 'sprzedaz'.
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  update public.profiles set can_view_financials = true
    where id = '11111111-1111-1111-1111-111111111111';

  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  select public.current_user_can_view_financials() into v_result;
  if v_result is distinct from true then
    raise exception 'FAIL: current_user_can_view_financials() = % po nadaniu flagi przez admina, oczekiwano true', v_result;
  end if;
  raise notice 'OK: current_user_can_view_financials() = true po nadaniu flagi przez administratora';

  -- Przywróć stan do kolejnych testów.
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  update public.profiles set can_view_financials = false
    where id = '11111111-1111-1111-1111-111111111111';
end $$;

-- --- Test: zwykły użytkownik NIE może nadać sobie can_view_financials ---
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true); -- sprzedaz, bez uprawnienia
  begin
    update public.profiles set can_view_financials = true
      where id = '11111111-1111-1111-1111-111111111111';
    -- UPDATE może "się wykonać" bez błędu, ale RLS with check powinien
    -- odrzucić wiersz (0 rows affected / brak zmiany) — sprawdzamy stan.
  exception
    when others then
      raise notice 'OK: samodzielna zmiana can_view_financials odrzucona z błędem: %', sqlerrm;
  end;

  if exists (
    select 1 from public.profiles
    where id = '11111111-1111-1111-1111-111111111111' and can_view_financials = true
  ) then
    raise exception 'FAIL: zwykły użytkownik zdołał nadać sobie can_view_financials';
  end if;
  raise notice 'OK: zwykły użytkownik nie może nadać sobie uprawnienia finansowego (stan niezmieniony)';
end $$;

-- --- Test: zwykły użytkownik NIE może nadać can_view_financials innej osobie ---
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true); -- sprzedaz
  begin
    update public.profiles set can_view_financials = true
      where id = '33333333-3333-3333-3333-333333333333'; -- inny użytkownik
  exception
    when others then
      raise notice 'OK: zmiana can_view_financials innej osoby odrzucona z błędem: %', sqlerrm;
  end;

  if exists (
    select 1 from public.profiles
    where id = '33333333-3333-3333-3333-333333333333' and can_view_financials = true
  ) then
    raise exception 'FAIL: zwykły użytkownik zdołał nadać can_view_financials innej osobie';
  end if;
  raise notice 'OK: zwykły użytkownik nie może nadać uprawnienia finansowego innej osobie (stan niezmieniony)';
end $$;

-- --- Test: zwykły użytkownik NIE może nadać sobie roli 'administrator' (obejście przez zmianę roli) ---
do $$
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  begin
    update public.profiles set role = 'administrator'
      where id = '11111111-1111-1111-1111-111111111111';
  exception
    when others then
      raise notice 'OK: samodzielna zmiana role odrzucona z błędem: %', sqlerrm;
  end;

  if exists (
    select 1 from public.profiles
    where id = '11111111-1111-1111-1111-111111111111' and role = 'administrator'
  ) then
    raise exception 'FAIL: zwykły użytkownik zdołał nadać sobie rolę administrator';
  end if;
  raise notice 'OK: zwykły użytkownik nie może nadać sobie roli administrator (stan niezmieniony)';
end $$;

-- --- Test: administrator MOŻE legalnie nadać can_view_financials innej osobie ---
do $$
declare
  v_check boolean;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true); -- administrator
  update public.profiles set can_view_financials = true
    where id = '11111111-1111-1111-1111-111111111111';

  select can_view_financials into v_check
    from public.profiles where id = '11111111-1111-1111-1111-111111111111';

  if v_check is distinct from true then
    raise exception 'FAIL: administrator nie zdołał nadać can_view_financials, mimo że powinien móc';
  end if;
  raise notice 'OK: administrator legalnie nadaje can_view_financials innej osobie';

  -- Przywróć stan.
  update public.profiles set can_view_financials = false
    where id = '11111111-1111-1111-1111-111111111111';
end $$;

-- --- Test: bez sesji (brak auth.uid()) current_user_can_view_financials() = false, nie błąd ---
do $$
declare
  v_result boolean;
begin
  set local role authenticated;
  perform set_config('request.jwt.claim.sub', '', true); -- brak sesji
  select public.current_user_can_view_financials() into v_result;
  if v_result is distinct from false then
    raise exception 'FAIL: current_user_can_view_financials() = % bez sesji, oczekiwano false', v_result;
  end if;
  raise notice 'OK: current_user_can_view_financials() = false bez aktywnej sesji (brak wyjątku)';
end $$;

do $$ begin raise notice '=== TESTY MECHANIZMU UPRAWNIEŃ FINANSOWYCH PRZESZŁY (nie dotyczy jeszcze realnych pól finansowych — patrz nagłówek pliku) ==='; end $$;
