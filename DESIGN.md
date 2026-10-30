---
name: INNDES CRM
description: Nocny HUD dla zespołu INNDES — konsola na czerni Void ze ściętymi panelami, sześcioma kolorami i jednym kobaltowym kolorem akcji.
colors:
  void: "#06070a"
  cobalt: "#3d5afe"
  magenta: "#ff2fa3"
  amber: "#ff8a1e"
  fog: "#aeb6c2"
  pearl: "#f5f7ff"
  background: "#06070a"
  sidebar: "#06070a"
  surface: "rgb(174 182 194 / 0.05)"
  surface-raised: "rgb(174 182 194 / 0.09)"
  surface-hover: "rgb(174 182 194 / 0.14)"
  foreground: "#f5f7ff"
  foreground-muted: "#aeb6c2"
  border: "rgb(174 182 194 / 0.14)"
  border-strong: "rgb(174 182 194 / 0.3)"
  accent: "#3d5afe"
  accent-hover: "#3d5afe"
  accent-foreground: "#f5f7ff"
  terracotta: "#ff8a1e"
  terracotta-bg: "rgb(255 138 30 / 0.12)"
  sage: "#f5f7ff"
  sage-bg: "rgb(245 247 255 / 0.08)"
  danger: "#ff2fa3"
  danger-bg: "rgb(255 47 163 / 0.14)"
  danger-foreground: "#06070a"
  warning-fg: "#ff8a1e"
  warning-bg: "rgb(255 138 30 / 0.12)"
  kpi-1: "#3d5afe"
  kpi-2: "#ff8a1e"
  kpi-3: "#f5f7ff"
  kpi-4: "#ff2fa3"
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
    textColor: "{colors.pearl}"
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
    backgroundColor: "rgb(61 90 254 / 0.2)"
    textColor: "{colors.pearl}"
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
    backgroundColor: "rgb(61 90 254 / 0.07)"
    textColor: "{colors.pearl}"
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

INNDES CRM to ciemna, gęsta konsola, do której zespół „loguje się” rano jak do systemu: czerń Void, skanlinie nad całym interfejsem, panele ze ściętymi rogami obrysowane cienką linią mgły tytanowej, neon w kolorze pilności i jeden elektryczny kobalt jako kolor akcji. Kierunek przypiął właściciel produktu: cyberpunk w klimacie gatunku, „abstract hardcore”, efekty (glitch, skanlinie, neon) na wszystkich ekranach — także na liście zapytań, zadaniach i logowaniu, nie tylko na pulpicie. Od 2026-10-31 cały świat mówi wyłącznie sześcioma kolorami: Void Black, Electric Cobalt, Synth Magenta, Toxic Amber, Titanium Fog, Holographic Pearl — plus ich przezroczystość i gradienty między nimi.

Hałas wizualny jest podporządkowany pracy. Neon niesie znaczenie (po terminie, na dziś, czekamy na klienta, wygrane), dane siedzą w czcionce monospace z cyframi tabelarycznymi, a każdy efekt ruchu znika przy `prefers-reduced-motion`, zostawiając statyczny, w pełni czytelny ekran. Świat jest gatunkowy, nie licencjonowany: żadnych logotypów, postaci, nazw ani elementów interfejsu z gry/anime Cyberpunk 2077 / Edgerunners. Kolory marki INNDES (granat, terakota, szałwia) nie wchodzą do tego świata; kobalt istnieje tu wyłącznie jako Electric Cobalt z szóstki.

To jest pełna wymiana wcześniejszego świata (ciemna powłoka z jasną perłową płytą powitalną, sam Geist). Jasna płyta i pastelowe akcenty są anty-wzorcem: perła jest kolorem tekstu i sukcesu, nigdy dużego tła.

