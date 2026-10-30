# STATUS

## Status ogólny (przeczytaj to pierwsze)

**Faza 1 jest przyjęta przez właściciela produktu jako gotowa do przeglądu — NIE jako potwierdzona produkcyjnie.** Pełny checklist z weryfikacją każdego punktu: `docs/PHASE_1_CHECKLIST.md`. Konfiguracja od zera: `SUPABASE_SETUP.md`. Fazy 3–5 (leady, poczta, agent) **nie zostały rozpoczęte** i nie zaczynają się bez wyraźnej akceptacji właściciela produktu dla fundamentu.

Co zostało zweryfikowane realnie (nie tylko zadeklarowane) w tym środowisku: migracje SQL od zera, RLS, numeracja, archiwizacja, mechanizm uprawnień finansowych, współbieżna edycja tego samego rekordu, 50 równoległych zapisów numerów + 10 przerwanych transakcji, build/lint/Vitest. Co NIE zostało zweryfikowane end-to-end: pełny stos Supabase przez Docker, testy Playwright, realny przepływ logowania przez żywy Supabase Auth — bo to środowisko budowy nie miało Dockera. Szczegóły poniżej i w `docs/PHASE_1_CHECKLIST.md`.

## Faza 0 — plan: ZAAKCEPTOWANA

Decyzje właściciela produktu (2026-10-30):
1. Numeracja zapytań: ciągła, bez resetu rocznego, format `INQ-000001`, transakcyjna przez sekwencję Postgres (`nextval`), niezmienna po zapisie. `inquiry_date` osobnym polem.
2. Typ obiektu: zamknięta lista (enum) z opcją "Inne — doprecyzuj". Zakres usługi: multi-select z tabeli konfiguracyjnej `service_scope_options` + `scope_notes` + opcja "Nieustalone"; wymagany dopiero przy przejściu do etapu przygotowania oferty.
3. Widoczność w Fazie 1: `sprzedaz` i `realizacja` widzą wszystko (firmy/kontakty/zapytania/aktywność). Pola finansowe/marża ograniczone flagą `can_view_financials` (admin zawsze ma dostęp) — niezależną od roli. Struktura gotowa na przyszłe zawężenie widoczności rekordów bez przebudowy schematu.

Dokumentacja: `docs/PRD.md`, `docs/DATA_MODEL.md`, `docs/MIGRATIONS_BACKUP.md`, `docs/ACCEPTANCE_TESTS.md`, `docs/STACK.md`.

## Faza 1 — fundament: ZBUDOWANA, PRZETESTOWANA NA TYLE, NA ILE POZWALAŁO ŚRODOWISKO

### Ograniczenie środowiska (ważne, przeczytaj przed dalszą pracą)

To środowisko budowy **nie miało Dockera** (`docker ps` → "no such file or directory" — daemon niedostępny), więc nie dało się uruchomić `supabase start` ani pełnego stosu Supabase (Auth, Storage, PostgREST) lokalnie. Zamiast samych deklaracji, zweryfikowałem co się dało bez Dockera:

- **Migracje SQL**: zainstalowano gołego PostgreSQL 16 (`apt`, już był w obrazie), dobudowano minimalny stub schematów `auth`/`storage` (tylko tyle, ile potrzebują nasze migracje: `auth.users`, `auth.uid()`, `storage.buckets`, `storage.objects`, role `authenticated`/`anon`) i uruchomiono wszystkie 9 migracji z `supabase/migrations/` na czysto, od zera, wielokrotnie — **bez błędów**.
- **Testy SQL** (`tests/sql/`): napisane jako asercje `DO $$ ... RAISE EXCEPTION ... $$`, nie opisy — uruchomione naprawdę, exit code 0, wszystkie przechodzą. Pokrywają: numerację (format, atomowość, niezmienność), RLS (nieaktywny user, DELETE blokowany, audit_log z prawdziwym autorem), niezależność `operational_group`/`sales_stage`, funkcje RPC.
- **Test współbieżności numeracji**: 50 równoległych `INSERT` w tle (`&` + `wait` w bashu) → 50 unikalnych, rosnących numerów, zero duplikatów. To bezpośrednia odpowiedź na wymóg "unikaj luk wynikających z równoczesnego zapisu" z Twojej decyzji.
- **Next.js**: `npm run build` przechodzi czysto (wszystkie 17 tras, zero błędów TS), `npm run lint` zero błędów/ostrzeżeń, `npm run test` (Vitest) 34/34 zielone. Dodatkowo uruchomiono `npm run dev` naprawdę i sprawdzono `curl`: `/login` renderuje się poprawnie, `/zapytania` bez sesji przekierowuje na `/login` (HTTP 307) — czyli middleware/`proxy.ts` faktycznie działa, nie tylko kompiluje się.
- **Czego NIE zweryfikowano wykonaniem**: pełnego przepływu logowania przez prawdziwy Supabase Auth, zapisu/odczytu danych przez UI przeciwko żywej bazie z PostgREST, testów e2e Playwright (napisane, type-checked, ale nieuruchomione — wymagają całego stosu). To pierwsza rzecz do zrobienia po przejęciu projektu w środowisku z Dockerem: `supabase start && supabase db reset && npm run dev && npx playwright test`.

