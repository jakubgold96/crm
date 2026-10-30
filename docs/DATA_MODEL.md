# Model danych — INNDES CRM

Konwencja: `snake_case`, UUID jako PK (`gen_random_uuid()`), każda tabela biznesowa ma `created_at timestamptz default now()`, `created_by uuid references profiles(id)`, `updated_at timestamptz default now()`, `updated_by uuid references profiles(id)`. Enumy jako Postgres `enum` (łatwe do rozszerzenia przez `ALTER TYPE ... ADD VALUE`, co nie wymaga migracji danych).

Tabele oznaczone **[Faza 1]** budujemy teraz. Pozostałe to przygotowanie schematu (mogą istnieć jako puste tabele od razu, żeby uniknąć migracji łamiących FK później, ale UI dla nich nie powstaje przed właściwą fazą) lub czysto dokumentacyjne na razie.

## [Faza 1] `profiles`
Rozszerzenie `auth.users` (Supabase nie pozwala dowolnie modyfikować `auth.users`).

| kolumna | typ | uwagi |
|---|---|---|
| id | uuid PK | = `auth.users.id` |
| full_name | text | |
| role | enum `user_role` (administrator, sprzedaz, realizacja) | rola organizacyjna — widoczna w historii, decyduje o UI |
| can_view_financials | boolean default false | **uprawnienie, nie rola** — osobna flaga (patrz niżej), decyduje o dostępie do pól finansowych/marży |
| is_active | boolean default true | odebranie dostępu = false, nie usunięcie rekordu |
| created_at | timestamptz | |

RLS: użytkownik widzi wszystkie aktywne profile (potrzebne do przypisywania właścicieli); tylko `administrator` może modyfikować cudzy `role`/`is_active`/`can_view_financials`.

**Dlaczego `can_view_financials` jest osobną flagą, nie wyprowadzoną z `role`:** brief wymaga, żeby pola finansowe widzieli "administrator oraz osoby z uprawnieniem finansowym" — to może być ktoś z `sprzedaz`, nie tylko admin. Flaga typu boolean na profilu to najprostsza rzecz, która to wyraża bez tworzenia osobnego systemu uprawnień w Fazie 1. Rozszerzalność: jeśli w przyszłości uprawnień finansowych będzie więcej niż jedno (np. "widzi marże" vs "edytuje cenniki"), ta jedna kolumna przechodzi w tabelę `permissions`/`profile_permissions` — nie wymaga zmiany schematu `companies`/`inquiries`, bo te tabele i tak odwołują się do uprawnienia przez politykę RLS, nie przez kolumnę.

**Rozszerzalność na przyszłe ograniczenia dostępu do rekordów (nie budujemy teraz, ale nie zamykamy sobie drogi):** polityki RLS w Fazie 1 sprawdzają `profiles.is_active` i (dla pól wrażliwych) `can_view_financials`/`role = administrator`. Żadna polityka nie zakłada "wszyscy widzą wszystko" na sztywno w kodzie aplikacji — to są polityki bazodanowe, więc dodanie w przyszłości np. "widzisz tylko swoje rekordy lub rekordy swojego zespołu" to nowa/zmieniona polityka RLS na `inquiries`/`companies`, bez zmiany struktury tabel i bez przepisywania frontendu (frontend zawsze pyta Supabase, nigdy nie filtruje sam "co wolno zobaczyć").

## [Faza 1] `companies`
| kolumna | typ |
|---|---|
| id | uuid PK |
| name | text not null |
| country | text |
| city | text |
| address | text |
| tax_id | text (NIP/VAT) |
| website | text |
| email | text |
| phone | text |
| segment | enum `company_segment` (hotel, restauracja, biuro, retail, architekt, marka_meblowa, generalny_wykonawca, inne) |
| note | text |
| relationship_status | enum `relationship_status` (nowy, aktywny, uspiony, zakonczony) |
| is_archived | boolean default false |
| created_at/by, updated_at/by | — |

Indeksy: `lower(name)` trigram (duplikaty), `lower(website)` (domena), unikalny częściowy na `tax_id` gdzie nie null.

## [Faza 1] `contacts`
| kolumna | typ |
|---|---|
| id | uuid PK |
| company_id | uuid FK → companies, not null |
| first_name | text |
| last_name | text |
| position | text |
| role | enum `contact_role` (wlasciciel, kupiec, architekt, projektant, project_manager, techniczny, finanse, montaz, inna) |
| email | text |
| phone | text |
| language | text (kod ISO, np. "pl", "en", "no") |
| contact_consent | enum `contact_consent` (zgoda, brak_danych, zakaz) — default `brak_danych` |
| created_at/by, updated_at/by | — |

