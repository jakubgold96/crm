---
name: INNDES CRM
description: Ciemna konsola dnia dla zespołu INNDES — jedna jasna płyta powitalna, nasycone tafle sprzedaży, spokojna praca na listach.
colors:
  background: "#0b0d12"
  sidebar: "#0b0d12"
  surface: "#12151c"
  surface-raised: "#191d27"
  foreground: "#e9ecf2"
  foreground-muted: "#939bab"
  border: "#232835"
  border-strong: "#353b4a"
  accent: "#8199ff"
  accent-hover: "#9bafff"
  accent-foreground: "#0b0d12"
  terracotta: "#ffb26b"
  terracotta-bg: "rgb(255 178 107 / 0.12)"
  sage: "#6edb9a"
  sage-bg: "rgb(110 219 154 / 0.12)"
  danger: "#ff7b6e"
  danger-bg: "rgb(255 123 110 / 0.12)"
  warning-fg: "#ffd36e"
  warning-bg: "rgb(255 210 110 / 0.12)"
  hero-bg: "#eceef1"
  hero-bg-2: "#f8f9fa"
  hero-fg: "#12141a"
  hero-muted: "#5a6170"
  hero-line: "#d9dce2"
  hero-field: "#ffffff"
  hero-ink-hover: "#262a33"
  hero-danger: "#b22d1b"
  hero-danger-bg: "#fde4df"
  hero-today: "#8a4a0c"
  hero-today-bg: "#ffecd6"
  greet-1: "#2f7cf6"
  greet-2: "#8b5cf6"
  greet-3: "#e04fa0"
  kpi-1-from: "#11155a"
  kpi-1-to: "#2733c4"
  kpi-1-line: "#8ff09c"
  kpi-2-from: "#0c1f8f"
  kpi-2-to: "#234ee6"
  kpi-2-line: "#ffffff"
  kpi-3-from: "#0a2722"
  kpi-3-to: "#16584a"
  kpi-3-line: "#e3fff3"
  kpi-4-from: "#34092c"
  kpi-4-to: "#7d1759"
  kpi-4-line: "#c8f25c"
  kpi-up: "#8ff09c"
  kpi-down: "#ffb3b3"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.85rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  kpi-figure:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "\"ss01\", \"cv11\""
  caption:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  plate: "1.75rem"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    textColor: "{colors.foreground-muted}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
  button-danger:
    backgroundColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "40px"
  button-hero-ink:
    backgroundColor: "{colors.hero-fg}"
    textColor: "{colors.hero-field}"
    rounded: "{rounded.full}"
    padding: "0 16px"
    height: "36px"
  button-hero-ink-hover:
    backgroundColor: "{colors.hero-ink-hover}"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "0 14px"
    height: "40px"
  hero-search:
    backgroundColor: "{colors.hero-field}"
    textColor: "{colors.hero-fg}"
    rounded: "{rounded.full}"
    padding: "6px 6px 6px 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "16px 20px"
  hero-plate:
    backgroundColor: "{colors.hero-bg}"
    textColor: "{colors.hero-fg}"
    rounded: "{rounded.plate}"
    padding: "48px"
  kpi-tile:
    backgroundColor: "{colors.kpi-1-to}"
    textColor: "{colors.hero-field}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  badge-neutral:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground-muted}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-terracotta:
    backgroundColor: "{colors.terracotta-bg}"
    textColor: "{colors.terracotta}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-sage:
    backgroundColor: "{colors.sage-bg}"
    textColor: "{colors.sage}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  nav-item:
    textColor: "{colors.foreground-muted}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  nav-item-active:
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
---

# Design System: INNDES CRM

## Overview

**Creative North Star: "Ciemna konsola dnia"**

INNDES CRM to prawie czarna, chłodna powłoka (`background`), w której praca toczy się na spokojnych, ciemnych kartach i listach, a dwa miejsca dostają światło i kolor: jasna, perłowa płyta powitalna na pulpicie (dzień już rozpisany) i rząd czterech nasyconych tafli sprzedaży z ośmiotygodniową linią trendu. Kierunek przypiął właściciel produktu ze zrzutu referencyjnego (2026-10-30); zastępuje wcześniejszą jasną paletę granat/kobalt/terakota/szałwia.

Gęstość jest robocza, nie wystawowa: tekst 14px, wiersze tabeli ~42px, Geist jako jedyny krój z cyframi tabelarycznymi wszędzie, gdzie stoją liczby i daty. Kształty są miękkie i powtarzalne — pigułki dla akcji i statusów, zaokrąglenia 12–16px dla pól i kart. Głębia to głównie tonalne warstwy (background → surface → surface-raised) i cienkie obramowania; cień jest miękki i nisko pod kartą, nigdy twardy.

