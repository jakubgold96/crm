# Testy e2e (Playwright) — jak uruchomić

Te testy wymagają **działającego Supabase** (lokalnego, przez `supabase start` — wymaga Dockera) i działającej aplikacji Next.js przeciwko niemu. W środowisku, w którym pisana była Faza 1, nie było dostępu do Dockera, więc te testy są napisane i gotowe, ale **nie zostały wykonane** — ich uruchomienie jest pierwszym krokiem do zweryfikowania u osoby z dostępem do Dockera lub w CI.

## Przygotowanie

```bash
supabase start
supabase db reset        # aplikuje migracje + seed.sql
```

Załóż dwa konta testowe przez UI (`/login` → magic link albo hasło, Supabase lokalnie loguje maile do konsoli/Inbucket):

- `sprzedaz.test@inndes.local` — zwykły użytkownik (rola domyślna `sprzedaz` nadana przez trigger)
- `admin.test@inndes.local` — po założeniu, ręcznie w bazie: `UPDATE public.profiles SET role = 'administrator' WHERE id = '<uuid>';`

Zapisz hasła/sposób logowania w `.env.test.local` (nieśledzonym przez git) jako `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` — specs czytają je przez `process.env`.

## Uruchomienie

```bash
npm run dev          # w jednym terminalu, albo niech Playwright go sam odpali (webServer w konfiguracji)
npx playwright test  # w drugim
```

## Co pokrywają testy w tym katalogu

- `auth.spec.ts` — logowanie hasłem, błędne hasło, wylogowanie, przekierowanie niezalogowanego z `/zapytania` na `/login`.
- `inquiry-lifecycle.spec.ts` — kryterium akceptacji #2–#4: dodanie firmy → kontaktu → zapytania, numer nadany automatycznie, edycja grupy/etapu/właściciela/następnego kroku.
- `inquiry-archive.spec.ts` — kryterium #5: archiwizacja zamiast usunięcia, zarchiwizowane zapytanie znika z głównej listy ale zostaje w bazie.
- `scope-validation.spec.ts` — decyzja właściciela: zakres usługi nie blokuje utworzenia zapytania, ale blokuje przejście do etapu "Przygotowanie oferty" bez ustalenia.
- `mobile-cards.spec.ts` — kryterium #7: na viewport mobilnym lista zapytań/firm renderuje się jako karty, nie przewijana w bok tabela.

Testy RLS i numeracji współbieżnej są pokryte osobno, bezpośrednio w SQL — patrz `tests/sql/`, nie wymagają przeglądarki ani Next.js.

## Status wykonania w Fazie 1

Te specs nie zostały uruchomione w pełni (środowisko budowy Fazy 1 nie miało Dockera, więc nie dało się postawić lokalnego Supabase — patrz STATUS.md). Co natomiast zweryfikowano realnie, bez Supabase:
- `npm run dev` uruchamia się poprawnie, strona `/login` renderuje się z właściwą treścią (sprawdzone `curl`).
- `proxy.ts` (middleware) poprawnie przekierowuje niezalogowanego użytkownika z `/zapytania` na `/login` (HTTP 307, zweryfikowane `curl`) — to dokładnie to, co sprawdza pierwszy test w `auth.spec.ts`.
- `npx tsc --noEmit` nie zgłasza błędów dla żadnego pliku w tym katalogu — specs są poprawnym, kompilowalnym TypeScriptem zgodnym z typami Playwright, nie pseudokodem.

Pierwsza rzecz do zrobienia przy przejęciu projektu: uruchomić `supabase start` + `npx playwright test` i poprawić selektory, jeśli coś w UI odjechało od speców (prawdopodobny drobny dryf, nie fundamentalny problem — testy pisane 1:1 pod realne etykiety z komponentów).
