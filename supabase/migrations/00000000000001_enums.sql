-- INNDES CRM — Faza 1 — migracja 1: typy enum
-- Wartości enum można rozszerzać w przyszłości przez: ALTER TYPE <nazwa> ADD VALUE 'nowa_wartosc';
-- Nie modyfikujemy tu żadnej istniejącej wartości — tylko tworzymy.

create type user_role as enum ('administrator', 'sprzedaz', 'realizacja');

create type company_segment as enum (
  'hotel',
  'restauracja',
  'biuro',
  'retail',
  'architekt',
  'marka_meblowa',
  'generalny_wykonawca',
  'inne'
);

create type relationship_status as enum ('nowy', 'aktywny', 'uspiony', 'zakonczony');

create type contact_role as enum (
  'wlasciciel',
  'kupiec',
  'architekt',
  'projektant',
  'project_manager',
  'techniczny',
  'finanse',
  'montaz',
  'inna'
);

create type contact_consent as enum ('zgoda', 'brak_danych', 'zakaz');

-- Decyzja właściciela produktu (2026-10-30): zamknięta lista typu obiektu z opcją "Inne — doprecyzuj".
create type object_type as enum (
  'hotel',
  'restauracja',
  'bar_kawiarnia',
  'biuro',
  'sklep_retail',
  'obiekt_publiczny_komercyjny',
  'mieszkanie_dom_prywatny',
  'inne'
);

create type inquiry_source as enum (
  'formularz',
  'email',
  'telefon',
  'polecenie',
  'architekt',
  'targi',
  'powrot_klienta',
  'inne'
);

-- Grupa operacyjna i etap sprzedaży to dwa NIEZALEŻNE pola na inquiries.
-- Nie łączyć, nie wyprowadzać jednego z drugiego w żadnej logice (CLAUDE.md, zasada #9).
create type operational_group as enum ('wymaga_dzialania', 'do_przypomnienia', 'czekamy_na_klienta');

create type sales_stage as enum (
  'nowe',
  'kwalifikacja',
  'kompletowanie_danych',
  'przygotowanie_oferty',
  'oferta_wyslana',
  'negocjacje',
  'wygrane',
  'przegrane',
  'wstrzymane'
);

create type task_status as enum ('otwarte', 'w_toku', 'zrobione');

create type activity_type as enum ('note', 'change', 'task', 'email', 'meeting', 'call');