Konwencja nazw: tokeny zachowały nazwy z jasnej wersji, żeby każdy ekran przeszedł na nowy świat bez przepisywania klas. `--terracotta` znaczy dziś „na dziś / miękkie ostrzeżenie” (ciepły pomarańcz, nie terakota), `--sage` znaczy „sukces / zrobione / wygrane” (miętowa zieleń). Płyta powitalna ma własny jasny zestaw `--hero-*`, tafle KPI — `--kpi-N-from` / `--kpi-N-to` / `--kpi-N-line` (N = 1–4), gradient imienia — `--greet-1..3`.

**Key Characteristics:**
- Prawie czarna, chłodna powłoka; sidebar w tym samym tonie co tło, bez ramki.
- Jedna jasna wyspa (płyta powitalna) i cztery nasycone tafle KPI — jedyne duże pola koloru.
- Chłodny błękit `accent` z ciemnym tekstem jako jedyny kolor akcji w powłoce.
- Geist, jedna rodzina, cyfry tabelaryczne.
- Pigułki dla przycisków, statusów i aktywnej nawigacji.

## Colors

Chłodna, niemal achromatyczna powłoka z jednym błękitnym akcentem akcji, trzema sygnałami stanu i dwoma zamkniętymi wyspami koloru (płyta powitalna, tafle KPI).

### Primary
- **Chłodny błękit akcji** (`accent`, hover `accent-hover`): przycisk główny, aktywna zakładka, hover linków w listach, obrys fokusu (2px, offset 2px), karetka, zaznaczenie tekstu (35% krycia). Na przycisku zawsze z `accent-foreground` (ciemny tekst, kontrast > 7:1), nigdy z białym.

### Secondary
- **Ciepły pomarańcz „na dziś”** (`terracotta` / `terracotta-bg`): termin przypada dziś, miękkie ostrzeżenie. Nazwa historyczna.
- **Miętowa zieleń sukcesu** (`sage` / `sage-bg`): zrobione, wygrane, potwierdzenia. Nazwa historyczna.
- **Koralowa czerwień** (`danger` / `danger-bg`): po terminie, przegrane, błędy walidacji. Na przycisku „danger” zawsze z ciemnym `danger-foreground`.
- **Złoto ostrzeżenia** (`warning-fg` / `warning-bg`): ostrzeżenia nie związane z terminem.

Tła stanów to ten sam odcień na 12% krycia — chip czyta się kolorem tekstu, nie plamą.

`surface-hover` to stan hover przycisku drugorzędnego (o stopień jaśniej niż `surface-raised`).

### Tertiary
- **Perłowa płyta** (`hero-bg` → `hero-bg-2`, tekst `hero-fg`, drugorzędny `hero-muted`, linie `hero-line`, pole `hero-field`): wyłącznie wewnątrz płyty powitalnej. Ma własne warianty stanów o ciemnym tekście na jasnym tle: `hero-danger` / `hero-danger-bg` (po terminie), `hero-today` / `hero-today-bg` (dziś).
- **Gradient powitania** (`greet-1` → `greet-2` → `greet-3`, błękit → fiolet → róż): tylko imię w nagłówku powitania; `greet-1` służy też jako pierścień fokusu i karetka w polu szybkiego wyszukiwania na płycie.
- **Tafle KPI**: głębokie indygo (`kpi-1-*`), królewski błękit (`kpi-2-*`), butelkowa zieleń (`kpi-3-*`), śliwkowa magenta (`kpi-4-*`); gradient 140° `from → to`, jasna linia trendu `kpi-N-line`; zmiana procentowa w `kpi-up` / `kpi-down` (odwracane, gdy wzrost jest zły, np. „Przegrane”).

### Neutral
- **Tło nocne** (`background`, `sidebar`): powłoka i sidebar — jeden ton, sidebar oddziela się układem, nie kolorem.
- **Powierzchnia** (`surface`): karty, kontener tabeli, karty listy mobilnej.
- **Powierzchnia podniesiona** (`surface-raised`): pola formularzy, przycisk drugorzędny, chip neutralny, licznik grupy.
- **Tekst** (`foreground`) i **tekst drugorzędny** (`foreground-muted`): treść i metadane; nieaktywne pozycje nawigacji „Wkrótce” to `foreground-muted` na 55%.
- **Linie** (`border`, `border-strong`): podziały wierszy, obrys kart i pól; `border-strong` na hover pól i jako kolor pasków przewijania.
- Nakładki bieli na ciemnym (`white` 4% hover, 6% aktywna pozycja, 15% obrys aktywnej pigułki) są częścią języka nawigacji i wierszy tabel.

