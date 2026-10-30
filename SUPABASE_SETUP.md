# Konfiguracja Supabase — INNDES CRM (Faza 1)

Ten dokument opisuje, jak postawić projekt od zera: pustego projektu Supabase, przez migracje, pierwszego administratora, zmienne środowiskowe, aż po (opcjonalne) dane demo. Nie zawiera żadnych realnych sekretów — wszystkie wartości poniżej to placeholdery, które zastępujesz własnymi z panelu Supabase lub `supabase status`.

## 1. Wymagania

- Konto Supabase (dla środowiska `staging`/`production`) lub Docker (dla `local`).
- Node.js 20+, npm.
- Supabase CLI (`npm install supabase --save-dev` już jest w `devDependencies`, albo globalnie — patrz [docs.supabase.com/guides/cli](https://supabase.com/docs/guides/cli)).

## 2. Nowy projekt Supabase

### Lokalnie (dev, wymaga Dockera)

```bash
npx supabase init     # tylko jeśli supabase/ jeszcze nie istnieje — w tym repo już istnieje, pomiń
npx supabase start
```

`supabase start` wypisze lokalne URL i klucze (`anon key`, `service_role key`) — to wartości do `.env.local` (patrz sekcja 4). Nie są to sekrety produkcyjne, tylko lokalne dla Dockera na Twojej maszynie.

### Na hostowanym Supabase (staging/produkcja)

1. Załóż nowy projekt na [supabase.com](https://supabase.com) (region blisko klientów INNDES — np. Europa).
2. W **Project Settings → API** skopiuj `Project URL` i `anon public key` — idą do `.env.local`/zmiennych środowiskowych hostingu (nigdy do repo).
3. `service_role key` z tego samego miejsca — używany **wyłącznie** server-side (patrz sekcja 4, `lib/supabase/service.ts`), nigdy w kodzie klienckim, nigdy w pliku śledzonym przez git.

## 3. Zastosowanie migracji

Migracje są w `supabase/migrations/`, numerowane sekwencyjnie (`00000000000001_...` do `00000000000008_...`), forward-only — nigdy ręczna zmiana schematu przez panel Supabase bez migracji (patrz `CLAUDE.md` i `docs/MIGRATIONS_BACKUP.md`).

```bash
# Lokalnie — aplikuje wszystkie migracje od zera + supabase/seed.sql:
npx supabase db reset

# Na projekcie hostowanym — podłącz CLI do projektu, potem wypchnij migracje:
npx supabase link --project-ref <twój-project-ref>
npx supabase db push
```

`supabase db push` aplikuje tylko migracje, których projekt jeszcze nie ma — bezpieczne do powtarzania.

Weryfikacja, że migracje się zastosowały bez błędu, jest też możliwa niezależnie od `supabase db reset`, bezpośrednio na Postgresie — patrz `tests/sql/README.md`, jeśli chcesz sprawdzić migracje na gołym Postgresie bez całego stosu Supabase (np. w CI bez Dockera).

## 4. Zmienne środowiskowe (bez ujawniania sekretów)

Skopiuj szablon i wypełnij własnymi wartościami — **nigdy nie commituj wypełnionego pliku** (`.gitignore` już wyklucza wszystkie `.env*`):

```bash
cp .env.local.example .env.local
```

| Zmienna | Gdzie żyje | Skąd ją wziąć | Uwagi |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | klient + serwer | `supabase status` (lokalnie) lub Project Settings → API (hostowany) | Publiczny URL projektu, bezpieczny do ujawnienia (prefiks `NEXT_PUBLIC_` = trafia do bundla przeglądarki). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | klient + serwer | tamże, pole `anon public key` | Publiczny klucz — bezpieczeństwo zapewnia RLS w bazie, nie tajność tego klucza. Mimo to nie wklejaj go do publicznych repo bez potrzeby. |
| `SUPABASE_SERVICE_ROLE_KEY` | **tylko** `lib/supabase/service.ts`, server-side | tamże, pole `service_role key` | **Prawdziwy sekret — omija RLS całkowicie.** Nigdy w kodzie z prefiksem `NEXT_PUBLIC_`, nigdy importowany z komponentu klienckiego, nigdy w repo. W środowisku hostingowym (Vercel itp.) ustaw go jako zmienną środowiskową serwera, nie w pliku. |

Jak sprawdzić, że żaden sekret nie wyciekł do kodu klienckiego (powtórz po każdej większej zmianie):

```bash
grep -rn "SERVICE_ROLE" --include="*.tsx" --include="*.ts" app/ components/ | grep -v "lib/supabase/service.ts"
```

Brak wyniku = OK. Jedyne dozwolone miejsce to `lib/supabase/service.ts` (patrz komentarz w tym pliku — dokumentuje, że w Fazie 1 nie jest jeszcze nigdzie importowany).

### Zmienne na środowisku produkcyjnym (hosting)

Ustaw te trzy zmienne w panelu hostingu (np. Vercel → Project Settings → Environment Variables), rozdzielając `Production`/`Preview`/`Development`, jeśli hosting to rozróżnia. Nie trzymaj żadnej z nich w `vercel.json` / plikach konfiguracyjnych repo.

## 5. Pierwszy administrator

Trigger `handle_new_user` (migracja 2) automatycznie tworzy profil z rolą `sprzedaz` przy każdej rejestracji — **żadne konto nie jest administratorem domyślnie**, administrator musi zostać nadany ręcznie raz, dla pierwszego konta.

1. Zarejestruj pierwsze konto normalną ścieżką — przez `/login` w aplikacji (magic link albo hasło, zależnie od konfiguracji Supabase Auth) albo przez Supabase Studio (**Authentication → Users → Add user**).
2. Znajdź `id` tego użytkownika (Supabase Studio → Authentication → Users, albo `select id, email from auth.users;` w SQL editorze).
3. Nadaj rolę administratora **bezpośrednio w bazie** (jedyny moment, w którym robimy to przez SQL, nie przez UI aplikacji — UI do zarządzania rolami wymaga już zalogowanego administratora, więc pierwszy musi powstać inaczej):

```sql
update public.profiles
set role = 'administrator', can_view_financials = true
where id = '<uuid-z-auth.users>';
```

4. Od tego momentu dalszych administratorów i uprawnienia finansowe nadaje się normalnie przez UI (`/ustawienia/uzytkownicy`), zalogowany jako ten pierwszy administrator — nie trzeba już wracać do SQL.

To zachowanie jest przetestowane: `tests/sql/financial_permission.sql` potwierdza, że zwykły użytkownik nie może nadać sobie roli `administrator` ani `can_view_financials` sam — musi to zrobić administrator (albo, dla pierwszego konta, operator bazy raz, jak wyżej).

## 6. Dane demonstracyjne — uruchomienie i usunięcie

`supabase/seed.sql` zawiera dane demo (3 firmy, 3 kontakty, 3 zapytania) — **wyłącznie do środowiska lokalnego/dev**, nigdy do produkcji. Komentarz na początku pliku to podkreśla.

### Uruchomienie

```bash
npx supabase db reset    # aplikuje migracje + seed.sql automatycznie, od zera
```

Albo, jeśli baza już istnieje i tylko chcesz dodać dane demo bez resetu:

```bash
psql "$(npx supabase status -o json | jq -r .DB_URL)" -f supabase/seed.sql
```

Konta użytkowników (`auth.users`) **nie są** tworzone przez `seed.sql` — Supabase lokalnie wymaga rejestracji przez Auth API, nie bezpiecznego wstawienia hasła z pliku. Załóż konta testowe przez `/login` (patrz też `tests/e2e/README.md` po przykładowe adresy używane w testach e2e).

### Usunięcie danych demo

Dane demo mają stałe, rozpoznawalne UUID (prefiks `00000000-0000-0000-0000-00000001xx`/`...02xx`/`...03xx` — patrz `supabase/seed.sql`), więc usunięcie jest precyzyjne i nie ryzykuje skasowania rzeczywistych danych:

```sql
-- Uwaga: to JEDYNY uzasadniony przypadek fizycznego DELETE w tym projekcie —
-- czyszczenie danych testowych, nie produkcyjnych rekordów biznesowych
-- (CLAUDE.md zasada #3 mówi o rekordach biznesowych, nie o seedzie dev).
delete from public.inquiry_services where inquiry_id in (
  select id from public.inquiries where company_id like '00000000-0000-0000-0000-0000001%'
);
delete from public.activity_log where inquiry_id in (
  select id from public.inquiries where company_id like '00000000-0000-0000-0000-0000001%'
);
delete from public.audit_log where record_id in (
  select id from public.inquiries where company_id like '00000000-0000-0000-0000-0000001%'
) or record_id in (
  select id from public.companies where id like '00000000-0000-0000-0000-0000001%'
);
delete from public.inquiries where company_id like '00000000-0000-0000-0000-0000001%';
delete from public.contacts where company_id like '00000000-0000-0000-0000-0000001%';
delete from public.companies where id like '00000000-0000-0000-0000-0000001%';
```

Albo prościej, dla środowiska lokalnego: `npx supabase db reset` bez następczego `db reset` z seedem (usuń/zakomentuj zawartość `supabase/seed.sql` przed resetem, jeśli chcesz czystą bazę bez danych demo na starcie).

**Przed wdrożeniem na produkcję**: potwierdź, że `seed.sql` nigdy nie jest uruchamiany automatycznie na projekcie produkcyjnym (`supabase db reset` na projekcie hostowanym nie istnieje jako operacja — to polecenie działa tylko lokalnie; na projekcie hostowanym stosuje się `db push`, który nie dotyka `seed.sql`). To już jest bezpieczne przez samą architekturę Supabase CLI, ale warto to świadomie wiedzieć, nie zakładać.

## 7. Weryfikacja po konfiguracji

Po wykonaniu kroków 1–5, zanim uznasz środowisko za gotowe:

```bash
npm run build     # czysta kompilacja
npm run lint      # zero błędów
npm run test      # 34 testy Vitest, zielone
npx playwright test   # e2e — pierwszy raz uruchamiane tutaj, oczekuj ewentualnych drobnych poprawek selektorów
```

Testy SQL (RLS, numeracja, archiwizacja, uprawnienia, współbieżność) można też odtworzyć niezależnie od pełnego stosu Supabase — patrz `tests/sql/README.md`.
