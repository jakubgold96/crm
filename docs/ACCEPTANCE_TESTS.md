# Testy akceptacyjne MVP

Każdy wiersz = kryterium z briefu → test → faza, w której go uruchamiamy.

| # | Kryterium | Typ testu | Faza |
|---|---|---|---|
| 1 | Można utworzyć konto i zalogować się jako konkretna osoba | e2e: rejestracja/zaproszenie → login → sesja pokazuje imię i rolę | 1 |
| 2 | Można dodać firmę, kontakt i zapytanie | e2e: formularz → zapis → widoczne na liście | 1 |
| 3 | Numer zapytania nadaje baza bez ręcznego wpisywania | unit/integration: insert bez podania numeru → trigger nadaje `INQ-NNNNNN` ciągły, niezmienny po edycji/archiwizacji; test współbieżności: N równoległych insertów → N unikalnych, rosnących numerów bez duplikatów (nextval na sekwencji) | 1 |
| 4 | Można ustawić grupę, etap, właściciela, następny krok i termin | e2e: edycja karty zapytania, wszystkie pola zapisują się niezależnie | 1 |
| 5 | Zapytania nie są usuwane, tylko archiwizowane | integration: brak endpointu/uprawnienia DELETE na `inquiries`; archive ustawia `is_archived` | 1–2 |
| 6 | Historia pokazuje autora i zmianę | integration: update pola → wpis w `audit_log` z `changed_by = auth.uid()` | 1 |
| 7 | Wyszukiwanie i filtry działają na desktopie i telefonie | e2e + manualny review na viewport mobilnym | 2 |
| 8 | Można utworzyć leada z domeny | e2e: formularz "nowy lead" z samą domeną | 3 |
| 9 | Agent zapisuje research z linkami do źródeł | integration: każdy `lead_facts.source_url` wypełniony, brak źródła = `confidence = brak_potwierdzenia` | 3 |
| 10 | Scoring leada ma uzasadnienie | integration: `leads.score_rationale` not null gdy `score` not null | 3 |
| 11 | Agent przygotowuje spersonalizowany draft | e2e: wygenerowany `email_drafts.body` zawiera konkretną obserwację + link źródła | 4 |
| 12 | Nic nie jest wysyłane bez kliknięcia zatwierdzającego | integration: brak ścieżki kodu wysyłającej e-mail bez `status = zatwierdzony` ustawionego przez człowieka | 4 |
| 13 | Odpowiedź zatrzymuje sekwencję | integration: webhook/odczyt odpowiedzi → status sekwencji = wstrzymana | 4 |
| 14 | Agent przygotowuje draft odpowiedzi | e2e: po wykryciu odpowiedzi tworzy się `email_drafts` typu `reply` | 4 |
| 15 | Można utworzyć zadanie lub zapytanie z poziomu odpowiedzi | e2e: akcja na wątku odpowiedzi → nowy `inquiries` lub task | 4 |
| 16 | Raport poranny i tygodniowy pokazują linki do rekordów | integration: wygenerowany raport zawiera klikalne linki do `inquiries`/`leads` | 5 |
| 17 | Wszystkie działania agenta mają audit log | integration: każde wywołanie agenta → wiersz w `agent_runs` | 3–5 |
| 18 | Testy bezpieczeństwa potwierdzają działanie RLS | Playwright/SQL: zalogowany jako user A nie widzi/nie edytuje rekordów wbrew polityce; nieaktywny user ma odmowę | 1 (smoke), rozbudowa w każdej fazie |
| 19 | Backup można pobrać i zweryfikować | manualny + skrypt: pobranie dumpa, restore lokalny, porównanie liczby wierszy | 2 |
| 20 | Nie ma sekretów w frontendzie | statyczna analiza: grep po kluczach/service_role w `app/`, `components/`, publicznym bundle | 1, powtarzane w każdej fazie |

## Testy bezpieczeństwa RLS (Faza 1, minimalny zestaw)

1. Użytkownik `sprzedaz` może odczytać i edytować `companies`, `contacts`, `inquiries`.
2. Użytkownik z `is_active = false` nie ma żadnego dostępu (próba zapytania zwraca pusty zbiór / 403, nigdy błąd ujawniający istnienie danych).
3. Żądanie bez ważnej sesji (anon key, brak JWT) nie widzi żadnych danych biznesowych.
4. `audit_log` i `agent_runs` nie są zapisywalne bezpośrednio przez klienta (tylko przez funkcje server-side / triggery).
5. Próba DELETE na `inquiries`/`companies`/`contacts` z poziomu klienta kończy się odmową (brak takiej polityki RLS w ogóle, nie tylko UI).
