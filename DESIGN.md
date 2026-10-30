---
name: INNDES CRM
description: Nocny HUD dla zespołu INNDES — ciemna konsola ze ściętymi panelami, neonowymi kolorami pilności i jednym żółtym kolorem akcji.
colors:
  background: "#05060b"
  sidebar: "#07080f"
  surface: "#0b0d16"
  surface-raised: "#11141f"
  surface-hover: "#181c2b"
  foreground: "#e8f0ff"
  foreground-muted: "#8b94ae"
  border: "#1b2034"
  border-strong: "#2c3352"
  accent: "#f5e400"
  accent-hover: "#fff35e"
  accent-foreground: "#05060b"
  neon-cyan: "#00e1ff"
  neon-magenta: "#ff2a6d"
  terracotta: "#ffb547"
  terracotta-bg: "rgb(255 181 71 / 0.12)"
  sage: "#39ff9c"
  sage-bg: "rgb(57 255 156 / 0.1)"
  danger: "#ff4d82"
  danger-bg: "rgb(255 42 109 / 0.14)"
  danger-foreground: "#05060b"
  warning-fg: "#ffd23f"
  warning-bg: "rgb(255 210 63 / 0.12)"
  kpi-1: "#7867ff"
  kpi-2: "#3d7bff"
  kpi-3: "#2bffa8"
  kpi-4: "#ff3fd2"
  kpi-up: "#39ff9c"
  kpi-down: "#ff4d82"
typography:
  display:
    fontFamily: "Chakra Petch, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Chakra Petch, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
  numeric:
    fontFamily: "Chakra Petch, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  title:
    fontFamily: "Chakra Petch, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
  control:
    fontFamily: "Chakra Petch, Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.08em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  data:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  chip-y: "2px"
  chip-x: "8px"
  field-x: "14px"
  card-y: "16px"
  card-x: "20px"
  section-gap: "20px"
  page-x-mobile: "16px"
  page-x: "32px"
  sidebar: "15rem"
  content-max: "88rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.accent-foreground}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.control}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.neon-cyan}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground-muted}"
    typography: "{typography.control}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.danger-foreground}"
    typography: "{typography.control}"
    padding: "0 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "40px"
  badge-neutral:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground-muted}"
    typography: "{typography.label}"
    padding: "2px 8px"
  badge-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    padding: "2px 8px"
  badge-terracotta:
    backgroundColor: "{colors.terracotta-bg}"
    textColor: "{colors.terracotta}"
    typography: "{typography.label}"
    padding: "2px 8px"
  badge-sage:
    backgroundColor: "{colors.sage-bg}"
    textColor: "{colors.sage}"
    typography: "{typography.label}"
    padding: "2px 8px"
  badge-accent:
    textColor: "{colors.neon-cyan}"
    typography: "{typography.label}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
  nav-item:
    textColor: "{colors.foreground-muted}"
    typography: "{typography.control}"
    padding: "8px 12px"
  nav-item-hover:
    textColor: "{colors.neon-cyan}"
  nav-item-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  kpi-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground-muted}"
    padding: "20px"
---

# Design System: INNDES CRM

## Overview

**Creative North Star: "Nocny HUD"**

INNDES CRM to ciemna, gęsta konsola, do której zespół „loguje się” rano jak do systemu: prawie czarny grunt z zimnym błękitem, skanlinie nad całym interfejsem, panele ze ściętymi rogami obrysowane cienką linią, neon w kolorze pilności i jeden kwasowy żółty jako kolor akcji. Kierunek przypiął właściciel produktu: cyberpunk w klimacie gatunku, „abstract hardcore”, kolory zrzutu referencyjnego podbite do neonu, efekty (glitch, skanlinie, neon) na wszystkich ekranach — także na liście zapytań, zadaniach i logowaniu, nie tylko na pulpicie.