Indeksy do duplikatów: `lower(email)`, `phone` (znormalizowany), `(company_id, lower(last_name))`.

## [Faza 1] `inquiries` (Zapytania)
| kolumna | typ |
|---|---|
| id | uuid PK |
| number | text unique, generowany triggerem (patrz niżej), **niezmienny przez cały cykl życia rekordu** |
| inquiry_date | date not null default current_date — przechowuje rok/datę zapytania niezależnie od numeru |
| company_id | uuid FK → companies |
| contact_id | uuid FK → contacts, nullable |
| country | text |
| project_location | text |
| short_description | text |
| object_type | enum `object_type` (hotel, restauracja, bar_kawiarnia, biuro, sklep_retail, obiekt_publiczny_komercyjny, mieszkanie_dom_prywatny, inne) |
| object_type_other | text, wypełniane gdy `object_type = 'inne'` (doprecyzowanie) |
| scope_notes | text — doprecyzowanie zakresu usługi, wolny tekst |
| scope_undetermined | boolean default true — "Nieustalone"; przy przejściu `sales_stage` na `gotowe_do_wyceny` wymagane: `scope_undetermined = false` i co najmniej 1 wiersz w `inquiry_services` |
| source | enum `inquiry_source` (formularz, email, telefon, polecenie, architekt, targi, powrot_klienta, inne) |
| operational_group | enum `operational_group` (wymaga_dzialania, do_przypomnienia, czekamy_na_klienta) not null |
| sales_stage | enum `sales_stage` (nowe, kwalifikacja, kompletowanie_danych, przygotowanie_oferty, oferta_wyslana, negocjacje, wygrane, przegrane, wstrzymane) not null default 'nowe' |
| owner_id | uuid FK → profiles |
| next_step | text |
| next_step_due | date |
| task_status | enum `task_status` (otwarte, w_toku, zrobione) |
| notes | — (osobna tabela `inquiry_notes`, nie kolumna) |
| is_archived | boolean default false |
| archived_reason | text |
| archived_at | timestamptz |
| created_at/by, updated_at/by | — |

> Uwaga: brief wspomina etap „Gotowe do wyceny” jako punkt walidacji zakresu usługi — w obecnej liście `sales_stage` najbliższy odpowiednik to `przygotowanie_oferty`. Walidację (`scope_undetermined = false` + ≥1 usługa) wpinamy pod przejście do `przygotowanie_oferty`, chyba że przy implementacji okaże się, że potrzebny jest osobny etap — review przy pisaniu Fazy 1, nie wymaga decyzji teraz.

**Numer zapytania (numeracja ciągła, bez resetu rocznego):**
- Sekwencja Postgres `inquiry_number_seq` (`BIGINT`, start 1, bez cyklu).
- Trigger `BEFORE INSERT ON inquiries FOR EACH ROW`: `NEW.number := 'INQ-' || lpad(nextval('inquiry_number_seq')::text, 6, '0')` → `INQ-000001`, `INQ-000002`, ...
- `nextval()` na sekwencji Postgres jest z definicji atomowy i transakcyjny względem współbieżnych insertów (sekwencje nie podlegają zwykłym blokadom wierszy — każde wywołanie dostaje unikalną wartość nawet przy równoległych transakcjach, bez race condition). Nie potrzeba dodatkowej blokady `SELECT ... FOR UPDATE`.
- Luki w numeracji: sekwencja nie cofa się przy ROLLBACK transakcji (to standardowe zachowanie Postgres) — świadomie akceptujemy ewentualne pojedyncze przeskoki numeru przy nieudanym insercie, zamiast ryzykować blokady i spowolnienie przy współbieżnym zapisie. Numer ma być unikalny i rosnący, nie musi być idealnie bez dziur — potwierdzone przez wymaganie "unikaj luk wynikających z równoczesnego zapisu", co transakcyjna sekwencja spełnia (luki mogą powstać tylko po rollbacku, nie po równoczesnym zapisie).
- `number` ustawiane wyłącznie przez trigger; kolumna `GENERATED` nie jest używana, bo potrzebujemy formatowania tekstowego — zamiast tego RLS/grant: brak uprawnienia `UPDATE` na kolumnę `number` dla ról innych niż service role.
- Nigdy ręczne wpisywanie przez użytkownika ani edycja po utworzeniu.