**Key Characteristics:**
- Grunt Void z dwiema rozmytymi poświatami (magenta z prawej u góry, kobalt z lewej u dołu) i skanliniami nad wszystkim.
- Sześć kolorów, nic poza nimi; powierzchnie i linie to mgła tytanowa w przezroczystości.
- Zero zaokrągleń; dwie sylwetki: panel HUD (jeden ścięty róg) i „notch” (dwa przeciwległe ścięte rogi).
- Magenta i bursztyn = pilność, kobalt = akcja i spokojna informacja, perła = tekst i sukces. Te systemy się nie mieszają.
- Trzy głosy pisma: Chakra Petch (nagłówki, liczby, przyciski — wersaliki), Geist (tekst), JetBrains Mono (numery, daty, etykiety danych).
- Ruch krótki i rzadki: boot ekranu, okresowy glitch tytułów, rysujące się linie trendu, przewijana taśma; całość wyłączana przy reduced-motion.

## Colors

Sześć kolorów na czerni: jeden chłodny kolor akcji, dwa gorące kolory pilności, dwa neutralne światła i grunt. Wszystko inne to te same kolory z przezroczystością albo gradient między nimi.

### Primary
- **Electric Cobalt** (`--cobalt`, rola `--accent`): przycisk główny, przycisk szukania, aktywna pozycja nawigacji (blok w sidebarze, kafel „notch” w dolnym pasku mobilnym, podkreślenie aktywnej zakładki), pierścień focusu, dolna linia pola w focusie i jego poświata, kursor tekstu, podkreślenia linków, awatar inicjałów. Na pełnym kobalcie tekst jest zawsze perłowy (`--accent-foreground`). `--accent-hover` ma tę samą wartość — hover przycisku nie zmienia koloru, sygnałem jest jitter. Kobalt jest też spokojnym, informacyjnym neonem: grupa „czekamy na klienta”, etapy sprzedaży bez własnej pilności, zadania nadchodzące i bez terminu, odczyt „Aktywne”, tafla „Nowe zapytania”.

### Secondary
- **Synth Magenta** (`--magenta`, rola `--danger`): po terminie, błąd, „wymaga działania”, „przegrane”, alarm w pasku statusu, pełne tło przycisku nieodwracalnego (z tekstem Void). Poza znaczeniem alarmu: znaki `//` w etykietach sekcji nawigacji, strzałki taśmy, migający kursor `_`, kanał RGB w glitchu, poświata w tle, linia siatki podłogi, hover wylogowania i hover podkreślenia linku. Zaznaczenie tekstu: tło magenta, tekst Void.

### Tertiary
- **Toxic Amber** (`--amber`, rola `--terracotta`, tło `--terracotta-bg`): termin dziś, grupa „do przypomnienia”, odczyt „Na dziś”, tafla „Oferty wysłane”, pasy ostrzegawcze. Miękkie ostrzeżenie. `--warning-fg` / `--warning-bg` to ten sam bursztyn (ton `warning` w Badge, obecnie nieużywany na ekranach).

### Neutral
- **Void Black** (`--void`, role `--background`, `--sidebar`): grunt strony pod poświatami, sidebar i dolny pasek mobilny (95%), tekst na pełnej magencie, tło chipu zmiany procentowej (60%), skanlinie.
- **Holographic Pearl** (`--pearl`, role `--foreground`, `--sage`, `--accent-foreground`): cały tekst główny, tekst na kobalcie, tekst każdego chipu grupy, tekst linków, aktywna zakładka, sukces i „wygrane” (`--sage-bg` = perła 8%), tafla „Wygrane”, dobra zmiana procentowa.
- **Titanium Fog** (`--fog`, rola `--foreground-muted`): tekst pomocniczy, etykiety, nieaktywna nawigacja, licznik `[n]` przy tytule, sufiks `//CRM`, rola użytkownika, neutralna zmiana procentowa. W przezroczystości buduje całą materię: powierzchnie `--surface` (5%) → `--surface-raised` (9%) → `--surface-hover` (14%) i linie `--border` (14%), `--border-strong` (30%).

### Tafle KPI
- `--kpi-1` kobalt (nowe zapytania), `--kpi-2` bursztyn (oferty wysłane), `--kpi-3` perła (wygrane), `--kpi-4` magenta (przegrane). Strzałka zmiany: dobra = perła, zła = magenta, bez zmiany = mgła; dla „Przegrane” logika jest odwrócona (wzrost = źle).

