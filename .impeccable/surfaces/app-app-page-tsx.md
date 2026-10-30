---
version: 1
slug: "app-app-page-tsx"
primary_target: "app/(app)/page.tsx"
related_targets: ["app/(app)/layout.tsx","components/nav-sidebar.tsx"]
---

# Pulpit (/) + powłoka aplikacji — surface brief

Mode: Operate. Build path: code-led. Zakres: cała aplikacja (powłoka, komponenty, listy, formularze, logowanie); pulpit najmocniejszy.

Audience/job: zespół INNDES zaczyna dzień — co po terminie, co dziś, jak idzie sprzedaż; szybkie wyszukanie.
Constraints: tylko prawdziwe dane; brak kwot zł; agent AI nie istnieje; brak kickerów nad nagłówkami; żadnych logo/postaci/UI z gry Cyberpunk 2077 — tylko klimat gatunku; efekty wyłączane przy prefers-reduced-motion; bez migotania dużych płaszczyzn > 3/s.

## Direction contract

THESIS: Pulpit jako nocny HUD najemnika: ciemny, gęsty, neonowy, z jednym krzykiem — „HEY, {IMIĘ}” rozszczepionym na kanały RGB. Odmawia uprzejmego SaaS-owego dashboardu z jasną kartą i pastelami (poprzednia wersja to anty-wzorzec).

OWN-WORLD: Kierunek przypięty przez właściciela: cyberpunk / Edgerunners, abstract hardcore, kolory ze zrzutu podbite do neonu. Grunt prawie czarny z zimnym błękitem (#05060b), siatka i skanlinie. Akcja = kwasowy żółty (#f5e400) z czarnym tekstem. Neony: cyjan, magenta, kwasowa zieleń, fiolet (odcienie czterech tafli ze zrzutu). Panele ze ściętymi rogami, cienkie neonowe krawędzie, poświata. Chakra Petch (nagłówki, liczby), Geist (tekst), JetBrains Mono (numery, daty, etykiety danych).

STORY: Wejście jak boot systemu: pasek statusu, „HEY, JAKUB_” z kursorem, liczniki po terminie/dziś/aktywne, lista „Dzisiaj”; niżej cztery neonowe tafle sprzedaży, w których wykres się rysuje.

FIRST VIEWPORT: Sidebar HUD 15rem (marka z glitchem, sekcje „// PRACA” itd., aktywna pozycja = żółty ścięty blok). Główna kolumna: pasek statusu (data, godzina, sesja, alarm po terminie); ciemny panel ~55% wysokości z perspektywiczną siatką w tle: lewa część — „HEY, {IMIĘ}” w Chakra Petch ~5rem z rozszczepieniem RGB, podsumowanie mono, trzy odczyty, pole szukania z żółtym przyciskiem, „Nowe zapytanie”; prawa — „DZISIAJ”, 4 wiersze. Pod spodem 4 tafle KPI. Główna akcja: szukaj + Nowe zapytanie.

FORM: pinned direction from user brief (cyberpunk / Edgerunners vibe, colors from reference screenshot); the roll ran and the user-pinned direction beats it, per the roll's own rule. seed:a5b7d8135b9ac0dc

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