`operational_group` i `sales_stage` to dwie niezależne kolumny — żadna logika nie wyprowadza jednej z drugiej.

## [Faza 1] `object_type` (enum, dane konfiguracyjne)
Wartości: `hotel`, `restauracja`, `bar_kawiarnia`, `biuro`, `sklep_retail`, `obiekt_publiczny_komercyjny`, `mieszkanie_dom_prywatny`, `inne`. Etykiety PL do wyświetlenia trzymane w `lib/enums.ts` (mapowanie enum → etykieta), nie rozsiane po komponentach. Rozszerzanie listy: migracja `ALTER TYPE object_type ADD VALUE`.

## [Faza 1] `service_scope_options` (tabela konfiguracyjna, nie enum)
Zakres usługi jest wielokrotnego wyboru, więc zamiast Postgres enum używamy tabeli — łatwiejsze dodawanie/dezaktywowanie opcji bez migracji schematu, i naturalnie wspiera relację wiele-do-wielu.

| kolumna | typ |
|---|---|
| id | uuid PK |
| code | text unique (np. `konsultacja_planowanie`) |
| label_pl | text |
| sort_order | int |
| is_active | boolean default true — dezaktywacja zamiast usuwania |

Seed startowy: konsultacja i planowanie / projektowanie mebli / wizualizacje 3D / dokumentacja techniczna / dobór materiałów / prototypowanie / produkcja jednostkowa / produkcja seryjna / optymalizacja kosztów / transport / montaż / nadzór nad realizacją / inne.

## [Faza 1] `inquiry_services` (tabela łącząca)
`inquiry_id FK → inquiries, service_option_id FK → service_scope_options`, PK złożony `(inquiry_id, service_option_id)`. Reprezentuje wielokrotny wybór zakresu usługi per zapytanie. Brak wierszy = zakres jeszcze nieustalony (razem z `inquiries.scope_undetermined`).

## [Faza 1] `inquiry_files`
`id, inquiry_id FK, storage_path, file_name, uploaded_at, uploaded_by`. Pliki w Supabase Storage, bucket prywatny, signed URL przy odczycie.

## [Faza 1] `inquiry_notes`
`id, inquiry_id FK, body, created_at, created_by, is_hidden boolean default false, hidden_reason text, hidden_at, hidden_by`. Soft-hide, nigdy DELETE.

## [Faza 1] `audit_log`
Uniwersalna tabela historii zmian dla `companies`, `contacts`, `inquiries` (i później `leads`).
`id, table_name, record_id, field_name, old_value, new_value, changed_at, changed_by`. Wypełniana triggerami `AFTER UPDATE` na kolumnach krytycznych (lub przez porównanie całego wiersza — do ustalenia w Fazie 1 implementacji, nie wymaga decyzji właściciela).

## [Faza 1, uproszczone] `activity_log`
Dla sekcji "Aktywność" na karcie zapytania — w MVP Fazy 1 to głównie zapis notatek + automatyczne wpisy o zmianach pól (z `audit_log`, zdenormalizowane do czytelnego widoku). E-maile/spotkania jako osobne źródła aktywności dochodzą w Fazie 4.
`id, inquiry_id FK, type enum(note, change, task, email, meeting, call), body/summary, occurred_at, created_by`.

## [Przygotowanie struktury, bez UI] `offers`
`id, inquiry_id FK, status, created_at` — placeholder, puste poza FK. Pełny model w osobnej fazie poza zakresem tego PRD. Gdy w przyszłości dojdą pola finansowe (cena, marża, koszt), od razu idą pod politykę RLS wymagającą `can_view_financials`, tak jak opisano niżej dla `inquiries`.

## [Przygotowanie struktury, bez UI] `projects`
`id, inquiry_id FK, status, created_at` — placeholder.

## [Faza 3] `icp_profiles`
`id, name, segment, countries text[], object_type, min_scope, typical_problem, matching_services text[], positive_criteria text[], exclusion_criteria text[], example_projects text[], preferred_language, message_tone, created_at/by`.

## [Faza 3] `leads`
`id, company_name, domain, contact_id FK nullable, country, icp_profile_id FK, status enum(nowy, do_researchu, zbadany, do_zatwierdzenia, gotowy_do_kontaktu, kontakt_wyslany, odpowiedzial, zakwalifikowany, rozmowa_umowiona, nie_teraz, nie_pasuje, zakaz_kontaktu), score int, score_rationale text, owner_id FK, researched_at, contact_consent, converted_inquiry_id FK nullable, created_at/by, updated_at/by`.