### Named Rules
**The Six Colours Rule.** W `app/`, `components/` i `lib/` wolno użyć tylko sześciu kolorów, ich przezroczystości (`rgb(61 90 254 / 0.35)`, `bg-cobalt/20`) i gradientów między nimi. Żaden inny hex ani `rgb()`, żadne wbudowane kolory Tailwinda (`white`, `black`, `red-500`…) ani nazwane kolory CSS. Pilnuje tego `tests/unit/palette.test.ts`; nowy kolor = czerwony test. Uwaga: test traktuje `amber` jako wbudowaną nazwę Tailwinda, więc bursztyn w klasach idzie przez `terracotta` (`text-terracotta`, `bg-terracotta-bg`) albo `var(--amber)`, nigdy `text-amber`.

**The Cobalt Action Rule.** Kobalt `--accent` oznacza „tu kliknij / tu jesteś / tu piszesz”: akcja główna, aktywna nawigacja, focus, kursor. Jedyny status, jaki niesie, to spokój (czeka, nadchodzi, aktywne) — nigdy pilność; pilność to wyłącznie magenta i bursztyn. Istniejące nieinteraktywne pełne bloki kobaltu (imię w powitaniu, blok zegara w pasku statusu, awatar inicjałów) są zamkniętą listą sygnatur pulpitu i powłoki, nie wzorcem do powielania.

**The Small Cobalt Rule.** Kobalt na Void ma kontrast ok. 3.9:1, więc mały tekst (poniżej 18px regular / 14px bold) nigdy nie jest kobaltowy — idzie w perle albo mgle. Kobalt niesie wypełnienia (z perłowym tekstem, 4.8:1), obrysy, pierścienie, ikony, podkreślenia, romby i duże liczby lub nagłówki grup (18px bold i więcej). Link to perłowy tekst z kobaltowym podkreśleniem 2px.

**The Urgency Map Rule.** Kolor grupy jest liczony w jednym miejscu, `lib/ui/urgency.ts` (`groupNeon`): `wymaga_dzialania` i `przegrane` = `--danger` (magenta); `do_przypomnienia` = `--terracotta` (bursztyn); `czekamy_na_klienta` = `--cobalt`; `wygrane` = `--sage` (perła); każdy inny klucz (pozostałe etapy sprzedaży) = `--kpi-1` (kobalt). Nagłówki grup, obrys tabeli grupy i chipy grupy biorą kolor z tej funkcji; chip grupy operacyjnej to zawsze `GroupBadge`, nigdy ręcznie złożony `Badge`. Na liście zadań ta sama logika: po terminie = magenta, dziś = bursztyn, reszta = kobalt.

**The Legacy Name Rule.** Nazwy ról zostały z poprzednich światów i nie opisują koloru: `--terracotta` = bursztyn, `--sage` = perła (sukces), `--danger` = magenta, `--accent` = kobalt; `--neon-cyan` i `--neon-magenta` to dawne aliasy (kobalt, magenta), których nowy kod nie używa. Nie zmieniać nazw ról i nie dodawać równoległych tokenów; kolory wchodzą tylko przez `:root` w `app/globals.css` jako alias jednej z sześciu wartości.

## Typography

**Display Font:** Chakra Petch 500/600/700 (z repo, SIL OFL; fallback Geist, system-ui)
**Body Font:** Geist, zmienna grubość 100–900 (z repo przez `next/font/local`, zmienna `--font-geist-sans`)
**Label/Mono Font:** JetBrains Mono, zmienna grubość 100–800 (z repo, SIL OFL)

**Character:** Kanciasta, techniczna Chakra Petch w wersalikach z rozstrzeleniem daje głos HUD-u; neutralny Geist niesie zdania, które trzeba przeczytać; JetBrains Mono z cyframi tabelarycznymi odróżnia dane od prozy.

