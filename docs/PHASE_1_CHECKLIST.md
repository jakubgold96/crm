# Checklist Fazy 1 — INNDES CRM

**Status: Faza 1 gotowa do przeglądu właściciela produktu. NIE jest to potwierdzenie produkcyjne.** Pełne end-to-end uruchomienie (żywy Supabase przez Docker + testy Playwright) nie zostało wykonane w środowisku, w którym budowana była ta faza — patrz pkt 11 i `STATUS.md`. Żadna z poniższych pozycji nie oznacza "gotowe do wdrożenia na produkcję" — oznacza "zbudowane i zweryfikowane na dostępnym poziomie, z jasno nazwanym pozostałym ryzykiem".

Faza 3–5 (leady, poczta, agent) — **nie rozpoczęte**, zgodnie z zasadą fazowania z `CLAUDE.md`.

---

## 1. Kompletne migracje SQL możliwe do uruchomienia na pustym projekcie Supabase

**Status: ZWERYFIKOWANE.**

- 8 plików w `supabase/migrations/00000000000001_...` do `...008_...`, numerowane sekwencyjnie, forward-only.
- Uruchomione od zera, wielokrotnie w tej sesji, na czystej bazie Postgres 16 ze stubem `auth`/`storage` (`tests/sql/stub/auth_storage_stub.sql`) — zero błędów.
- Nie uruchomione przez `supabase start`/`supabase db reset` na realnym Supabase (brak Dockera w tym środowisku) — ale migracje nie zawierają niczego specyficznego dla stubu; stub tylko dostarcza minimalne `auth.users`/`auth.uid()`/`storage.*`, których realny Supabase ma pełną wersję. Pierwsza rzecz do zrobienia przy przejęciu projektu z Dockerem: `supabase start && supabase db reset`, żeby potwierdzić to na docelowym stosie.
- Instrukcja: `SUPABASE_SETUP.md`, sekcja 2–3.

## 2. `SUPABASE_SETUP.md` z instrukcją konfiguracji

**Status: GOTOWE.** Nowy plik w korzeniu repo. Obejmuje: nowy projekt (lokalnie i hostowany), zastosowanie migracji, zmienne środowiskowe, pierwszego administratora, dane demo (uruchomienie i usunięcie), checklistę weryfikacji po konfiguracji.

## 3. Opis wszystkich tabel, relacji, indeksów, constraintów, funkcji RPC, triggerów i polityk RLS

**Status: GOTOWE.** `docs/DATA_MODEL.md`, nowa sekcja "Kompletny reference Fazy 1" na końcu pliku — tabelaryczny spis: 10 tabel z PK/FK, 3 constrainty CHECK, wszystkie indeksy, sekwencja numeracji, 13 funkcji (triggery + RPC + helpery), triggery per tabela, polityki RLS per tabela w rozbiciu SELECT/INSERT/UPDATE/DELETE, granty tabelowe. Zweryfikowane przez odczytanie każdej migracji w tej sesji i porównanie z opisem — kompletne, zgodne z kodem.

## 4. Instrukcja utworzenia pierwszego administratora

**Status: GOTOWE.** `SUPABASE_SETUP.md`, sekcja 5. Krok po kroku: rejestracja pierwszego konta → znalezienie jego `id` → jedno `UPDATE public.profiles SET role='administrator', can_view_financials=true WHERE id=...` wykonane bezpośrednio w bazie (jedyny moment, bo UI do nadawania ról wymaga już zalogowanego administratora) → dalsze zarządzanie przez UI. Potwierdzone testem, że zwykły user nie może zrobić tego sam (`tests/sql/financial_permission.sql`).

## 5. Instrukcja konfiguracji zmiennych środowiskowych bez ujawniania sekretów

**Status: GOTOWE.** `SUPABASE_SETUP.md`, sekcja 4 — tabela 3 zmiennych (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) z opisem gdzie żyją, skąd je wziąć, co jest publiczne a co prawdziwym sekretem. `.env.local.example` w repo zawiera tylko placeholdery (`replace-with-local-...`), `.gitignore` wyklucza wszystkie `.env*`. Zweryfikowano w tej sesji: `.env.local` w repo też zawiera tylko placeholdery, nie realne klucze. Dodana komenda `grep` do samodzielnej weryfikacji, że `SERVICE_ROLE` nie wyciekł do kodu klienckiego.