## [Faza 3] `lead_facts`
`id, lead_id FK, fact text, source_url, verified_at, confidence enum(wysoka, srednia, niska, brak_potwierdzenia)`. Każdy fakt z researchu agenta musi mieć źródło — to jest ten rekord.

## [Faza 4] `email_drafts`
`id, lead_id FK nullable, inquiry_id FK nullable, direction enum(outbound_cold, reply), body, status enum(do_zatwierdzenia, zatwierdzony, edytowany, odrzucony, odlozony, niepasujacy), approved_by, approved_at, sent_at, draft_version int, sources jsonb, created_at`.

## [Faza 4] `email_threads` / `email_messages`
Model dla wątków poczty przychodzącej po podłączeniu OAuth — szczegóły projektowane w Fazie 4, nie teraz (zależą od wybranego API: Gmail vs Graph mają różne modele wątków).

## [Faza 4/5] `agent_runs`
`id, user_id FK, agent_name, model, started_at, finished_at, tools_used jsonb, records_read jsonb, draft_before jsonb, action_approved boolean, result text, error text`.

## [Faza 5] `reports` / `notification_settings`
Konfiguracja godziny/dnia/kanału/zakresu per użytkownik + log wysłanych raportów.

---

## RLS — zasada ogólna (Faza 1)

**Decyzja właściciela produktu:** w Fazie 1 `sprzedaz` i `realizacja` widzą wszystkie zapytania, firmy, kontakty i podstawową aktywność (zespół 2–3 osoby, unikamy silosów). Każdy rekord ma mimo to właściciela i pełną historię działań. Nie ograniczamy jeszcze widoczności rekordów do właściciela/zespołu — ale struktura (patrz `profiles` wyżej) jest gotowa na taką zmianę później bez przebudowy bazy.

- Każda tabela: `ENABLE ROW LEVEL SECURITY`.
- **Odczyt rekordów** (`companies`, `contacts`, `inquiries`, `inquiry_notes`, `activity_log`): każdy zalogowany aktywny użytkownik (`profiles.is_active = true`), niezależnie od roli.
- **Zapis/edycja rekordów:** jak odczyt — każdy zalogowany aktywny użytkownik.
- **Pola wrażliwe / finansowe** (koszty, marża, dane finansowe — dotyczy głównie przyszłego modułu Ofert, ale zasada obowiązuje od Fazy 1 jako wzorzec): widoczne tylko dla `role = 'administrator' OR can_view_financials = true`. W Fazie 1 nie ma jeszcze kolumn finansowych w `inquiries`/`companies`, więc w praktyce reguła zacznie działać realnie przy module Ofert — ale polityka i flaga na profilu powstają już teraz, żeby nie robić tego "na szybko" później.
- **Prywatne zadania / tokeny integracji:** tokeny OAuth (Faza 4) nigdy nie są czytelne przez klienta — tylko server-side (service role). Prywatne zadania użytkownika (jeśli powstaną w przyszłości jako koncept odrębny od `inquiries.owner_id`) domyślnie widoczne tylko dla właściciela + administratora — nie ma takiej tabeli w Fazie 1.
- Brak dostępu dla `role = null` / nieaktywnych — pełna odmowa, nie częściowy dostęp.
- Tabele `agent_runs`, `audit_log`: INSERT tylko przez funkcje server-side (service role), odczyt dla zalogowanych aktywnych użytkowników.
- `number` na `inquiries`: brak uprawnienia `UPDATE` na tę kolumnę dla ról innych niż service role (patrz sekcja `inquiries` wyżej).

## Trasy (routes) — Faza 1

```
/login                          logowanie (hasło / magic link)
/                                dashboard
/zapytania                       lista (widoki: Operacyjne | Sprzedaż | Moje)
/zapytania/nowe                  formularz nowego zapytania
/zapytania/[id]                  karta zapytania
/firmy                           lista firm
/firmy/nowa
/firmy/[id]                      karta firmy (dane + powiązane kontakty/zapytania)
/kontakty                        lista kontaktów
/kontakty/nowy
/kontakty/[id]
/ustawienia/uzytkownicy          [administrator] zarządzanie kontami
/ustawienia/profil               własny profil
```

Trasy przygotowane jako szkielet, bez pełnej funkcji, dopiero w kolejnych fazach:
`/archiwum` (Faza 2), `/leady`, `/leady/[id]`, `/icp` (Faza 3), `/agent` (Faza 4), `/raporty` (Faza 5).

