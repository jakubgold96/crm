---
version: 1
slug: "app-app-page-tsx"
primary_target: "app/(app)/page.tsx"
related_targets: ["app/(app)/layout.tsx","components/nav-sidebar.tsx"]
---

# Pulpit (/) — surface brief

Mode: Operate. Build path: code-led (Operate surface). Zakres: pulpit + powłoka całej aplikacji (sidebar, tło, komponenty), pozostałe ekrany dziedziczą świat.

Audience/job: zespół INNDES zaczyna dzień — co po terminie, co dziś, jak idzie sprzedaż w tym miesiącu; szybkie wyszukanie rekordu.
Constraints: tylko prawdziwe dane; brak kwot w zł (brak ofert); agent AI nie istnieje — pole szukania jest zwykłą wyszukiwarką; brak kickerów/eyebrow nad nagłówkami.

## Direction contract

THESIS: Pulpit jako ciemna konsola dnia: jedna jasna płyta powitalna, w której dzień jest już rozpisany (lista „Dzisiaj”), pod nią cztery nasycone tafle sprzedaży z ośmiotygodniową historią. Odmawia szarego dashboardu z rzędem identycznych białych kafli.

OWN-WORLD: Kierunek przypięty przez właściciela (zrzut referencyjny 1:1). Prawie czarna, chłodna powłoka (#0b0d12) z sidebarem w sekcjach i aktywną pozycją jako obrysowana pigułka; jasna, perłowa płyta powitalna; cztery tafle KPI w głębokim indygo, królewskim błękicie, butelkowej zieleni i śliwkowej magencie, z jasną linią trendu. Imię w powitaniu w gradiencie błękit→fiolet→róż. Geist jako jedyny krój, cyfry tabelaryczne.

STORY: Użytkownik w sekundę widzi, ile ma po terminie i na dziś, klika pierwsze zadanie albo szuka firmy; rzut oka w dół mówi, czy sprzedaż w tym miesiącu rośnie.

FIRST VIEWPORT: Lewy sidebar 15rem (sekcje: Praca, Baza, Dane, Wkrótce, użytkownik na dole). Główna kolumna: płyta powitalna ~60% wysokości ekranu — lewa część: „Dzień dobry, {imię}”, podtytuł z datą, trzy liczby (Po terminie / Na dziś / Otwarte), pole wyszukiwania; prawa część: lista „Dzisiaj” 4 pozycje. Pod płytą rząd 4 tafli KPI (Nowe zapytania, Oferty wysłane, Wygrane, Przegrane — miesiąc bieżący, zmiana vs poprzedni, linia 8 tygodni). Główna akcja: wyszukiwarka + „Nowe zapytanie”.

FORM: pinned direction from user reference screenshot (1/1); the roll ran (seed:963d6e4ceac54c88) and the user-pinned direction beats it, per the roll's own rule. seed:963d6e4ceac54c88

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
