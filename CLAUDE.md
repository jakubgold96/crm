# CLAUDE.md — INNDES CRM

Ten plik to stała instrukcja robocza dla Claude (i każdego innego agenta) pracującego w tym repozytorium. Czytaj go na początku każdej sesji. Nie wklejaj całego briefu produktowego ponownie — jest zredukowany do PRD.md i tego pliku.

## Co budujemy

Prosty, profesjonalny CRM dla INNDES (meble kontraktowe, B2B) z modułem Lead Agent, dla zespołu 2–3 osób. Priorytet: żadne zapytanie nie ginie, każdy rekord ma następny krok, agent nie przejmuje komunikacji z klientem.

Pełna specyfikacja biznesowa: `docs/PRD.md`.
Model danych: `docs/DATA_MODEL.md`.
Trasy: `docs/ROUTES.md`.
Plan migracji/backupu: `docs/MIGRATIONS_BACKUP.md`.
Testy akceptacyjne: `docs/ACCEPTANCE_TESTS.md`.
Stack i uzasadnienie: `docs/STACK.md`.
Bieżący status prac: `STATUS.md` (aktualizuj po każdej fazie/podfazie).

## Twarde zasady — nie łam ich

1. **Żadnych sekretów w kodzie klienta.** Klucze serwisowe Supabase, OAuth client secrets, cokolwiek wrażliwego — tylko server-side (API routes / Edge Functions), nigdy w bundle'u frontendu ani w repo jako plaintext.
2. **RLS jest obowiązkowe** na każdej tabeli z danymi firmowymi. Brak RLS = brak merge'a.
3. **Nic nie jest usuwane fizycznie.** Zapytania, leady, notatki — tylko archiwizacja / soft-delete / "ukryj wpis" z powodem i historią. Jedyny wyjątek: usuwanie przez administratora w ramach RODO na wyraźne żądanie, logowane osobno.
4. **Agent nigdy nie wysyła wiadomości do klienta bez kliknięcia zatwierdzającego przez człowieka.** Zero wyjątków, nawet w trybie "automatyczny raport".
5. **Agent nie wymyśla faktów.** Brak źródła → pole "brak potwierdzenia" + propozycja pytania do człowieka. Dotyczy cen, terminów, certyfikatów, możliwości produkcyjnych.
6. **Każda istotna akcja ma autora (prawdziwego zalogowanego użytkownika), znacznik czasu i trafia do historii.** Nie wolno przechowywać "autora" jako wolnego tekstu.
7. **Nie buduj funkcji efektownych, które nie rozwiązują konkretnego problemu z PRD.** Jeśli czegoś nie ma w PRD/MVP — pytaj, nie zgaduj z rozmachem.
8. **Nie twórz jednej wielkiej tabeli UI.** Widoki, karty, sekcje rozwijane — nie dokładaj kolumn bez końca.
9. **Grupa operacyjna i etap sprzedaży to dwa oddzielne pola** na zapytaniu. Nigdy ich nie łącz ani nie wyprowadzaj jednego z drugiego.
10. **Agent AI nie jest wywoływany do zwykłych operacji** (filtrowanie, sortowanie, liczenie terminów, walidacja formularzy). To zwykły kod.

## Jak pracować w tym repo (oszczędność tokenów)

- Pracuj fazami zamkniętymi (patrz `docs/PRD.md` → Kolejność pracy). Nie przeskakuj faz.
- Przed zmianą czytaj tylko pliki potrzebne do tej zmiany — nie całe repo.
- Po każdej fazie / istotnym kroku: aktualizuj `STATUS.md` (krótka lista: co zrobione, jakie testy przeszły, co dalej) i uruchom testy.
- Nie opisuj długo tego, co widać z diffa. Krótka lista zmian + wynik testów wystarczy.
- Nie buduj integracji e-mail na mockach, zanim nie ma solidnego modelu danych pod spodem.
- Dane demonstracyjne: użyj jednego pliku fixture/seed, nie generuj losowych danych za każdym razem na nowo.
- Trudne zadania (drafty, analiza odpowiedzi, scoring z uzasadnieniem) → mocniejszy model. Proste klasyfikacje (np. kategoria bounce/autoresponder gdy jest oczywista z nagłówków) → tańszy model lub reguły bez LLM w ogóle.
- Nie twierdź, że coś działa, dopóki nie pokażesz wyniku testu (polecenie, output, albo zrzut z przeglądarki).