### Dodatkowe testy SQL (audyt Fazy 1, na żądanie właściciela produktu po pierwszym zgłoszeniu fazy jako gotowej)

Dopisano i realnie uruchomiono (pełny przebieg od zera, zielony — szczegóły w `tests/sql/README.md`) 4 kolejne pliki testowe:
- `tests/sql/financial_permission.sql` — mechanizm `current_user_can_view_financials()` i polityk na `profiles.can_view_financials`/`role`. **Zakres ograniczony, uzgodniony z właścicielem produktu**: w Fazie 1 nie istnieje żadna kolumna finansowa (koszt/cena/marża) na `inquiries`/`companies` — pojawi się realnie z modułem Ofert. Ten test potwierdza, że mechanizm uprawnienia działa i nie da się go obejść przez zwykłego użytkownika, **nie** że konkretne pole finansowe jest chronione. **Otwarty punkt, obowiązkowy przed uznaniem ochrony danych finansowych za zamkniętą**: dopisać analogiczny test na realnych polach finansowych przy budowie modułu Ofert, obejmujący odczyt przez UI/API/RPC, zapis, eksport i bezpośrednie zapytanie SQL.
- `tests/sql/archive_not_delete.sql` — DELETE odrzucony na `companies`/`inquiries`; archiwizacja (UPDATE, nie DELETE) trafia do `audit_log`/`activity_log`; constraint odrzuca cofnięcie archiwizacji bez wyczyszczenia powodu.
- `tests/sql/concurrent_edit.sql` — dwóch userów edytujących ten sam rekord: różne pola → obie zmiany zachowane; to samo pole → last-write-wins (brak optimistic locking w Fazie 1, świadomy projekt, nie błąd), ale obie zmiany zostają w `audit_log` — konflikt jest odtwarzalny z historii.
- `tests/sql/concurrency/run.sh` — 50 równoległych pomyślnych insertów zapytań + 10 równoległych insertów z jawnym `ROLLBACK` (przerwana transakcja), wszystkie naraz: zero duplikatów numerów, poprawny format, przerwane transakcje nie wpływają na pozostałe (mogą tylko spowodować lukę w numeracji — zaakceptowane zachowanie sekwencji Postgres, nie błąd).

Stub `auth`/`storage` jest teraz częścią repo (`tests/sql/stub/auth_storage_stub.sql`), odtwarzalny bez rekonstruowania go z komentarzy w migracjach. Pełny spis tabel/relacji/indeksów/constraintów/funkcji/triggerów/polityk RLS: nowa sekcja w `docs/DATA_MODEL.md` ("Kompletny reference Fazy 1"). Instrukcja konfiguracji od zera: `SUPABASE_SETUP.md` (nowy projekt, zmienne środowiskowe bez sekretów, pierwszy administrator, dane demo start/stop). Pełny checklist z weryfikacją 12 punktów audytu: `docs/PHASE_1_CHECKLIST.md`.

### Co zbudowano

**Baza danych** (`supabase/migrations/`, 9 plików, kolejna to `00000000000009_`):
- Enumy: `user_role`, `company_segment`, `relationship_status`, `contact_role`, `contact_consent`, `object_type`, `inquiry_source`, `operational_group`, `sales_stage`, `task_status`, `activity_type`.
- `profiles` (rozszerzenie `auth.users`, trigger auto-tworzenia przy signUp, `can_view_financials` jako osobna flaga niezależna od roli).
- `companies`, `contacts` z indeksami pod kontrolę duplikatów (trigram na nazwie, unikalny częściowy indeks na `tax_id`).
- `inquiries` — numer nadawany triggerem (`INQ-NNNNNN`, sekwencja Postgres, atomowa, niezmienna po zapisie — oba zabezpieczone twardymi `RAISE EXCEPTION` w bazie, nie tylko w UI), `object_type` enum + `object_type_other`, `scope_undetermined` + `service_scope_options`/`inquiry_services` (multi-select), `operational_group`/`sales_stage` jako w pełni niezależne kolumny.
- `inquiry_files`, `inquiry_notes` (soft-hide, nie DELETE), `activity_log`, `audit_log` (wypełniane triggerami `AFTER UPDATE`, nie kodem aplikacji — insert z klienta jawnie odebrany przez `REVOKE`).
- Storage: bucket `inquiry-files` prywatny + polityki.
- RPC: `create_inquiry_with_services`, `set_inquiry_services` — atomowe operacje wielotabelowe, `security invoker` (RLS nadal obowiązuje).
- Granty tabelowe (migracja 7): SELECT/INSERT/UPDATE dla `authenticated`, **nigdy DELETE** na tabelach biznesowych (poza efemeryczną `inquiry_services`) — druga, niezależna od RLS warstwa ochrony przed fizycznym usuwaniem.