## 6. Procedura uruchomienia danych demo i ich późniejszego usunięcia

**Status: GOTOWE.** `SUPABASE_SETUP.md`, sekcja 6. Uruchomienie: `supabase db reset` (automatycznie) albo ręczne `psql -f supabase/seed.sql`. Usunięcie: SQL celowany po rozpoznawalnym prefiksie UUID danych demo (`00000000-0000-0000-0000-0000001...`), w kolejności zależności FK (`inquiry_services` → `activity_log`/`audit_log` → `inquiries` → `contacts` → `companies`). Zaznaczone jako jedyny uzasadniony przypadek fizycznego DELETE w projekcie (dane testowe, nie biznesowe).

## 7. Test: zwykły użytkownik nie może odczytać ani zmienić pól finansowych

**Status: CZĘŚCIOWO ZWERYFIKOWANE — jawnie ograniczony zakres, zgodnie z decyzją właściciela produktu.**

W Fazie 1 nie istnieje żadna kolumna finansowa na `inquiries`/`companies` (dokumentowane od początku w `docs/DATA_MODEL.md` — pola finansowe przychodzą realnie z modułem Ofert). Właściciel produktu potwierdził: nie dodawać żadnego placeholdera finansowego w Fazie 1, przetestować wyłącznie mechanizm uprawnienia.

`tests/sql/financial_permission.sql`, uruchomiony realnie, wszystkie asercje przeszły:
- `current_user_can_view_financials() = false` dla usera bez uprawnienia;
- `= true` dla administratora (zawsze, niezależnie od flagi);
- `= true` po nadaniu flagi przez admina;
- zwykły user **nie może** nadać uprawnienia finansowego sobie;
- zwykły user **nie może** nadać go innej osobie;
- zwykły user **nie może** nadać sobie roli `administrator` (obejście przez zmianę roli);
- administrator **może** legalnie nadać uprawnienie;
- `= false` (nie błąd) bez aktywnej sesji.

**OTWARTY PUNKT, obowiązkowy przed uznaniem tego kryterium za w pełni zamknięte:** gdy powstanie moduł Ofert z realnymi polami finansowymi (koszt, cena, marża), trzeba dopisać analogiczny test na tych konkretnych polach, obejmujący: odczyt przez UI, odczyt przez API/RPC, zapis, eksport (CSV/PDF oferty) i bezpośrednie zapytanie SQL jako zwykły użytkownik. Ten test SQL z Fazy 1 potwierdza tylko, że mechanizm, na którym ta ochrona będzie oparta, działa poprawnie — nie że konkretne dane są chronione, bo tych danych jeszcze nie ma.

## 8. Test archiwizacji zamiast fizycznego usuwania

**Status: ZWERYFIKOWANE.** `tests/sql/archive_not_delete.sql`, uruchomiony realnie:
- DELETE na `companies` i `inquiries` odrzucony (permission denied — brak grantu, nie tylko RLS);
- archiwizacja firmy: `UPDATE is_archived=true`, rekord fizycznie zostaje, zmiana trafia do `audit_log`;
- archiwizacja zapytania z powodem: rekord zostaje, `number` niezmieniony, zmiana + powód trafiają do `audit_log` i `activity_log`;
- constraint `archived_reason_requires_flag` odrzuca próbę "cofnięcia" archiwizacji bez wyczyszczenia `archived_reason`/`archived_at`.

## 9. Test dwóch użytkowników edytujących ten sam rekord

**Status: ZWERYFIKOWANE, z jasno nazwanym ograniczeniem architektury.** `tests/sql/concurrent_edit.sql`, uruchomiony realnie:
- edycja **różnych pól** tego samego zapytania przez dwóch userów naraz → obie zmiany zachowane, `audit_log` zawiera oba wpisy z poprawnymi autorami;
- edycja **tego samego pola** naraz → Faza 1 nie ma optimistic locking, więc wygrywa ostatni zapis (last-write-wins) — to jest świadome, udokumentowane zachowanie, nie błąd; **ale** obie zmiany, w tym "przegrana", zostają w `audit_log` z właściwymi autorami — konflikt jest w każdej chwili odtwarzalny z historii, nic nie ginie bez śladu.
- **Otwarty punkt (nie blokujący, do rozważenia poza Fazą 1):** jeśli produkt zdecyduje, że potrzebne jest ostrzeżenie w UI "ktoś inny zmienił ten rekord" (optimistic locking po `updated_at`), to zmiana aplikacyjna + nowy test na przyszłość.