### Hierarchy
- **Display** (Chakra Petch 700, 2.6rem → 3.75rem → 4.5rem, interlinia 0.95, wersaliki): wyłącznie powitanie „HEY, {IMIĘ}” na pulpicie; imię w kobalcie z rozszczepieniem RGB i migającym magentowym kursorem `_`.
- **Headline** (Chakra Petch 700, 1.5rem → 1.875rem, rozstrzelenie 0.06em, wersaliki): tytuł ekranu przez `PageTitle` — glitch + stały podział kanałów RGB, opcjonalny licznik `[n]` w mono mgle. Marka „INNDES” w sidebarze/logowaniu to ten sam głos (rozstrzelenie 0.12–0.14em).
- **Numeric** (Chakra Petch 700, 2.25rem → 3rem w taflach, 1.875rem → 2.25rem w odczytach, interlinia 1): liczby KPI i odczyty, w kolorze swojego neonu z poświatą tekstu, nabijane od zera.
- **Title** (Chakra Petch 600–700, 15px, rozstrzelenie 0.06–0.08em, wersaliki): tytuły kart; nagłówki grup na listach i „Dzisiaj” w 18px bold (dlatego mogą nieść kobalt).
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

System jest płaski w sensie cieni strukturalnych: głębię budują warstwy tonalne mgły na czerni (`--background` → `--surface` 5% → `--surface-raised` 9% → `--surface-hover` 14%), półprzezroczyste panele z lekkim rozmyciem tła, wewnętrzny obrys 1px i światło neonu. Nad wszystkim leży stała warstwa skanlinii (co 3px pasek Void 35%) z wolną kobaltową wiązką skanującą (6%, 9s), nie przechwytująca kliknięć. Tło strony to Void z dwiema poświatami: magenta 9% w prawym górnym rogu, kobalt 8% w lewym dolnym.

### Shadow Vocabulary
- **Obrys HUD** (`box-shadow: inset 0 0 0 1px var(--hud-line)`): krawędź paneli; kolor przez `--hud-line` (tafle i tabele grup nadpisują go swoim neonem przy 45–55%).
- **Obrys kontrolki** (`box-shadow: inset 0 0 0 1px var(--border-strong)`): przycisk drugorzędny, chip neutralny; na hover przycisku kobalt 60%.
- **Poświata focusu pola** (`box-shadow: inset 0 0 0 1px rgb(61 90 254 / 0.35), 0 6px 20px -12px rgb(61 90 254 / 0.8)`): pole w focusie; szybkie szukanie ma wariant `inset … / 0.3, 0 10px 30px -16px … / 0.8`.
- **Poświata znacznika** (`box-shadow: 0 0 10px <neon>`): romby 8px przy nagłówkach grup, etykietach tafli i na końcu linii trendu.
- **Wskaźnik aktywnej nawigacji** (`box-shadow: 0 0 12px rgb(61 90 254 / 0.9)`): pionowa kobaltowa belka 3px przy aktywnej pozycji sidebara.
- **Alarm chipu** (`inset 0 0 0 1px rgb(255 47 163 / 0.5), 0 0 12px -4px rgb(255 47 163 / 0.7)`): tylko ton `danger` w Badge.
- **Poświata dolnego paska mobilnego** (`0 -10px 30px -12px rgb(61 90 254 / 0.35)`).
- **Lista rozwijana** (`0 16px 40px -12px rgb(6 7 10 / 0.7)`): jedyny cień „podnoszący”, dla podpowiedzi wyboru firmy.
- **Poświata tekstu** (`text-shadow: 0 0 18px` w 55% koloru bieżącego): liczby KPI, odczyty, nagłówki grup.
- **Podział RGB** (`text-shadow: -2px 0 rgb(61 90 254 / 0.6), 2px 0 rgb(255 47 163 / 0.55)`): tytuły ekranów i imię w powitaniu.

### Named Rules
**The Clipped Glow Rule.** Panele `.hud` i kształty `.notch` są wycinane przez `clip-path`, który obcina każdy zewnętrzny `box-shadow`. Krawędź takiego elementu to zawsze cień wewnętrzny (`inset`), a poświata trafia na osobny, nieprzycięty element: romb, belkę wskaźnika, linię trendu, chip, pole formularza.