API routes (Faza 1, server-side, wołane przez UI — logika biznesowa typu "nadaj numer" dzieje się w bazie/triggerze, nie w API):
```
POST /api/companies/check-duplicates
POST /api/contacts/check-duplicates
POST /api/inquiries/[id]/archive
```

---

## Kompletny reference Fazy 1 (wszystkie tabele/relacje/indeksy/constrainty/funkcje/triggery/polityki)

Ten rozdział jest wyczerpującym spisem tego, co faktycznie istnieje w `supabase/migrations/00000000000001_...` do `...008_...` — zrób `grep` po nazwie w migracjach, jeśli potrzebujesz pełnej definicji SQL; tu jest spis, nie powtórzenie kodu.

### Enumy (migracja 1)
`user_role`, `company_segment`, `relationship_status`, `contact_role`, `contact_consent`, `object_type`, `inquiry_source`, `operational_group`, `sales_stage`, `task_status`, `activity_type` — pełna lista wartości każdego wyżej w tym dokumencie, przy odpowiedniej tabeli.

### Tabele, PK, FK

| Tabela | PK | FK | Unikalność / inne |
|---|---|---|---|
| `profiles` | `id` (= `auth.users.id`) | `id → auth.users(id) on delete cascade` | — |
| `companies` | `id` | `created_by/updated_by → profiles(id)` | unikalny częściowy `tax_id` gdzie nie null/nie pusty |
| `contacts` | `id` | `company_id → companies(id)` not null; `created_by/updated_by → profiles(id)` | — |
| `service_scope_options` | `id` | — | `code` unique |
| `inquiries` | `id` | `company_id/contact_id/owner_id/created_by/updated_by → companies/contacts/profiles(id)` | `number` unique |
| `inquiry_services` | złożony `(inquiry_id, service_option_id)` | `inquiry_id → inquiries(id)`, `service_option_id → service_scope_options(id)` | — |
| `inquiry_files` | `id` | `inquiry_id → inquiries(id)`, `uploaded_by → profiles(id)` | — |
| `inquiry_notes` | `id` | `inquiry_id → inquiries(id)`, `created_by/hidden_by → profiles(id)` | — |
| `activity_log` | `id` | `inquiry_id → inquiries(id)`, `created_by → profiles(id)` | — |
| `audit_log` | `id` | `changed_by → profiles(id)` | `table_name`/`record_id` nie są FK (uniwersalna tabela dla wielu tabel) |

### Constrainty CHECK

| Tabela | Constraint | Reguła |
|---|---|---|
| `inquiries` | `object_type_other_requires_inne` | `object_type_other` tylko gdy `object_type = 'inne'` |
| `inquiries` | `archived_reason_requires_flag` | `is_archived=false` wymaga `archived_reason`/`archived_at` = NULL; `is_archived=true` dopuszcza je wypełnione (test `tests/sql/archive_not_delete.sql` pokazuje, że próba `is_archived=false` z niewyczyszczonym `archived_reason` jest odrzucana) |
| `inquiry_notes` | `hidden_reason_requires_flag` | analogicznie dla ukrywania notatki |

### Indeksy (poza PK/unique)

`companies`: trigram na `lower(name)`, `lower(website)`, `lower(email)`, `phone`.
`contacts`: `company_id`, `lower(email)`, `phone`, `(company_id, lower(last_name))`.
`inquiries`: `company_id`, `contact_id`, `owner_id`, `number`; częściowe (`where is_archived=false`) na `operational_group`, `sales_stage`, `next_step_due`; GIN trigram na tekst złączony z `short_description`/`next_step`/`country`.
`inquiry_files`: `inquiry_id`. `inquiry_notes`: `inquiry_id`. `activity_log`: `(inquiry_id, occurred_at desc)`. `audit_log`: `(table_name, record_id, changed_at desc)`.

### Sekwencje

`inquiry_number_seq` — `bigint`, start 1, `no cycle`. Konsumowana wyłącznie przez trigger `set_inquiry_number()`, nigdy wywoływana ręcznie z aplikacji.

### Funkcje