Hałas wizualny jest podporządkowany pracy. Neon niesie znaczenie (po terminie, na dziś, czekamy na klienta, wygrane), dane siedzą w czcionce monospace z cyframi tabelarycznymi, a każdy efekt ruchu znika przy `prefers-reduced-motion`, zostawiając statyczny, w pełni czytelny ekran. Świat jest gatunkowy, nie licencjonowany: żadnych logotypów, postaci, nazw ani elementów interfejsu z gry/anime Cyberpunk 2077 / Edgerunners. Kolory marki INNDES (granat, kobalt, terakota, szałwia) nie wchodzą do tego świata.

To jest pełna wymiana poprzedniego świata (ciemna powłoka z jasną perłową płytą powitalną, sam Geist). Jasna płyta i pastelowe akcenty są anty-wzorcem.

**Key Characteristics:**
- Grunt `#05060b` z dwiema rozmytymi poświatami (magenta z prawej u góry, cyjan z lewej u dołu) i skanliniami nad wszystkim.
- Zero zaokrągleń; dwie sylwetki: panel HUD (jeden ścięty róg) i „notch” (dwa przeciwległe ścięte rogi).
- Kolor = pilność. Żółty = akcja. Te dwa systemy się nie mieszają.
- Trzy głosy pisma: Chakra Petch (nagłówki, liczby, przyciski — wersaliki), Geist (tekst), JetBrains Mono (numery, daty, etykiety danych).
- Ruch krótki i rzadki: boot ekranu, okresowy glitch tytułów, rysujące się linie trendu, przewijana taśma; całość wyłączana przy reduced-motion.

## Colors

Prawie czarna powłoka z chłodnym odcieniem, nad nią neony o wysokim nasyceniu; każdy neon ma przypisaną rolę, żaden nie jest dekoracją bez znaczenia.

### Primary
- **Kwasowy żółty** (`--accent`): przycisk główny, przycisk szukania, aktywna pozycja nawigacji (blok w sidebarze, „notch” w dolnym pasku mobilnym, podkreślenie aktywnej zakładki), pierścień focusu, podkreślenie aktywnego pola, kolor kursora tekstu i zaznaczenia, hover na numerach zapytań i linkach. Zawsze z czarnym tekstem `--accent-foreground`. Hover: `--accent-hover`.

### Secondary
- **Neonowy cyjan** (`--neon-cyan`, w Tailwind `cyan`): kolor nawigacyjno-informacyjny — hover nawigacji i przycisku drugorzędnego, licznik `[n]` przy tytule ekranu, sufiks `//CRM`, rola użytkownika, grupa „czekamy na klienta”, odczyt „Aktywne”, ton `accent` w Badge (uwaga: ton `accent` w Badge to cyjan, nie żółty).
- **Neonowa magenta** (`--neon-magenta`, w Tailwind `magenta`): znaki `//` w etykietach sekcji nawigacji, strzałki taśmy, kanał RGB w glitchu, poświata w tle; hover wylogowania.

### Tertiary — stany (nazwy historyczne)
Nazwy tokenów zostały z poprzednich światów, żeby ekrany przeszły bez przepisywania klas. Nazwa nie opisuje już koloru:
- **Bursztyn „na dziś”** (`--terracotta`, tło `--terracotta-bg`): termin dziś, grupa „do przypomnienia”, odczyt „Na dziś”. Miękkie ostrzeżenie.
- **Kwasowa zieleń sukcesu** (`--sage`, tło `--sage-bg`): sukces, „wygrane”, status „Aktywny”.
- **Neonowa czerwień-magenta alarmu** (`--danger`, tło `--danger-bg`, tekst na pełnym tle `--danger-foreground`): po terminie, błąd, „wymaga działania”, „przegrane”, alarm w pasku statusu.
- **Żółć ostrzeżenia** (`--warning-fg`, `--warning-bg`): ton `warning` w Badge; zdefiniowany, obecnie nieużywany na ekranach. Jest wizualnie bliski akcji — nie używać do „na dziś”.

### Tafle KPI
- **Indygo** (`--kpi-1`), **królewski błękit** (`--kpi-2`), **turkusowa zieleń** (`--kpi-3`), **magenta** (`--kpi-4`): odcienie czterech tafli ze zdjęcia referencyjnego użytkownika, z podbitą jasnością i nasyceniem, bez obrotu odcienia. Kolejność tafli: nowe zapytania, oferty wysłane, wygrane, przegrane. `--kpi-1` jest też kolorem domyślnym etapów sprzedaży bez własnej pilności.
- **Trend** (`--kpi-up`, `--kpi-down`): strzałka zmiany procentowej; dla „Przegrane” logika jest odwrócona (wzrost = źle).

