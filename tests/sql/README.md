# Testy SQL (RLS + triggery + archiwizacja + współbieżność) — jak uruchomić

Te testy sprawdzają migracje bezpośrednio na Postgresie, niezależnie od Next.js/Supabase CLI. Przydatne gdy nie ma Dockera (jak w tym środowisku deweloperskim) albo gdy chcesz szybko zweryfikować samą bazę.

## Docelowo (środowisko z Dockerem)

```bash
supabase start          # uruchamia lokalny Supabase (Postgres + Auth + Storage) w Docker
supabase db reset        # aplikuje migrations/ i seed.sql od zera
DB_URL="$(supabase status -o json | jq -r .DB_URL)"
psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/sql/fixtures.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/sql/rls_and_numbering.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/sql/rpc_inquiry_services.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/sql/financial_permission.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/sql/archive_not_delete.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f tests/sql/concurrent_edit.sql
tests/sql/concurrency/run.sh <nazwa_bazy_z_DB_URL>
```

## Bez Dockera (gołe apt-get postgresql — tak zweryfikowano Fazę 1 w tym repo)

`auth` i `storage` to schematy dostarczane przez Supabase — gdy nie masz pełnego Supabase, potrzebujesz minimalnego stuba tych schematów. Gotowy stub jest w repo: `tests/sql/stub/auth_storage_stub.sql` (tylko `auth.users`, `auth.uid()` symulowane przez zmienną sesji, `storage.buckets`/`storage.objects`, role `authenticated`/`anon` — **to nie jest produkcyjny Supabase**, tylko minimum do odpalenia naszych migracji).

```bash
createdb inndes_test
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/stub/auth_storage_stub.sql
for f in supabase/migrations/*.sql; do
  psql -d inndes_test -v ON_ERROR_STOP=1 -f "$f"
done
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/fixtures.sql
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/rls_and_numbering.sql
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/rpc_inquiry_services.sql
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/financial_permission.sql
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/archive_not_delete.sql
psql -d inndes_test -v ON_ERROR_STOP=1 -f tests/sql/concurrent_edit.sql
tests/sql/concurrency/run.sh inndes_test
```

Sukces = na końcu każdego pliku `.sql` komunikat `NOTICE: === ... PRZESZŁY ===` i exit code 0. Dowolny `FAIL:` w komunikacie oznacza niepowodzenie asercji i niezerowy exit code (dzięki `ON_ERROR_STOP=1`). `concurrency/run.sh` kończy się własnym `FAIL:`/`exit 1` przy niepowodzeniu i `=== WSZYSTKIE TESTY WSPÓŁBIEŻNOŚCI ... PRZESZŁY ===` przy sukcesie.

## Co pokrywa który plik

| Plik | Co sprawdza |
|---|---|
| `rls_and_numbering.sql` | Numeracja (`INQ-NNNNNN`, auto-nadawanie, niezmienność po UPDATE, odrzucenie ręcznego numeru); nieaktywny użytkownik nie widzi zapytań; DELETE odrzucony; `audit_log.changed_by` = prawdziwy `auth.uid()`; niezależność `operational_group`/`sales_stage`. |
| `rpc_inquiry_services.sql` | `create_inquiry_with_services` (atomowy insert zapytania + usług) i `set_inquiry_services` (zamiana listy usług). |
| `financial_permission.sql` | Mechanizm `current_user_can_view_financials()` i polityk na `profiles.can_view_financials`/`role`: zwykły user nie może nadać uprawnienia finansowego sobie ani innym, nie może nadać sobie roli administratora, administrator może legalnie nadać uprawnienie. **Nie dotyczy jeszcze realnych pól finansowych — patrz nagłówek pliku i otwarty punkt w `STATUS.md`.** |
| `archive_not_delete.sql` | DELETE na `companies`/`inquiries` odrzucony; archiwizacja = UPDATE `is_archived`/`archived_reason`/`archived_at`, rekord fizycznie zostaje, trafia do `audit_log`/`activity_log`; constraint odrzuca "cofnięcie" archiwizacji bez wyczyszczenia powodu. |
| `concurrent_edit.sql` | Dwóch użytkowników edytuje ten sam rekord: różne pola → obie zmiany zachowane; to samo pole → last-write-wins (brak optimistic locking w Fazie 1, udokumentowane jako świadome zachowanie), ale OBIE zmiany (w tym "przegrana") zostają w `audit_log` — nic nie ginie bez śladu. |
| `concurrency/run.sh` + `concurrency/insert_one*.sql` | 50 równoległych pomyślnych insertów zapytań + 10 równoległych insertów z jawnym `ROLLBACK` (przerwana transakcja), wszystkie naraz. Dowodzi: zero duplikatów numerów, poprawny format, przerwane transakcje nie wpływają na pozostałe (mogą tylko spowodować lukę w numeracji — zaakceptowane zachowanie sekwencji). |
| `fixtures.sql` | Dane wejściowe dla wszystkich powyższych (3 użytkowników, 1 firma). Uruchom raz, przed pierwszym testem. |
| `stub/auth_storage_stub.sql` | Minimalny stub `auth`/`storage` do testowania bez Dockera. Narzędzie testowe, nie część produktu — w środowisku z Dockerem użyj `supabase start` zamiast tego pliku. |

## Rozdzielenie poziomów testów w tym repo (żeby nie było niejasności co było realnie uruchomione)

1. **Testy SQL w tym katalogu** — uruchamiane naprawdę, na żywym Postgresie (lokalnie: gołym apt-get postgresql + stub, lub docelowo: `supabase start`). Wynik = rzeczywisty exit code i NOTICE z bazy, nie deklaracja.
2. **Testy Vitest** (`tests/unit/`) — uruchamiane naprawdę przez `npm run test`, nie wymagają żadnej bazy danych (czysta logika/walidacja w TypeScript).
3. **Build i lint** (`npm run build`, `npm run lint`) — uruchamiane naprawdę, weryfikują że aplikacja się kompiluje i nie ma błędów statycznych.
4. **Testy e2e Playwright** (`tests/e2e/`) — **napisane i type-checked, ale NIE uruchomione** w tym repo, bo wymagają żywego Supabase (Docker), którego nie ma w środowisku, w którym budowana była Faza 1. Patrz `tests/e2e/README.md` po szczegóły i co zrobić, żeby je uruchomić.

Żaden z powyższych poziomów nie zastępuje innego — build przechodzący nie znaczy, że RLS działa; testy SQL przechodzące nie znaczą, że UI działa; to są niezależne, uzupełniające się dowody.