## Shapes

Zero zaokrągleń na wszystkich komponentach (`0px`). Forma to cięcie pod kątem 45°:
- **Panel HUD**: ścięty prawy górny róg z cienką przekątną krawędzi dorysowaną pseudo-elementem; trzy rozmiary cięcia — 8px (karty mobilne, pasek statusu), 14px (domyślny: karty, tabele grup, tafle), 28px (panel główny pulpitu).
- **Notch**: dwa przeciwległe ścięte rogi 8px (lewy górny i prawy dolny) — przyciski, aktywna pozycja nawigacji, kafel ikony w pasku mobilnym, awatar inicjałów, przycisk szukania.
- **Romb**: kwadrat 7–8px obrócony o 45° jako znacznik koloru (nagłówki grup, etykiety tafli, koniec linii trendu).
- **Pasy ostrzegawcze**: ukośne paski bursztynowe 8px / przerwa 8px pod kątem −45° — górna krawędź sidebara i krótki trapez na górnej krawędzi panelu głównego.
- Linie: obrys 1px, podkreślenie pól 1px (2px w szybkim szukaniu i zakładkach), belka wskaźnika 3px, akcent tafli 2px u góry.

Jedyne okręgi to rozmyte plamy poświaty w tle panelu głównego — nie są czytelne jako kształt.

## Components

### Buttons
Zdecydowane, ścięte bloki z wersalikami; wejście akcji jest krótkim „szarpnięciem” glitcha.
- **Shape:** notch (cięcie 8px), bez zaokrągleń; wysokości 32 / 40 / 44px (sm / md / lg), padding poziomy 14 / 16 / 24px.
- **Primary:** kobaltowe tło `--accent`, perłowy tekst; hover bez zmiany koloru (jitter); active przyciemnienie (`brightness 0.9`).
- **Secondary:** `--surface-raised` z wewnętrznym obrysem `--border-strong`; hover: `--surface-hover`, tekst perłowy, obrys kobalt 60%.
- **Ghost:** tekst `--foreground-muted`, hover tło `--surface-raised` i tekst `--foreground`.
- **Danger:** pełna magenta `--danger` z tekstem Void; tylko dla akcji nieodwracalnych w karcie zapytania.
- **Hover / Focus:** jednorazowy jitter 0.28s (2 kroki), przejścia koloru 150ms; focus = pierścień 2px kobaltowy z odsunięciem 2px na kolorze tła; disabled 40% krycia.

### Chips
- **Badge** (`components/ui/badge.tsx`): mono 11px wersaliki, padding 2×8px, kwadratowy, półprzezroczyste tło + wewnętrzny obrys w kolorze tonu. Tony: `neutral` (mgła na `--surface-raised`; terminy przyszłe, brak terminu, etap sprzedaży), `danger` (magenta na magencie 14%, obrys 50%, z poświatą; po terminie), `terracotta` (bursztyn na bursztynie 12%, obrys 40%; dziś), `sage` (perła na perle 8%, obrys 35%; sukces), `accent` (perłowy tekst na kobalcie 20%, obrys kobalt 70%; segment firmy), `warning` (bursztyn; nieużywany).
- **GroupBadge** (`components/ui/group-badge.tsx`): ta sama forma; tekst zawsze perłowy, kolor z `groupNeon` niesie tylko tło (22%) i obrys (70%). Jedyny dopuszczalny chip grupy operacyjnej.
- Chip terminu na pulpicie ma min. szerokość 5.5rem i wyśrodkowany tekst, żeby wiersze trzymały linię.

### Cards / Containers
- **Corner Style:** panel HUD, cięcie 14px.
- **Background:** `--surface` 90% z rozmyciem tła 2px i kobaltową poświatą 5% wygasającą w pierwszych 120px.
- **Shadow Strategy:** obrys wewnętrzny (patrz Elevation & Depth).
- **Border:** nagłówek karty oddzielony linią `--border`.
- **Internal Padding:** 16px pionowo / 20px poziomo; tytuł karty w głosie Title, licznik `[n]` mono po prawej.