### Neutral
- **Nocny grunt** (`--background`): tło strony pod poświatami.
- **Sidebar** (`--sidebar`): pasek boczny i dolna nawigacja mobilna (z przezroczystością 95%).
- **Powierzchnie** (`--surface` → `--surface-raised` → `--surface-hover`): panele i karty, pola i przycisk drugorzędny, hover przycisku drugorzędnego.
- **Tekst** (`--foreground`, `--foreground-muted`): treść i tekst pomocniczy, etykiety, nieaktywna nawigacja.
- **Linie** (`--border`, `--border-strong`): obrys paneli HUD, separatory wierszy; mocniejsza linia dla pól, chipów neutralnych i paska przewijania.

`--neon-acid` i `--neon-violet` są zdefiniowane w `app/globals.css`, ale żaden komponent ich nie używa; zieleń sukcesu idzie przez `--sage`.

### Named Rules
**The Yellow Action Rule.** Żółty `--accent` oznacza „tu kliknij / tu jesteś / tu piszesz”: akcja główna, aktywna nawigacja, focus. Nigdy nie jest statusem — „na dziś” to bursztyn `--terracotta`, nie żółty. Istniejące nieinteraktywne użycia (imię w powitaniu, blok zegara w pasku statusu, pasy ostrzegawcze, awatar inicjałów) są zamkniętą listą sygnatur pulpitu i powłoki, nie wzorcem do powielania.

**The Urgency Map Rule.** Kolor grupy jest liczony w jednym miejscu, `lib/ui/urgency.ts` (`groupNeon`): `wymaga_dzialania` i `przegrane` = `--danger`; `do_przypomnienia` = `--terracotta`; `czekamy_na_klienta` = `--neon-cyan`; `wygrane` = `--sage`; każdy inny klucz (pozostałe etapy sprzedaży) = `--kpi-1`. Nagłówki grup, obrys tabeli grupy i chipy grupy biorą kolor z tej funkcji; chip grupy operacyjnej to zawsze `GroupBadge`, nigdy ręcznie złożony `Badge`. Na liście zadań ta sama logika: po terminie = `--danger`, dziś = `--terracotta`, reszta = `--neon-cyan`.

**The Legacy Name Rule.** `--terracotta` = bursztyn „na dziś”, `--sage` = zieleń sukcesu, `--danger` = alarm/po terminie. Nie zmieniać nazw i nie dodawać równoległych tokenów o „prawdziwych” nazwach; nowe kolory nie wchodzą ad hoc, tylko przez `app/globals.css`.

## Typography

**Display Font:** Chakra Petch 500/600/700 (z repo, SIL OFL; fallback Geist, system-ui)
**Body Font:** Geist, zmienna grubość 100–900 (z repo przez `next/font/local`, zmienna `--font-geist-sans`)
**Label/Mono Font:** JetBrains Mono, zmienna grubość 100–800 (z repo, SIL OFL)

**Character:** Kanciasta, techniczna Chakra Petch w wersalikach z rozstrzeleniem daje głos HUD-u; neutralny Geist niesie zdania, które trzeba przeczytać; JetBrains Mono z cyframi tabelarycznymi odróżnia dane od prozy.