| Funkcja | Rodzaj | Co robi |
|---|---|---|
| `handle_new_user()` | trigger `security definer` | tworzy `profiles` po `auth.users` insert |
| `is_active_user()` | helper `security definer stable` | czy `auth.uid()` ma `is_active=true` |
| `current_user_role()` | helper `security definer stable` | rola bieżącego użytkownika |
| `current_user_can_view_financials()` | helper `security definer stable` | `can_view_financials OR role='administrator'`, `false` bez sesji |
| `set_updated_at()` | trigger (generyczny) | ustawia `updated_at = now()` przed UPDATE na `companies`/`contacts`/`inquiries` |
| `set_inquiry_number()` | trigger `before insert` | nadaje `number`, odrzuca ręcznie podany |
| `prevent_inquiry_number_update()` | trigger `before update` | odrzuca zmianę `number` po utworzeniu |
| `audit_companies()` / `audit_contacts()` / `audit_inquiries()` | trigger `after update`, `security definer` | insert do `audit_log` per zmienione pole; `audit_inquiries` dodatkowo pisze do `activity_log` |
| `log_note_activity()` | trigger `after insert` na `inquiry_notes` | insert do `activity_log` |
| `create_inquiry_with_services(...)` | RPC `security invoker` | atomowy insert `inquiries` + N `inquiry_services` |
| `set_inquiry_services(p_inquiry_id, p_service_option_ids)` | RPC `security invoker` | delete-then-reinsert całej listy usług zapytania |

### Triggery (per tabela)

`auth.users`: `on_auth_user_created` (after insert) → `handle_new_user()`.
`profiles`: brak triggera (tylko RLS).
`companies`: `companies_set_updated_at` (before update), `companies_audit` (after update).
`contacts`: `contacts_set_updated_at` (before update), `contacts_audit` (after update).
`inquiries`: `inquiries_set_number` (before insert), `inquiries_prevent_number_update` (before update), `inquiries_set_updated_at` (before update), `inquiries_audit` (after update).
`inquiry_notes`: `inquiry_notes_log_activity` (after insert).

### Polityki RLS (per tabela, rola `authenticated`; brak polityki = odmowa domyślna)

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | aktywny user widzi wszystkie profile | — (tworzone tylko przez trigger) | właściciel: tylko pola niewrażliwe (nie `role`/`can_view_financials`/`is_active`); administrator: dowolny profil, dowolne pole | brak (nigdy fizycznie) |
| `companies` | aktywny user | aktywny user | aktywny user | brak (+ brak grantu tabelowego) |
| `contacts` | aktywny user | aktywny user | aktywny user | brak (+ brak grantu) |
| `service_scope_options` | aktywny user | tylko administrator | tylko administrator | tylko administrator (polityka `for all`) |
| `inquiries` | aktywny user | aktywny user | aktywny user | brak (+ brak grantu) |
| `inquiry_services` | aktywny user | aktywny user | — | aktywny user (tabela łącząca, usunięcie wiersza = zmiana checkboxa, nie utrata historii — historia jest w `audit_log`) |
| `inquiry_files` | aktywny user | aktywny user | — | brak |
| `inquiry_notes` | aktywny user | aktywny user | aktywny user (tylko pola ukrycia — reguła aplikacyjna, nie twardy constraint w Fazie 1) | brak |
| `activity_log` | aktywny user | aktywny user | — | brak |
| `audit_log` | aktywny user | brak (grant insert odebrany jawnie; zapis tylko przez `security definer` triggery) | brak | brak |
| `storage.objects` (bucket `inquiry-files`) | aktywny user, tylko ten bucket | aktywny user, tylko ten bucket | — | brak |

### Granty tabelowe (migracja 7, niezależne od RLS)

`authenticated`: `SELECT, INSERT, UPDATE` na wszystkich tabelach `public`, **nigdy `DELETE`**, z jedynym wyjątkiem `inquiry_services` (tabela efemeryczna/łącząca). `audit_log` ma dodatkowo jawny `REVOKE INSERT, UPDATE, DELETE` (zapis wyłącznie przez triggery `security definer`, które działają z uprawnieniami właściciela funkcji, nie wywołującego). `storage.objects`: `SELECT, INSERT` (brak `DELETE`).

### Status testowy każdego elementu

Co z powyższego jest potwierdzone realnym testem SQL (nie tylko deklaracją), i w którym pliku — patrz `tests/sql/README.md`, tabela "Co pokrywa który plik". Otwarty punkt: polityki RLS dla pól finansowych nie istnieją jeszcze w Fazie 1, bo nie istnieją jeszcze same pola finansowe (dotrą z modułem Ofert) — testowany jest na razie sam mechanizm uprawnienia (`current_user_can_view_financials()`, polityki na `profiles`), nie ochrona konkretnej kolumny.