### Inputs / Fields
- **Style:** kwadratowe, wysokość 40px, tło `--surface-raised` 80%, wewnętrzny obrys `--border`, dolna linia `--border-strong`; etykieta nad polem mono 11px wersaliki `--foreground-muted`.
- **Hover:** dolna linia kobalt 50%.
- **Focus:** dolna linia kobaltowa, pełne tło i kobaltowa poświata pod polem; bez domyślnego outline.
- **Error / Disabled:** `aria-invalid` zmienia dolną linię na magentę `--danger`; disabled 50% krycia.
- **Szybkie szukanie (pulpit):** pole 48px w mono, ikona lupy w kobalcie, tło Void 50%, kobaltowy przycisk-notch z perłową strzałką wewnątrz pola.

### Links
Perłowy tekst z kobaltowym podkreśleniem 2px (odsunięcie 4px), hover zmienia podkreślenie na magentę. Numery zapytań i nazwy w wierszach list są w `--foreground` i dostają kobaltowe podkreślenie dopiero na hover. Tekst linku nigdy nie jest kobaltowy.

### Navigation
- **Sidebar:** 15rem, Void 95%, u góry bursztynowe pasy ostrzegawcze 4px; marka „INNDES” (glitch) + `//CRM` mono w mgle. Sekcje (Praca, Baza, Dane, Wkrótce) z etykietą mono 10.5px poprzedzoną magentowym `//`. Pozycje w głosie Control z ikoną 16px (stroke 1.75): spoczynek `--foreground-muted`, hover perłowy tekst na kobalcie 7% z jitterem, aktywna = kobaltowy blok notch z perłowym tekstem + świecąca kobaltowa belka 3px na krawędzi. Pozycje „Wkrótce” wyszarzone do 40% i nieklikalne. Na dole profil i użytkownicy (aktywny profil: kobalt 12% z perłą), potem kobaltowy awatar inicjałów, imię, rola w mgle i wylogowanie (hover magenta).
- **Mobile:** dolny pasek z kobaltową linią 40% i poświatą u góry; aktywna pozycja = kobaltowy kafel notch pod ikoną i perłowa etykieta.
- **Zakładki widoków:** Control 13px, aktywna = perłowy tekst z kobaltowym podkreśleniem 2px, nieaktywna mgła, hover perła.

### Tytuł ekranu
`PageTitle`: głos Headline z glitchem i podziałem RGB (kobalt / magenta), licznik `[n]` mono w mgle. Każdy ekran listy zaczyna się od niego, akcja główna stoi po prawej w tym samym wierszu. Bez etykiet nad tytułem.

### Tafla KPI
Panel HUD 14px z obrysem w kolorze tafli (55%), gradientem tafli od prawego górnego rogu (22%) i akcentem 2px u góry; etykieta mono w mgle z rombem, liczba w głosie Numeric w kolorze tafli z poświatą, chip zmiany procentowej na Void 60% (perła = dobrze, magenta = źle, mgła = bez zmian) i „poprz. miesiąc”, na dole linia trendu z 8 tygodni: proste odcinki od zera, poświata `drop-shadow`, romb na końcu, odsłaniana maską od lewej. Tylko prawdziwe dane, bez kwot.

### Pasek statusu
Panel HUD 8px na Void 60%, mono 11px wersaliki: blok zegara na kobalcie z perłowym tekstem, data, przewijana taśma liczników z magentowymi strzałkami (40s, dwie kopie, ukryta przed czytnikami), alarm „po terminie” na magencie 15% z mrugającym punktem (`neon-hum`).

### Efekty i ruch
- **Boot ekranu** (każda nawigacja przez `template.tsx`): 0.45s, `cubic-bezier(0.16, 1, 0.3, 1)`, z rozmycia 4px i przesunięcia 8px; dzieci `.stagger` co 60ms.
- **Glitch** tytułów i marki: kobaltowa i magentowa kopia tekstu widoczna tylko w kilku klatkach na cykl 3.2s (~6% czasu); poza klatkami pseudo-elementy są ukryte.
- **Liczby** nabijane w CSS od 0 do wartości w 1.1s; wartość końcowa jest wartością bazową.
- **Linia trendu** odsłaniana 1.4s; **siatka podłogi** w perspektywie (magenta 55% / kobalt 50%, 56px) przesuwa się co 3.5s; **kursor** `_` (magenta) miga co 1.1s; **neon-hum** delikatnie przygasa (do 82%) w cyklu 6s.