### Hierarchy
- **Display** (Chakra Petch 700, 2.6rem → 3.75rem → 4.5rem, interlinia 0.95, wersaliki): wyłącznie powitanie „HEY, {IMIĘ}” na pulpicie; imię w żółtym z rozszczepieniem RGB i migającym kursorem `_`.
- **Headline** (Chakra Petch 700, 1.5rem → 1.875rem, rozstrzelenie 0.06em, wersaliki): tytuł ekranu przez `PageTitle` — glitch + stały podział kanałów RGB, opcjonalny licznik `[n]` w mono cyjanie. Marka „INNDES” w sidebarze/logowaniu to ten sam głos (rozstrzelenie 0.12–0.14em).
- **Numeric** (Chakra Petch 700, 2.25rem → 3rem w taflach, 1.875rem → 2.25rem w odczytach, interlinia 1): liczby KPI i odczyty, w kolorze swojego neonu z poświatą tekstu, nabijane od zera.
- **Title** (Chakra Petch 600–700, 15px, rozstrzelenie 0.06–0.08em, wersaliki): tytuły kart, nagłówki grup na listach, „Dzisiaj” (18px).
- **Control** (Chakra Petch 600, 13px przyciski i zakładki / 13.5px nawigacja / 10.5px dolny pasek mobilny, rozstrzelenie 0.06–0.08em, wersaliki).
- **Body** (Geist 400–500, 14px, interlinia ~1.43): opisy, następne kroki, nazwy firm, pola formularzy.
- **Data** (JetBrains Mono, 13–14px, cyfry tabelaryczne): numery zapytań na pulpicie, daty, podsumowanie pod powitaniem, pole szybkiego szukania, puste stany na pulpicie.
- **Label** (JetBrains Mono 500, 10.5–11px, rozstrzelenie 0.04–0.12em, wersaliki): etykiety pól, chipy, etykiety tafli i odczytów, pasek statusu, etykiety sekcji nawigacji.

### Named Rules
**The Three Voices Rule.** Chakra Petch mówi (nagłówki, liczby, przyciski, nawigacja — zawsze wersalikami), Geist opowiada (zdania), JetBrains Mono raportuje (numer, data, licznik, etykieta). Akapity nigdy nie idą w Chakra Petch; liczby w tabelach i chipach zawsze z `tabular-nums`.

## Layout

Powłoka: na `md` (768px) i szerzej sticky sidebar pełnej wysokości o szerokości 15rem; poniżej — górny pasek 56px z marką i ikoną profilu oraz stały dolny pasek pięciu pozycji (Pulpit, Zapytania, Zadania, Firmy, Kontakty) z `safe-area-inset-bottom`, a treść dostaje dolny margines 96px. Kolumna treści ma maks. 88rem, odstęp boczny 16px (mobile) / 32px (desktop), pionowy 24px.

Pulpit: pasek statusu (zegar, data, przewijana taśma liczników, alarm po terminie) → panel główny `hud-lg` (od `lg` dwie kolumny 1.15fr / 1fr, min. 27rem wysokości, padding 20 / 32 / 48px): po lewej powitanie, podsumowanie, trzy odczyty, szukanie i akcje; po prawej „Dzisiaj” z czterema wierszami oddzielony pionową linią → cztery tafle KPI (2 kolumny, 4 od `xl`, odstęp 12/16px) → dwie karty list (od `lg` obok siebie). Odstęp między sekcjami 20px.

Listy (zapytania, zadania): tytuł z licznikiem i akcją po prawej, zakładki widoków podkreśleniem, wiersz wyszukiwania i sortowania, filtry chowane na mobile. Wyniki pogrupowane; każda grupa ma neonowy nagłówek i własny panel HUD z tabelą 5 kolumn (desktop, wspólne szerokości kolumn między grupami na liście zapytań) albo stos kart `hud-sm` (mobile). Odstęp między grupami 32px. Rytm odstępów to skala 4px Tailwinda; gęstość wysoka, wiersze tabel 10px w pionie.

## Elevation & Depth

System jest płaski w sensie cieni strukturalnych: głębię budują warstwy tonalne (`--background` → `--surface` → `--surface-raised` → `--surface-hover`), półprzezroczyste panele z lekkim rozmyciem tła, wewnętrzny obrys 1px i światło neonu. Nad wszystkim leży stała warstwa skanlinii (co 3px ciemny pasek 22%) z wolną wiązką skanującą (9s), nie przechwytująca kliknięć.