## Kolejność faz (przypomnienie)

Faza 0 (ten dokument + PRD + model danych + trasy + plan backupu + testy akceptacyjne) → Faza 1 (fundament: logowanie, firmy, kontakty, zapytania, RLS, historia) → Faza 2 (operacyjny CRM: archiwum, filtry, zadania, eksport, mobile) → Faza 3 (leady, ICP, research) → Faza 4 (agent komunikacji, poczta) → Faza 5 (raporty).

Nie implementuj leadów, poczty ani agenta przed zamknięciem fundamentu (Faza 1) i akceptacją przez właściciela produktu.

## Konwencje techniczne

- TypeScript wszędzie, strict mode.
- Next.js 16 App Router, server components domyślnie; client components tylko gdy potrzebna interaktywność.
- **`proxy.ts`, nie `middleware.ts`** — Next 16 zmienił nazwę konwencji (funkcja eksportowana jako `proxy`, nie `middleware`). Patrz `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` po szczegóły, jeśli coś się jeszcze zmieni w kolejnych wersjach.
- **`cacheComponents: false`** w `next.config.ts` — świadoma decyzja, nie przeoczenie. CRM nie ma treści do statycznego cache'owania (wszystko per-sesja, za RLS), więc Cache Components Next 16 (wymagający jawnego `"use cache"`/Suspense na każdej dynamicznej trasie) tylko przeszkadzałby. Nie włączaj z powrotem bez dobrego powodu.
- Supabase: migracje SQL w `supabase/migrations/`, nigdy ręczne zmiany w panelu produkcyjnym bez migracji. Numerowane sekwencyjnie (`00000000000001_`, `...0002_`, itd.) — kolejna migracja to `00000000000009_`.
- Operacje wielotabelowe, które muszą być atomowe (np. zapytanie + jego usługi), idą przez funkcję Postgres RPC (`security invoker`, RLS nadal obowiązuje), nie przez kilka osobnych wywołań z klienta — patrz `create_inquiry_with_services` jako wzorzec.
- Każda tabela biznesowa: `created_at`, `created_by`, `updated_at`, `updated_by`. Zmiany krytycznych pól lecą też do `audit_log` przez triggery `AFTER UPDATE` (nie przez kod aplikacji — nie da się o tym zapomnieć w nowym miejscu wywołania).
- Nazwy tabel i pól: angielskie w bazie (łatwiej o biblioteki, migracje, ewentualny zespół nie-polski w przyszłości), etykiety UI: polskie, trzymane centralnie w `lib/enums.ts` — nigdy wpisywane na sztywno w komponencie.
- UI: własne, lekkie komponenty w `components/ui/` (nie pełny shadcn CLI — zainstalowane ręcznie w tym samym duchu: Radix-free, cva + Tailwind). Paleta kolorów zdefiniowana jako CSS custom properties w `app/globals.css` (`--accent`, `--terracotta`, `--sage` itd.) — nowe komponenty powinny z niej korzystać, nie wprowadzać nowych kolorów ad-hoc.
- Testy: Vitest (unit/logika walidacji — `tests/unit/`), Playwright (e2e krytycznych ścieżek — `tests/e2e/`, wymaga żywego Supabase), surowy SQL z asercjami (RLS + triggery + funkcje RPC — `tests/sql/`, nie wymaga Next.js, tylko Postgresa). Zanim ogłosisz coś "gotowe", uruchom odpowiedni poziom testów i pokaż wynik — nie deklaruj bez dowodu.
