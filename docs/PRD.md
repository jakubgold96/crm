# PRD — INNDES CRM z modułem Lead Agent

## 1. Kontekst i cel

INNDES: meble kontraktowe i produkcja dla restauracji, hoteli, barów, biur, retailu, architektów, marek meblowych. Zakres usług: konsultacja, projekt, wizualizacje 3D, dokumentacja techniczna, dobór materiałów, prototypowanie, produkcja jednostkowa/seryjna, kontrola jakości, transport, montaż, nadzór.

Dziś zapytania ofertowe są obsługiwane w arkuszu + skrzynce pocztowej → łatwo coś zgubić. **Cel CRM:** żadne zapytanie nie ginie, każdy rekord ma właściciela i następny krok z terminem, a moduł Agent oszczędza czas zespołu bez przejmowania komunikacji z klientem.

Skala: zespół 2–3 osoby, nie tysiące klientów. To nie jest ERP.

## 2. Role i konta

- Indywidualne konta (e-mail + hasło lub magic link), nie wspólny link.
- Role: `administrator`, `sprzedaz`, `realizacja`.
- Admin może odebrać dostęp użytkownikowi (deaktywacja, nie usunięcie konta).
- Historia zawsze pokazuje realnego zalogowanego użytkownika (z `auth.uid()`), nigdy wpisywane ręcznie imię.
- Marże, dane finansowe, tokeny integracji — widoczne tylko dla `administrator` oraz profili z flagą `can_view_financials = true` (uprawnienie niezależne od roli organizacyjnej, bo osoba finansowa może mieć rolę `sprzedaz`). `realizacja` domyślnie nie ma tej flagi.
- W Fazie 1 `sprzedaz` i `realizacja` widzą wszystkie zapytania, firmy, kontakty i aktywność (zespół 2–3 osoby, unikamy silosów) — każdy rekord ma mimo to właściciela i pełną historię. Struktura uprawnień jest przygotowana tak, by w przyszłości dało się ograniczyć widoczność rekordów (np. do właściciela/zespołu) bez przebudowy bazy.

## 3. Firmy i Kontakty

**Firma:** nazwa, kraj, miasto+adres, NIP/VAT (opcjonalne), strona WWW, e-mail ogólny, telefon, segment (hotel/restauracja/biuro/retail/architekt/marka meblowa/generalny wykonawca/inne), notatka, status relacji.

**Kontakt:** imię i nazwisko, firma (FK), stanowisko, rola (właściciel/kupiec/architekt/projektant/PM/techniczny/finanse/montaż/inna), e-mail, telefon, język, pole kontrolne zgoda/zakaz kontaktu, historia powiązanych zapytań i leadów (widok, nie osobna tabela).

**Kontrola duplikatów:** przy zapisie firmy/kontaktu sprawdzaj po nazwie (fuzzy), domenie, e-mailu, telefonie, NIP/VAT — ostrzeżenie przed zapisem, nie twardy blok (użytkownik może świadomie kontynuować).

## 4. Zapytania (serce systemu)

Pola: numer (auto, ciągły, nadawany transakcyjnie przez bazę, niezmienny przez cały cykl życia rekordu — format `INQ-000001`), data zapytania (osobne pole, nie wpływa na numer), firma, kontakt, kraj i miejsce projektu, krótki opis, typ obiektu (zamknięta lista z opcją "Inne — doprecyzuj"), zakres usługi (wielokrotny wybór z listy konfigurowalnej + pole doprecyzowania `scope_notes` + opcja "Nieustalone"; nie blokuje dodania zapytania, wymagany dopiero przy przejściu do etapu przygotowania oferty), źródło (formularz/e-mail/telefon/polecenie/architekt/targi/powrót klienta/inne), grupa operacyjna, etap sprzedaży, właściciel, następny krok (tekst), termin następnego kroku (data), status zadania, notatki, pliki, historia zmian, status archiwalny + powód archiwizacji.

Szczegóły numeracji, listy typu obiektu i zakresu usługi: `docs/DATA_MODEL.md`.

**Grupy operacyjne** (pole 1, operacyjne "co teraz"): Wymaga działania / Do przypomnienia / Czekamy na klienta.

**Etapy sprzedaży** (pole 2, niezależne, "gdzie w lejku"): Nowe / Kwalifikacja / Kompletowanie danych / Przygotowanie oferty / Oferta wysłana / Negocjacje / Wygrane / Przegrane / Wstrzymane.

To dwa oddzielne pola — nie łączyć, nie wyprowadzać jednego z drugiego w UI ani w bazie.

Zapytania nigdy nie są usuwane fizycznie — tylko archiwizowane (z powodem).

## 5. Dashboard (ekran główny)