### Shadow Vocabulary
- **Obrys HUD** (`box-shadow: inset 0 0 0 1px var(--hud-line)`): krawędź paneli; kolor przez `--hud-line` (tafle i tabele grup nadpisują go swoim neonem przy 45–55%).
- **Obrys kontrolki** (`box-shadow: inset 0 0 0 1px var(--border-strong)`): przycisk drugorzędny, chip neutralny; na hover przycisku cyjan 60%.
- **Poświata focusu pola** (`box-shadow: inset 0 0 0 1px rgb(245 228 0 / 0.35), 0 6px 20px -12px rgb(245 228 0 / 0.8)`): pole w focusie; szybkie szukanie ma wariant `0 10px 30px -16px`.
- **Poświata znacznika** (`box-shadow: 0 0 10px <neon>`): romby 8px przy nagłówkach grup, etykietach tafli i na końcu linii trendu.
- **Wskaźnik aktywnej nawigacji** (`box-shadow: 0 0 12px rgb(245 228 0 / 0.9)`): pionowa belka 3px przy aktywnej pozycji sidebara.
- **Alarm chipu** (`0 0 12px -4px rgb(255 42 109 / 0.7)` obok obrysu): tylko ton `danger` w Badge.
- **Poświata dolnego paska mobilnego** (`0 -10px 30px -12px rgb(245 228 0 / 0.35)`).
- **Lista rozwijana** (`0 16px 40px -12px rgb(0 0 0 / 0.7)`): jedyny cień „podnoszący”, dla podpowiedzi wyboru firmy.
- **Poświata tekstu** (`text-shadow: 0 0 18px` w 55% koloru bieżącego): liczby KPI, odczyty, nagłówki grup.
- **Podział RGB** (`text-shadow: -2px 0 rgb(0 225 255 / 0.55), 2px 0 rgb(255 42 109 / 0.55)`): tytuły ekranów i imię w powitaniu.

### Named Rules
**The Clipped Glow Rule.** Panele `.hud` i kształty `.notch` są wycinane przez `clip-path`, który obcina każdy zewnętrzny `box-shadow`. Krawędź takiego elementu to zawsze cień wewnętrzny (`inset`), a poświata trafia na osobny, nieprzycięty element: romb, belkę wskaźnika, linię trendu, chip, pole formularza.

## Shapes

Zero zaokrągleń na wszystkich komponentach (`0px`). Forma to cięcie pod kątem 45°:
- **Panel HUD**: ścięty prawy górny róg z cienką przekątną krawędzi dorysowaną pseudo-elementem; trzy rozmiary cięcia — 8px (karty mobilne, pasek statusu), 14px (domyślny: karty, tabele grup, tafle), 28px (panel główny pulpitu).
- **Notch**: dwa przeciwległe ścięte rogi 8px (lewy górny i prawy dolny) — przyciski, aktywna pozycja nawigacji, kafel ikony w pasku mobilnym, awatar inicjałów, przycisk szukania.
- **Romb**: kwadrat 7–8px obrócony o 45° jako znacznik koloru (nagłówki grup, etykiety tafli, koniec linii trendu).
- **Pasy ostrzegawcze**: ukośne paski żółte 8px / przerwa 8px pod kątem −45° — górna krawędź sidebara i krótki trapez na górnej krawędzi panelu głównego.
- Linie: obrys 1px, podkreślenie pól 1px (2px w szybkim szukaniu i zakładkach), belka wskaźnika 3px, akcent tafli 2px u góry.

Jedyne okręgi to rozmyte plamy poświaty w tle panelu głównego — nie są czytelne jako kształt.

## Components

### Buttons
Zdecydowane, ścięte bloki z wersalikami; wejście akcji jest krótkim „szarpnięciem” glitcha.
- **Shape:** notch (cięcie 8px), bez zaokrągleń; wysokości 32 / 40 / 44px (sm / md / lg), padding poziomy 14 / 16 / 24px.
- **Primary:** żółte tło `--accent`, czarny tekst; hover `--accent-hover`; active przyciemnienie (`brightness 0.9`).
- **Secondary:** `--surface-raised` z wewnętrznym obrysem `--border-strong`; hover: `--surface-hover`, tekst i obrys cyjan.
- **Ghost:** tekst `--foreground-muted`, hover tło `--surface-raised` i tekst `--foreground`.
- **Danger:** pełne `--danger` z ciemnym tekstem; tylko dla akcji nieodwracalnych w karcie zapytania.
- **Hover / Focus:** jednorazowy jitter 0.28s (2 kroki), przejścia koloru 150ms; focus = pierścień 2px żółty z odsunięciem 2px na kolorze tła; disabled 40% krycia.