### Named Rules
**The Dwie Wyspy Rule.** Duże pola koloru istnieją tylko w dwóch miejscach: płyta powitalna i tafle KPI. Reszta interfejsu żyje w tonach powłoki plus `accent` i chipy stanów.

**The Własny Zestaw Rule.** Wewnątrz płyty powitalnej używa się wyłącznie tokenów `--hero-*` (i `--greet-*`); tokeny powłoki (`foreground`, `danger`, `terracotta`) są tam nieczytelne. Poza płytą `--hero-*` nie występuje.

**The Stare Nazwy Rule.** `--terracotta` = na dziś / miękkie ostrzeżenie, `--sage` = sukces. Nie zmieniaj nazw i nie dodawaj synonimów (`--orange`, `--success`); nowe komponenty biorą kolory z `app/globals.css`, nie wprowadzają ad-hoc wartości.

## Typography

**Display Font:** Geist (z ui-sans-serif, system-ui, sans-serif)
**Body Font:** Geist (ta sama rodzina)

**Character:** Jedna rodzina geometryczno-groteskowa w wariancie zmiennej grubości, serwowana z repo (`app/fonts/Geist-Variable.woff2`, SIL OFL). Hierarchię budują rozmiar, grubość i ciasne światło w dużych stopniach; zestawy `ss01`, `cv11` włączone globalnie.

### Hierarchy
- **Display**: powitanie na płycie; na mobile 2.1rem. Jedyny nagłówek o grubości 500 i trackingu −0.03em.
- **KPI figure**: liczba w tafli KPI (1.875rem na mobile); liczby w płycie powitalnej to ten sam charakter w 1.5rem.
- **Headline**: tytuł strony (np. „Zapytania (12)”).
- **Title**: tytuł karty, nazwa marki w sidebarze; nagłówki grup w listach to 14px/600.
- **Body**: treść list, tabel, pól, przycisków (przyciski 500).
- **Caption**: chipy, daty w listach, etykiety liczb na płycie, podpisy w taflach (13px dla etykiet pól i nagłówków tafli).
- **Label**: wersaliki — wyłącznie etykiety sekcji nawigacji (tracking 0.08em) i nagłówki kolumn tabel (tracking 0.06em).

### Named Rules
**The Cyfry Tabelaryczne Rule.** Każda liczba, data i licznik używa `tabular-nums` (klasa `.tabular`, tabele domyślnie). Kolumny i tafle nie mogą „drgać”.

**The Jeden Krój Rule.** Geist i nic więcej; wyróżnienie robi grubość i rozmiar, nie drugi krój.

## Layout

Powłoka: sidebar 15rem (`w-60`) przyklejony na pełną wysokość od `md` (768px) w górę; poniżej — górny pasek 56px z marką i ikoną profilu oraz dolna, przyklejona nawigacja z pięcioma pozycjami (treść ma 96px dolnego zapasu). Kolumna treści ma maksymalnie 88rem, marginesy 16px (mobile) / 32px (desktop), 24px u góry.

Rytm pionowy pulpitu: 20px między płytą, rzędem KPI i kartami. Płyta powitalna: jedna kolumna na mobile, od `lg` (1024px) dwie kolumny 1.1fr / 1fr z pionową linią `hero-line` i min. wysokością 25rem; padding 20 / 32 / 48px. Tafle KPI: 2 kolumny do `xl` (1280px), potem 4; odstęp 12 / 16px. Karty list: jedna kolumna, od `lg` dwie.

Listy robocze (Zapytania): tabela w zaokrąglonym kontenerze od `md`, poniżej — stos kart (`surface`, 16px, padding 16px). Tabele są `table-fixed` z kilkoma kolumnami i obcinaniem tekstu; kolumn nie dokłada się bez końca — szczegóły idą do karty rekordu. Filtry: pole wyszukiwania + sortowanie w rzędzie, pięć selectów w siatce, na mobile chowane za przyciskiem.

## Elevation & Depth

Głębia jest hybrydowa: przede wszystkim tonalne warstwy (`background` → `surface` → `surface-raised`) i 1px obramowania; cień jest zawsze miękki, rozmyty i ujemnie rozciągnięty, tak że czyta się jako zaciemnienie pod elementem, nie jako krawędź.

