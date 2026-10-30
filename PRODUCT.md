# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Zespół INNDES (meble kontraktowe, B2B), 2–3 osoby: sprzedaż, obsługa zapytań, administrator. Praca głównie przy biurku na laptopie; telefon służy do szybkiego sprawdzenia zadań i terminów w terenie (u klienta, na budowie, na targach).

## Product Purpose

Wewnętrzny CRM INNDES. Cel: żadne zapytanie nie ginie, każdy rekord ma następny krok z terminem i właścicielem. Sukces = zespół zaczyna dzień od pulpitu i wie, co jest po terminie, co na dziś i jak idzie sprzedaż.

## Positioning

Narzędzie szyte pod jeden zespół i jeden proces: zapytanie ma dwa niezależne wymiary — grupę operacyjną (co trzeba zrobić) i etap sprzedaży (gdzie jest szansa). W kolejnych fazach dochodzi moduł Lead Agent, który przygotowuje research i drafty, ale nigdy nie komunikuje się z klientem bez zatwierdzenia człowieka.

## Operating Context

Codzienny rytm: poranny przegląd pulpitu → lista zapytań/zadań → karta zapytania (notatki, pliki, historia). Eksport CSV/JSON i backup dla administratora. Szczegóły: `docs/PRD.md`, `CLAUDE.md`.

## Capabilities and Constraints

- Next.js 16 App Router + Supabase (Postgres, Auth, RLS). Server components domyślnie.
- Etykiety UI po polsku w `lib/enums.ts`; nazwy pól w bazie po angielsku.
- Faza 2 zamknięta (archiwum, filtry, zadania, eksport, backup). Leady/ICP (Faza 3), agent i poczta (Faza 4), raporty (Faza 5) jeszcze nie istnieją — UI nie może sugerować, że działają.
- Brak kwot ofert w systemie: żadnych wartości w zł na pulpicie, dopóki nie ma tabeli ofert z danymi.

## Brand Commitments

- Nazwa: INNDES CRM.
- Kierunek wizualny przypięty przez właściciela produktu (2026-10-30, druga decyzja tego dnia): cyberpunk w klimacie Edgerunners, „abstract hardcore”, kolory ze zrzutu referencyjnego podbite do neonu; ciemniej i bardziej immersyjnie; efekty (glitch, skanlinie, neon) na wszystkich ekranach. Kolory INNDES (granat/kobalt/terakota/szałwia) — nie używać.
- Powitanie na pulpicie: „HEY, {imię}” — imię z profilu użytkownika (pierwsze słowo pola imię i nazwisko).
- Granica: tylko klimat gatunku; żadnych logotypów, postaci, nazw ani elementów interfejsu z gry/anime Cyberpunk 2077 / Edgerunners.

## Evidence on Hand

- Zrzut referencyjny wyglądu: `/mnt/user-data/attachments/4ef89d96-516c-508e-a5fd-a9eb6666a4d0/fccb618a-image.jpg` (poza repo).
- Dane demo: `supabase/seed.sql`. Brak logo INNDES w repo. Nie zmyślać liczb, klientów ani kwot.

## Product Principles

1. Prawdziwe dane albo nic — żadnych zmyślonych liczb na wykresach i kartach.
2. Następny krok jest najważniejszą informacją na każdym ekranie.
3. Człowiek zatwierdza wszystko, co wychodzi do klienta.
4. Zwykły kod do zwykłych operacji; AI tylko tam, gdzie PRD to przewiduje.