### Chips
- **Badge** (`components/ui/badge.tsx`): mono 11px wersaliki, padding 2×8px, kwadratowy, półprzezroczyste tło + wewnętrzny obrys w kolorze tonu. Tony: `neutral` (terminy przyszłe, brak terminu, etap sprzedaży), `danger` (po terminie, z poświatą), `terracotta` (dziś), `sage` (sukces), `accent` (cyjan — segment firmy), `warning` (nieużywany).
- **GroupBadge** (`components/ui/group-badge.tsx`): ta sama forma, kolor z `groupNeon` — tło 12% i obrys 45% neonu grupy. Jedyny dopuszczalny chip grupy operacyjnej.
- Chip terminu na pulpicie ma min. szerokość 5.5rem i wyśrodkowany tekst, żeby wiersze trzymały linię.

### Cards / Containers
- **Corner Style:** panel HUD, cięcie 14px.
- **Background:** `--surface` 90% z rozmyciem tła 2px i cyjanową poświatą 5% wygasającą w pierwszych 120px.
- **Shadow Strategy:** obrys wewnętrzny (patrz Elevation & Depth).
- **Border:** nagłówek karty oddzielony linią `--border`.
- **Internal Padding:** 16px pionowo / 20px poziomo; tytuł karty w głosie Title, licznik `[n]` mono po prawej.

### Inputs / Fields
- **Style:** kwadratowe, wysokość 40px, tło `--surface-raised` 80%, wewnętrzny obrys `--border`, dolna linia `--border-strong`; etykieta nad polem mono 11px wersaliki `--foreground-muted`.
- **Hover:** dolna linia cyjan 50%.
- **Focus:** dolna linia żółta, pełne tło i żółta poświata pod polem; bez domyślnego outline.
- **Error / Disabled:** `aria-invalid` zmienia dolną linię na `--danger`; disabled 50% krycia.
- **Szybkie szukanie (pulpit):** pole 48px w mono, ikona lupy w żółtym, czarne tło 50%, żółty przycisk-notch ze strzałką wewnątrz pola.

### Navigation
- **Sidebar:** 15rem, `--sidebar` 95%, u góry pasy ostrzegawcze 4px; marka „INNDES” (glitch) + `//CRM` mono cyjan. Sekcje (Praca, Baza, Dane, Wkrótce) z etykietą mono 10.5px poprzedzoną magentowym `//`. Pozycje w głosie Control z ikoną 16px (stroke 1.75): spoczynek `--foreground-muted`, hover cyjan na tle cyjanu 7% z jitterem, aktywna = żółty blok notch z czarnym tekstem + świecąca belka 3px na krawędzi. Pozycje „Wkrótce” wyszarzone do 40% i nieklikalne. Na dole profil i użytkownicy (Geist 14px), potem awatar inicjałów, imię, rola w cyjanie i wylogowanie (hover magenta).
- **Mobile:** dolny pasek z żółtą linią 40% i poświatą u góry; aktywna pozycja = żółty kafel notch pod ikoną i żółta etykieta.
- **Zakładki widoków:** Control 13px, aktywna = żółty tekst z żółtym podkreśleniem 2px, nieaktywna hover cyjan.

### Tytuł ekranu
`PageTitle`: głos Headline z glitchem i podziałem RGB, licznik `[n]` mono cyjan. Każdy ekran listy zaczyna się od niego, akcja główna stoi po prawej w tym samym wierszu. Bez etykiet nad tytułem.

### Tafla KPI
Panel HUD 14px z obrysem w kolorze tafli (55%), gradientem tafli od prawego górnego rogu (22%) i akcentem 2px u góry; etykieta mono z rombem, liczba w głosie Numeric z poświatą, chip zmiany procentowej (`--kpi-up` / `--kpi-down` na czarnym tle) i „poprz. miesiąc”, na dole linia trendu z 8 tygodni: proste odcinki od zera, poświata `drop-shadow`, romb na końcu, odsłaniana maską od lewej. Tylko prawdziwe dane, bez kwot.