### Shadow Vocabulary
- **Karta** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.03), 0 12px 32px -16px rgb(0 0 0 / 0.6)`): każda karta w powłoce.
- **Płyta powitalna** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.9), 0 30px 60px -30px rgb(0 0 0 / 0.9)`): jasna górna krawędź i głęboki cień, który odkleja wyspę od czarnego tła.
- **Tafla KPI** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.18), inset 0 0 28px color-mix(in srgb, var(--kpi-N-to) 45%, transparent), 0 18px 40px -20px rgb(0 0 0 / 0.8)`): wewnętrzna poświata w odcieniu tafli.
- **Pole szybkiego wyszukiwania** (`box-shadow: 0 1px 2px rgb(18 20 26 / 0.06), 0 8px 24px -12px rgb(18 20 26 / 0.25)`): tylko na płycie.

### Named Rules
**The Miękki Cień Rule.** Cienie mają duże rozmycie i ujemny spread; żadnych twardych przesunięć bez rozmycia.

## Shapes

Miękka, spójna geometria w czterech stopniach: pigułka (`full`) dla przycisków, chipów, pola szybkiego wyszukiwania i ikon na mobile; 12px (`xl`) dla pól formularzy, pozycji nawigacji i wierszy listy „Dzisiaj”; 16px (`2xl`) dla kart, tafli KPI, kontenera tabeli i kart listy mobilnej; 1.75rem (`plate`) wyłącznie dla płyty powitalnej. 8px (`lg`) tylko dla małych przycisków-ikon. Obramowania 1px; tafle KPI mają obrys z odcienia tafli (`color-mix(in srgb, var(--kpi-N-to) 65%, white 22%)`), nie neutralną biel. Awatar to koło z inicjałami (`foreground` na `background`).

## Components

### Buttons
Pigułki o zdecydowanym, spokojnym charakterze.
- **Shape:** pełne zaokrąglenie; wysokości 32 / 40 / 44px (sm / md / lg).
- **Primary:** `accent` z ciemnym `accent-foreground`, 14px/500, ikona 16px z odstępem 8px.
- **Secondary:** `surface-raised` z obrysem `border-strong`.
- **Ghost:** sam tekst `foreground-muted`; hover dostaje `surface-raised` i `foreground`.
- **Danger:** wypełnienie `danger` z ciemnym tekstem.
- **Hover / Focus:** zmiana koloru w 150ms ease-out; wciśnięcie skaluje do 0.98; fokus to pierścień 2px `accent` z offsetem 2px w kolorze tła; wyłączony 45% krycia.
- **Na płycie powitalnej:** przyciski atramentowe (`hero-fg` z białym tekstem, hover `hero-ink-hover`, 36px) i obrysowane (`hero-line`, hover białe tło) — nie używa się tam `accent`.

### Chips
- **Style:** pigułka 12px/500, tabelaryczne cyfry; tło stanu na 12% + tekst stanu (`terracotta`, `sage`, `danger`, `warning`), akcent na 15% dla grupy operacyjnej, neutralny z obrysem `border` na `surface-raised` dla etapu sprzedaży.
- **Terminy:** po terminie → `danger`, dziś → `terracotta`, przyszły → neutralny, brak → neutralny „Brak terminu”. Na płycie te same znaczenia w `hero-danger*` / `hero-today*`, min. szerokość 4.75rem.
- Grupa operacyjna i etap sprzedaży to zawsze dwa osobne chipy obok siebie.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** `surface` z obrysem `border`.
- **Shadow Strategy:** „Karta” z Elevation & Depth.
- **Internal Padding:** nagłówek 20px × 16px z dolną linią `border`, treść 20px × 16px; licznik w nagłówku po prawej, `foreground-muted`.

### Inputs / Fields
- **Style:** 40px, zaokrąglenie 12px, `surface-raised`, obrys `border`, placeholder `foreground-muted` 80%; etykieta 13px/500 `foreground-muted` nad polem.
- **Focus:** obrys `accent` 60% + pierścień 2px `accent` 30%; hover → `border-strong`.
- **Error / Disabled:** `aria-invalid` → obrys `danger`; wyłączone 50% krycia. Select i textarea dzielą ten sam styl.

### Navigation
- **Sidebar:** marka „INNDES” `foreground` + „CRM” `foreground-muted` (15px/600). Sekcje Praca / Baza / Dane / Wkrótce z etykietami w wersalikach (11px, `foreground-muted` 70%). Pozycje 14px/500, ikona liniowa 16px (stroke 1.75), zaokrąglenie 12px. Aktywna: obrysowana pigułka (biały 15% obrys, biały 6% tło, `foreground`) plus znacznik 3×20px przy lewej krawędzi sidebaru. Hover: biały 4%. „Wkrótce”: nieklikalne, 55% krycia, tooltip „Dostępne w kolejnej fazie”. Na dole profil/użytkownicy i stopka z awatarem, rolą i wylogowaniem nad linią `border`.
- **Mobile:** dolny pasek `sidebar` 95% z rozmyciem tła, pięć pozycji (ikona 18px nad etykietą 11px); aktywna ikona w pigułce 48×28px na białym 8%. Szanuje `safe-area-inset-bottom`.
- **Zakładki widoków:** tekst 14px/500 nad linią `border`; aktywna w `accent` z podkreśleniem 2px `accent`.

### Tabela listy
Kontener 16px na `surface` z obrysem `border`; nagłówki kolumn 11px w wersalikach (tracking 0.06em, `foreground-muted`); wiersze z podziałem `border`, padding 16px × 10px, hover biały 4%; pierwsza kolumna (numer) `foreground`/500 z hoverem `accent`, pozostałe `foreground-muted` z obcięciem; termin jako chip. Nad tabelą nagłówek grupy 14px/600 z licznikiem w pigułce `surface-raised`.

### Płyta powitalna (signature)
Jasna wyspa na pulpicie: gradient 160° `hero-bg → hero-bg-2` z białą poświatą radialną w prawej części, zaokrąglenie 1.75rem. Lewa część: powitanie (Display) z imieniem w gradiencie `greet-*`, podtytuł 15px `hero-muted` z datą, trzy liczby (etykieta 12px, wartość 24px/600; po terminie > 0 → `hero-danger`), pole szybkiego wyszukiwania (pigułka `hero-field`, pierścień `hero-line`, fokus `greet-1`, okrągły przycisk 36px w `hero-fg`), przyciski atramentowe. Prawa część: lista „Dzisiaj” (do 4 pozycji) z chipem terminu, numerem, firmą, następnym krokiem i chevronem przesuwanym o 2px na hover; wiersz na hover biały 80%.

### Tafla KPI (signature)
Gradient 140° `kpi-N-from → kpi-N-to`, biały tekst, min. wysokość 10–10.5rem, padding 16 / 20px. Nagłówek 13px biały 80% z kropką 6px w `kpi-N-line`; liczba (KPI figure); chip zmiany na czarnym 20% w `kpi-up` / `kpi-down` ze strzałką; „poprz. miesiąc”. Na dole linia trendu z 8 tygodni: proste odcinki 2px w `kpi-N-line` bez wygładzania, skala od zera, kropka końcowa 7px jako osobny element (nie elipsa w rozciągniętym SVG).

## Do's and Don'ts

### Do:
- **Do** brać każdy kolor z tokenów w `app/globals.css`; nowy stan = nowy token tam, nie hex w komponencie.
- **Do** stawiać na `accent` ciemny tekst `accent-foreground`.
- **Do** używać `--hero-*` w płycie powitalnej i tylko tam.
- **Do** zachować kolejność i znaczenie tafli KPI 1–4 (indygo, królewski błękit, butelkowa zieleń, śliwkowa magenta) i odwracać kolor zmiany, gdy wzrost jest zły.
- **Do** pokazywać grupę operacyjną i etap sprzedaży jako dwa osobne chipy.
- **Do** dawać tabeli wersję kart poniżej `md` i trzymać tabele wąskie; szczegóły idą do karty rekordu.
- **Do** używać cyfr tabelarycznych dla każdej liczby i daty.
- **Do** szanować `prefers-reduced-motion` (globalnie wyłączone animacje i przejścia).

### Don't:
- **Don't** wprowadzać trzeciej wyspy koloru ani gradientów poza płytą powitalną, imieniem w powitaniu i taflami KPI.
- **Don't** przemianowywać `--terracotta` / `--sage` ani dodawać ich synonimów.
- **Don't** stawiać kickerów / eyebrow w wersalikach nad nagłówkami; wersaliki 11px są zarezerwowane dla etykiet sekcji nawigacji i nagłówków kolumn tabel.
- **Don't** używać twardych cieni bez rozmycia ani białych neutralnych ramek na taflach KPI.
- **Don't** wygładzać linii trendu ani pokazywać w taflach wartości, których nie ma w danych (np. kwot w zł bez tabeli ofert).
- **Don't** pokazywać funkcji z przyszłych faz jako działających — pozycje „Wkrótce” zostają wygaszone i nieklikalne.