**The Reduced Motion Rule.** Każda animacja i przejście jest wyłączane globalnie przy `prefers-reduced-motion: reduce`, a każdy efekt jest zbudowany tak, żeby stan spoczynkowy był stanem końcowym: liczby pokazują wynik, linie trendu są narysowane, kopie glitcha są ukryte, a zostaje statyczny podział RGB i statyczne skanlinie. Nowy efekt bez tej gwarancji nie wchodzi. Żadna duża płaszczyzna nie miga częściej niż 3 razy na sekundę.

## Do's and Don'ts

### Do:
- **Do** brać kolory wyłącznie z sześciu tokenów i ich ról w `app/globals.css` (klasy `bg-surface`, `text-pearl`, `text-danger`, `bg-cobalt/20` itd. albo `var(--token)`) i uruchamiać `tests/unit/palette.test.ts` po każdej zmianie wyglądu.
- **Do** pisać mały tekst w perle albo mgle; kobalt dawać na wypełnienia (z perłowym tekstem), obrysy, ikony, podkreślenia i liczby od 18px bold.
- **Do** liczyć kolor grupy przez `groupNeon` z `lib/ui/urgency.ts` i renderować chip grupy operacyjnej przez `GroupBadge` (tekst perłowy, kolor grupy w tle i obrysie).
- **Do** oznaczać terminy przez Badge: po terminie `danger`, dziś `terracotta`, pozostałe `neutral`.
- **Do** zaczynać ekrany od `PageTitle` (glitch + RGB + licznik `[n]`).
- **Do** stawiać obrys paneli HUD jako cień wewnętrzny, a poświatę na osobnym, nieprzyciętym elemencie.
- **Do** pisać numery, daty i liczniki w JetBrains Mono z cyframi tabelarycznymi, a etykiety UI po polsku z `lib/enums.ts`.
- **Do** budować każdy nowy efekt tak, by przy reduced-motion zostawał gotowy, statyczny stan końcowy.

### Don't:
- **Don't** wprowadzać żadnego koloru spoza szóstki: żółtego, cyjanu, fioletu, kwasowej zieleni, czerwieni, bieli, czerni Tailwinda ani nowych hexów/`rgb()`.
- **Don't** pisać małego tekstu kobaltem (linki, liczniki, etykiety, chipy) — 3.9:1 na Void nie wystarcza.
- **Don't** używać kobaltu jako koloru pilności ani magenty/bursztynu jako koloru akcji; nie dokładać nowych nieinteraktywnych pełnych bloków kobaltu.
- **Don't** składać chipu grupy operacyjnej ręcznie z `Badge` ani nadawać grupom kolorów poza `groupNeon`.
- **Don't** wprowadzać kolorów marki INNDES (granat, terakota, szałwia); kobalt wchodzi tylko jako Electric Cobalt z szóstki.
- **Don't** zaokrąglać rogów komponentów; forma to cięcie 45°.
- **Don't** dawać zewnętrznego `box-shadow` elementom `.hud` ani `.notch` — `clip-path` go obetnie.
- **Don't** używać logotypów, postaci, nazw, cytatów ani elementów interfejsu z Cyberpunk 2077 / Edgerunners; tylko klimat gatunku.
- **Don't** stawiać etykiet-„kickerów” nad nagłówkami; prefiks `//` żyje tylko w etykietach sekcji nawigacji i sufiksie marki `//CRM`.
- **Don't** wracać do jasnej płyty powitalnej ani pasteli poprzedniego świata; perła nie jest kolorem dużych płaszczyzn.
- **Don't** pokazywać zmyślonych liczb ani kwot w taflach i wykresach.