### Pasek statusu
Panel HUD 8px na czarnym 60%, mono 11px wersaliki: blok zegara na żółtym, data, przewijana taśma liczników (40s, dwie kopie, ukryta przed czytnikami), alarm „po terminie” na `--danger` 15% z mrugającym punktem (`neon-hum`).

### Efekty i ruch
- **Boot ekranu** (każda nawigacja przez `template.tsx`): 0.45s, `cubic-bezier(0.16, 1, 0.3, 1)`, z rozmycia 4px i przesunięcia 8px; dzieci `.stagger` co 60ms.
- **Glitch** tytułów i marki: cyjanowa i magentowa kopia tekstu widoczna tylko w kilku klatkach na cykl 3.2s (~6% czasu); poza klatkami pseudo-elementy są ukryte.
- **Liczby** nabijane w CSS od 0 do wartości w 1.1s; wartość końcowa jest wartością bazową.
- **Linia trendu** odsłaniana 1.4s; **siatka podłogi** w perspektywie (magenta/cyjan, 56px) przesuwa się co 3.5s; **kursor** `_` miga co 1.1s; **neon-hum** delikatnie przygasa (do 82%) w cyklu 6s.

**The Reduced Motion Rule.** Każda animacja i przejście jest wyłączane globalnie przy `prefers-reduced-motion: reduce`, a każdy efekt jest zbudowany tak, żeby stan spoczynkowy był stanem końcowym: liczby pokazują wynik, linie trendu są narysowane, kopie glitcha są ukryte, a zostaje statyczny podział RGB i statyczne skanlinie. Nowy efekt bez tej gwarancji nie wchodzi. Żadna duża płaszczyzna nie miga częściej niż 3 razy na sekundę.

## Do's and Don'ts

### Do:
- **Do** brać kolory wyłącznie z tokenów `app/globals.css` (klasy Tailwind `bg-surface`, `text-cyan`, `text-danger` itd. albo `var(--token)`).
- **Do** liczyć kolor grupy przez `groupNeon` z `lib/ui/urgency.ts` i renderować chip grupy operacyjnej przez `GroupBadge`.
- **Do** oznaczać terminy przez Badge: po terminie `danger`, dziś `terracotta`, pozostałe `neutral`.
- **Do** zaczynać ekrany od `PageTitle` (glitch + RGB + licznik `[n]`).
- **Do** stawiać obrys paneli HUD jako cień wewnętrzny, a poświatę na osobnym, nieprzyciętym elemencie.
- **Do** pisać numery, daty i liczniki w JetBrains Mono z cyframi tabelarycznymi, a etykiety UI po polsku z `lib/enums.ts`.
- **Do** budować każdy nowy efekt tak, by przy reduced-motion zostawał gotowy, statyczny stan końcowy.

### Don't:
- **Don't** używać żółtego `--accent` jako koloru statusu ani do „na dziś” (to `--terracotta`), ani dokładać nowych nieinteraktywnych żółtych bloków.
- **Don't** składać chipu grupy operacyjnej ręcznie z `Badge` ani nadawać grupom kolorów poza `groupNeon`.
- **Don't** wprowadzać kolorów ad hoc ani kolorów marki INNDES (granat, kobalt, terakota, szałwia) do tego świata.
- **Don't** zaokrąglać rogów komponentów; forma to cięcie 45°.
- **Don't** dawać zewnętrznego `box-shadow` elementom `.hud` ani `.notch` — `clip-path` go obetnie.
- **Don't** używać logotypów, postaci, nazw, cytatów ani elementów interfejsu z Cyberpunk 2077 / Edgerunners; tylko klimat gatunku.
- **Don't** stawiać etykiet-„kickerów” nad nagłówkami; prefiks `//` żyje tylko w etykietach sekcji nawigacji i sufiksie marki `//CRM`.
- **Don't** wracać do jasnej płyty powitalnej ani pasteli poprzedniego świata.
- **Don't** pokazywać zmyślonych liczb ani kwot w taflach i wykresach.