**Aplikacja Next.js** (TypeScript, App Router, Tailwind, własne komponenty UI w palecie z briefu):
- Auth: logowanie hasłem + magic link, `proxy.ts` chroniący trasy, `requireUser()` jako druga linia obrony w layoutach.
- Layout: sidebar desktop + dolna nawigacja mobilna, pozycje poza Fazą 1 wyszarzone "wkrótce".
- Dashboard: sekcja "Dzisiaj" (po terminie/na dziś/bez ruchu), moje zadania, zapytania wymagające uwagi.
- Firmy: lista (tabela desktop / karty mobile), formularz z kontrolą duplikatów (miękkie ostrzeżenie, debounced), karta szczegółów z powiązanymi kontaktami i zapytaniami.
- Kontakty: analogicznie, plus picker firmy z wyszukiwaniem.
- Zapytania: formularz z pełnym zestawem pól (w tym multi-select zakresu usługi + walidacja wymogu ustalenia zakresu dopiero od etapu "Przygotowanie oferty"), lista z 3 widokami (Operacyjne/Sprzedaż/Moje), grupowaniem, wyszukiwaniem, filtrami, kartami mobilnymi; karta zapytania z sekcjami: Podstawowe, Następne działanie (inline edycja), Oferta (placeholder), Pliki, Aktywność (notatki + log zmian razem, chronologicznie), Historia zmian (osobna, rozwijana sekcja audytowa), Powiązane. Archiwizacja z wymaganym powodem.
- Ustawienia: profil własny, lista użytkowników (tylko admin) z edycją roli/`can_view_financials`/aktywności — nigdy fizyczne usuwanie konta.

**Testy**:
- `tests/sql/` — 3 pliki, asercje uruchamiane bezpośrednio na Postgresie, nie wymagają Next.js ani Supabase CLI (tylko stub `auth`/`storage` opisany w README).
- `tests/unit/` — 34 testy Vitest: walidacja Zod (`inquirySchema`, `companySchema`), logika wymogu zakresu usługi per etap, funkcje dat (`isOverdue`/`isDueToday`).
- `tests/e2e/` — 5 speców Playwright (auth, cykl życia zapytania, archiwizacja, walidacja zakresu, widok mobilny), napisane pod rzeczywiste etykiety UI, type-checked, nieuruchomione (brak Dockera — patrz wyżej).

### Zgodność z 20 kryteriami akceptacji MVP (`docs/ACCEPTANCE_TESTS.md`)

Zweryfikowane wykonaniem w tej sesji: #3 (numeracja, w tym współbieżność), #5 (brak fizycznego DELETE — grant + RLS), #6 (audit_log z prawdziwym autorem), #18 (RLS: nieaktywny user, DELETE, brak sesji), #20 (grep po `service_role`/kluczach w kodzie klienckim — brak trafień poza jedynym dozwolonym plikiem `lib/supabase/service.ts`, nieużywanym jeszcze nigdzie).

Zbudowane, ale niezweryfikowane end-to-end z powodu braku Dockera: #1, #2, #4, #7 (kod gotowy, testy napisane, nieuruchomione).

Poza zakresem Fazy 1 (zaplanowane na Fazy 3–5 zgodnie z briefem): #8–#17, #19 (plan backupu opisany w `docs/MIGRATIONS_BACKUP.md`, mechanizm pobierania/weryfikacji to Faza 2).

### Następny krok

1. W środowisku z Dockerem: `supabase start && supabase db reset` (zastosuje migracje + `supabase/seed.sql`), potem `npm run dev` i ręczne przejście przez UI.
2. `npx playwright test` — pierwsza rzeczywista weryfikacja e2e; spodziewaj się drobnych poprawek selektorów, nie fundamentalnych problemów.
3. **Otwarty punkt z audytu**: przy budowie modułu Ofert (pierwszy moment, gdy powstają realne pola finansowe), dopisać test RLS/RPC/UI/eksportu na tych konkretnych polach — `tests/sql/financial_permission.sql` z Fazy 1 testuje tylko mechanizm uprawnienia, nie ochronę rzeczywistych danych finansowych, bo tych danych jeszcze nie ma.
4. Po potwierdzeniu, że fundament działa end-to-end: Faza 2 (archiwum, eksport/backup, zadania, pełniejsza responsywność) zgodnie z `docs/PRD.md`.

Nie zaimplementowano: leadów, poczty, agenta — zgodnie z poleceniem, czekają na Fazy 3–5 i wyraźną akceptację właściciela produktu dla fundamentu.