## 10. Test 50 równoczesnych zapisów numerów zapytań, w tym przypadek przerwanych transakcji

**Status: ZWERYFIKOWANE.** `tests/sql/concurrency/run.sh` (+ `insert_one.sql`, `insert_one_rollback.sql`), uruchomiony realnie w tej sesji: **50 równoległych pomyślnych insertów + 10 równoległych insertów z jawnym `ROLLBACK`** (symulacja przerwanej transakcji), wszystkie odpalone naraz w tle.

Wynik:
- 50 nowych wierszy (dokładnie tyle, ile pomyślnych insertów — przerwane transakcje nie wpłynęły na inne);
- zero zduplikowanych numerów;
- wszystkie numery pasują do formatu `INQ-NNNNNN`;
- żadna z 10 przerwanych transakcji nie zostawiła wiersza w bazie (ROLLBACK działa poprawnie);
- sekwencja numeracji ma luki tam, gdzie ROLLBACK "skonsumował" wartość przed wycofaniem — to jest świadomie zaakceptowane zachowanie (`nextval()` nie cofa się przy ROLLBACK, bo sekwencje nie są objęte MVCC), **nie błąd**: wymóg właściciela produktu to "unikaj luk z równoczesnego zapisu" (co jest spełnione — zero duplikatów, zero luk z samej współbieżności), nie "zero luk w ogóle" (luka po przerwanej transakcji jest nieunikniona bez blokady, która zepsułaby współbieżność).

## 11. Jasne rozdzielenie testów (SQL / Vitest / build / Playwright)

**Status: GOTOWE.** `tests/sql/README.md`, nowa sekcja "Rozdzielenie poziomów testów" — cztery poziomy nazwane wprost, z jasnym zaznaczeniem, które są realnie uruchomione (SQL, Vitest, build/lint) a które napisane-ale-nieuruchomione (Playwright e2e, bo wymaga Dockera, którego nie ma w tym środowisku). To samo rozdzielenie powtórzone w `STATUS.md`.

## 12. Aktualny `STATUS.md` bez określania aplikacji jako production-ready

**Status: GOTOWE.** `STATUS.md` zaktualizowany — nowa sekcja na samym początku "Status ogólny" stwierdzająca explicite: Faza 1 gotowa do przeglądu, NIE potwierdzona produkcyjnie, Fazy 3–5 nie rozpoczęte. Żadne miejsce w `STATUS.md` nie używa słowa "production-ready" ani równoważnego stwierdzenia.

---

## Podsumowanie

| # | Punkt | Status |
|---|---|---|
| 1 | Migracje na pustym projekcie | ✅ zweryfikowane (bez Dockera; z Dockerem — pierwszy krok do powtórzenia) |
| 2 | `SUPABASE_SETUP.md` | ✅ gotowe |
| 3 | Opis tabel/relacji/indeksów/constraintów/RPC/triggerów/RLS | ✅ gotowe |
| 4 | Instrukcja pierwszego administratora | ✅ gotowe |
| 5 | Zmienne środowiskowe bez sekretów | ✅ gotowe |
| 6 | Dane demo — start/stop | ✅ gotowe |
| 7 | Test pól finansowych | ⚠️ mechanizm zweryfikowany, realne pola — otwarty punkt do modułu Ofert (decyzja właściciela produktu) |
| 8 | Test archiwizacji | ✅ zweryfikowane |
| 9 | Test dwóch userów na jednym rekordzie | ✅ zweryfikowane (last-write-wins jest świadomym projektem, nie błędem) |
| 10 | Test 50 współbieżnych zapisów + przerwane transakcje | ✅ zweryfikowane |
| 11 | Rozdzielenie poziomów testów | ✅ gotowe |
| 12 | `STATUS.md` bez "production-ready" | ✅ gotowe |

**Nie zmieniono zakresu funkcjonalnego.** Nie dodano leadów, poczty, agenta. Jedyne nowe pliki: dokumentacja (`SUPABASE_SETUP.md`, ten checklist, rozszerzenia `DATA_MODEL.md`/`STATUS.md`/`tests/sql/README.md`) i testy (4 nowe pliki SQL + stub + skrypt współbieżności) — zero zmian w `app/`, `components/`, `lib/`, migracjach.
