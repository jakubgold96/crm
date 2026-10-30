/**
 * Mapowania enum (wartości bazodanowe, angielskie/techniczne) → etykiety PL
 * widoczne w UI. Trzymane w jednym miejscu (docs/DATA_MODEL.md, konwencja:
 * "nazwy w bazie angielskie/techniczne, etykiety UI polskie") — żadna
 * etykieta nie powinna być wpisana na sztywno w komponencie.
 */

import type {
  ActivityType,
  CompanySegment,
  ContactConsent,
  ContactRole,
  InquirySource,
  ObjectType,
  OperationalGroup,
  RelationshipStatus,
  SalesStage,
  TaskStatus,
  UserRole,
} from './types/database';

export const userRoleLabels: Record<UserRole, string> = {
  administrator: 'Administrator',
  sprzedaz: 'Sprzedaż',
  realizacja: 'Realizacja',
};

export const companySegmentLabels: Record<CompanySegment, string> = {
  hotel: 'Hotel',
  restauracja: 'Restauracja',
  biuro: 'Biuro',
  retail: 'Retail',
  architekt: 'Architekt',
  marka_meblowa: 'Marka meblowa',
  generalny_wykonawca: 'Generalny wykonawca',
  inne: 'Inne',
};

export const relationshipStatusLabels: Record<RelationshipStatus, string> = {
  nowy: 'Nowy',
  aktywny: 'Aktywny',
  uspiony: 'Uśpiony',
  zakonczony: 'Zakończony',
};

export const contactRoleLabels: Record<ContactRole, string> = {
  wlasciciel: 'Właściciel',
  kupiec: 'Kupiec',
  architekt: 'Architekt',
  projektant: 'Projektant',
  project_manager: 'Project Manager',
  techniczny: 'Techniczny',
  finanse: 'Finanse',
  montaz: 'Montaż',
  inna: 'Inna',
};

export const contactConsentLabels: Record<ContactConsent, string> = {
  zgoda: 'Zgoda na kontakt',
  brak_danych: 'Brak danych',
  zakaz: 'Zakaz kontaktu',
};

export const objectTypeLabels: Record<ObjectType, string> = {
  hotel: 'Hotel',
  restauracja: 'Restauracja',
  bar_kawiarnia: 'Bar / kawiarnia',
  biuro: 'Biuro',
  sklep_retail: 'Sklep / retail',
  obiekt_publiczny_komercyjny: 'Obiekt publiczny lub komercyjny',
  mieszkanie_dom_prywatny: 'Mieszkanie / dom prywatny',
  inne: 'Inne — doprecyzuj',
};

export const inquirySourceLabels: Record<InquirySource, string> = {
  formularz: 'Formularz',
  email: 'E-mail',
  telefon: 'Telefon',
  polecenie: 'Polecenie',
  architekt: 'Architekt',
  targi: 'Targi',
  powrot_klienta: 'Powrót klienta',
  inne: 'Inne',
};

export const operationalGroupLabels: Record<OperationalGroup, string> = {
  wymaga_dzialania: 'Wymaga działania',
  do_przypomnienia: 'Do przypomnienia',
  czekamy_na_klienta: 'Czekamy na klienta',
};

export const salesStageLabels: Record<SalesStage, string> = {
  nowe: 'Nowe',
  kwalifikacja: 'Kwalifikacja',
  kompletowanie_danych: 'Kompletowanie danych',
  przygotowanie_oferty: 'Przygotowanie oferty',
  oferta_wyslana: 'Oferta wysłana',
  negocjacje: 'Negocjacje',
  wygrane: 'Wygrane',
  przegrane: 'Przegrane',
  wstrzymane: 'Wstrzymane',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  otwarte: 'Otwarte',
  w_toku: 'W toku',
  zrobione: 'Zrobione',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  note: 'Notatka',
  change: 'Zmiana',
  task: 'Zadanie',
  email: 'E-mail',
  meeting: 'Spotkanie',
  call: 'Rozmowa',
};

/** Etapy sprzedaży, od których zakres usługi musi być ustalony (brief: "Gotowe do wyceny" ~ przygotowanie_oferty — patrz docs/DATA_MODEL.md). */
export const salesStagesRequiringScope: SalesStage[] = [
  'przygotowanie_oferty',
  'oferta_wyslana',
  'negocjacje',
  'wygrane',
];

export function enumToOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

// Filtry/sortowanie listy zapytań (tylko UI, nie pola w bazie) —
// logika w lib/inquiries/list-filters.ts.
export const dueFilterLabels = {
  po_terminie: 'Po terminie',
  dzis: 'Na dziś',
  tydzien: 'Najbliższe 7 dni',
  bez_terminu: 'Bez terminu',
} as const;

export const inquirySortLabels = {
  termin: 'Sortuj: termin (zaległe na górze)',
  najnowsze: 'Sortuj: najnowsze zapytania',
  numer: 'Sortuj: numer',
  firma: 'Sortuj: firma A–Z',
} as const;

// Tafle KPI sprzedaży na pulpicie — logika w lib/dashboard/sales-kpis.ts.
export const salesKpiLabels = {
  nowe: 'Nowe zapytania',
  oferta_wyslana: 'Oferty wysłane',
  wygrane: 'Wygrane',
  przegrane: 'Przegrane',
} as const;