Sekcje: "Dzisiaj" (po terminie / na dziś / bez ruchu), moje zadania, zapytania wymagające uwagi, nowe odpowiedzi, leady do zatwierdzenia, rekomendacje agenta, szybkie akcje (dodaj zapytanie/firmę/leada, otwórz odpowiedzi).

Styl: jasne tło, granatowa typografia, kobaltowy akcent akcji, subtelny terakota + szałwia. Profesjonalne narzędzie B2B dla architektury/mebli — nie generyczny "AI dashboard".

## 6. Lista i karta zapytania

Lista: 3 grupy z licznikami, zaległe/dzisiejsze na górze, wyszukiwanie (numer/firma/kontakt/kraj/opis/następny krok), filtry (termin/właściciel/etap/kraj/źródło), sortowanie, inline-edycja (opis/następny krok/termin/grupa), filtr "Moje", widok mobilny jako karty (nie zminiaturyzowana tabela), osobne widoki: Operacyjne / Sprzedaż / Moje.

Karta zapytania — sekcje: Podstawowe, Następne działanie, Oferta (placeholder w MVP), Pliki, Aktywność (rozmowy+e-maile+spotkania+notatki+zadania+zmiany razem, chronologicznie), Historia zmian (osobna sekcja audytowa), Powiązane leady i kontakty.

Notatki: nie usuwać fizycznie — akcja "Ukryj wpis" z powodem + widoczność w historii administratora.

## 7. Leady i moduł Agent — poza zakresem Fazy 1

Pełny opis: patrz oryginalny brief produktowy (sekcje 7–13) — pozostaje wiążący dla Faz 3–5, nie powtarzamy go tu w całości, żeby nie dublować treści w kontekście agenta. Streszczenie zakresu:

- **Leady** (Faza 3): firma/domena/kontakt/kraj/profil ICP/status/scoring z uzasadnieniem/fakty ze źródłami/potrzeba/proponowana usługa/właściciel/historia kontaktu. Lead → "Utwórz zapytanie z leada" (ręczne, nigdy automatyczne).
- **Profile ICP** (Faza 3): min. 4 przykładowe profile z briefu (studio architektoniczne, hotel/restauracja, marka meblowa, generalny wykonawca).
- **Research agenta** (Faza 3): wejście = domena/nazwa firmy, wyjście zawsze z linkami źródłowymi, datą weryfikacji, poziomem pewności; brak źródła = "brak potwierdzenia".
- **Drafty cold email** (Faza 4): agent tworzy, człowiek zatwierdza. Kolejka "Do zatwierdzenia": Zatwierdź i wyślij / Edytuj / Inna wersja / Odrzuć / Odłóż / Niepasujący.
- **Odpowiedzi e-mail** (Faza 4): OAuth Gmail/MS365, zero haseł w bazie. Po odpowiedzi: stop sekwencji, detekcja intencji, streszczenie, pytania klienta, braki informacji, draft odpowiedzi, propozycja kroku. Cena/termin/certyfikat/zobowiązanie zawsze wymagają zatwierdzenia człowieka.
- **Agent w UI** (Faza 4/5): panel globalny + panel kontekstowy na kartach + centrum powiadomień. Każda odpowiedź agenta wskazuje rekordy źródłowe + oferuje akcje (Otwórz/Utwórz zadanie/Przygotuj draft/Utwórz zapytanie/Przypisz właściciela).
- **Raporty** (Faza 5): poranny i tygodniowy, konfigurowalne (godzina/dzień/kanał/zakres), do właściciela automatycznie — wiadomości do klientów nigdy automatycznie.

## 8. Granice bezpieczeństwa agenta (obowiązują od momentu wprowadzenia agenta)

Agent NIE MOŻE: wysłać wiadomości do klienta bez zatwierdzenia, wymyślać danych, zmieniać cen, potwierdzać terminu produkcji bez źródła, ujawniać marży bez uprawnień, omijać RLS, wykonywać kodu na danych bez kontroli, usuwać historii, kontynuować sekwencji po odpowiedzi klienta lub prośbie o brak kontaktu.

Każda akcja agenta → log `agent_runs`: użytkownik, agent/model, czas, narzędzia, rekordy odczytane, draft przed zmianą, akcja zatwierdzona, wynik, błąd.

## 9. Poza zakresem MVP v1

Pełny moduł Ofert, pełny moduł Projektów (tylko struktura/placeholder), autonomiczny bot wysyłający masowe e-maile, pełny ERP.

## 10. Kryteria akceptacji MVP

Patrz `docs/ACCEPTANCE_TESTS.md` — 20 kryteriów z briefu, zmapowane na testy automatyczne i manualne.
