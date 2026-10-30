import { describe, expect, it } from 'vitest';
import {
  emptyFilters,
  filterInquiries,
  matchesDue,
  sortInquiries,
  type InquiryListItem,
} from '@/lib/inquiries/list-filters';

const TODAY = '2026-10-30';

function make(over: Partial<InquiryListItem>): InquiryListItem {
  return {
    id: over.number ?? 'x',
    number: 'ZAP-2026-001',
    inquiry_date: '2026-10-01',
    company_id: null,
    contact_id: null,
    country: null,
    project_location: null,
    short_description: null,
    object_type: null,
    object_type_other: null,
    scope_notes: null,
    scope_undetermined: false,
    source: null,
    operational_group: 'wymaga_dzialania',
    sales_stage: 'nowe',
    owner_id: null,
    next_step: null,
    next_step_due: null,
    task_status: 'otwarte',
    is_archived: false,
    archived_reason: null,
    archived_at: null,
    created_at: '2026-10-01T00:00:00Z',
    created_by: null,
    updated_at: '2026-10-01T00:00:00Z',
    updated_by: null,
    companies: null,
    contacts: null,
    ...over,
  } as InquiryListItem;
}

const items = [
  make({ number: 'ZAP-2026-001', companies: { name: 'Nordic Home AS' }, country: 'Norwegia', next_step_due: '2026-10-28', owner_id: 'u1', source: 'email', sales_stage: 'oferta_wyslana' }),
  make({ number: 'ZAP-2026-002', companies: { name: 'Hotel Bałtyk' }, contacts: { first_name: 'Anna', last_name: 'Kowalska' }, country: 'Polska', next_step_due: TODAY, owner_id: 'u2', source: 'telefon' }),
  make({ number: 'ZAP-2026-010', companies: { name: 'Studio Architektura Plus' }, country: 'Polska', next_step_due: '2026-11-04', inquiry_date: '2026-10-20', short_description: 'Lobby hotelowe', next_step: 'Wysłać wizualizacje' }),
  make({ number: 'ZAP-2026-003', companies: { name: 'Acme' }, next_step_due: null }),
];

describe('wyszukiwanie', () => {
  it('znajduje po imieniu i nazwisku kontaktu', () => {
    const r = filterInquiries(items, { ...emptyFilters, search: 'kowalska' }, TODAY);
    expect(r.map((i) => i.number)).toEqual(['ZAP-2026-002']);
  });
  it('znajduje po opisie i następnym kroku, bez względu na wielkość liter', () => {
    expect(filterInquiries(items, { ...emptyFilters, search: 'LOBBY' }, TODAY)).toHaveLength(1);
    expect(filterInquiries(items, { ...emptyFilters, search: 'wizualizacje' }, TODAY)).toHaveLength(1);
  });
  it('znajduje po numerze, firmie i kraju', () => {
    expect(filterInquiries(items, { ...emptyFilters, search: '010' }, TODAY)).toHaveLength(1);
    expect(filterInquiries(items, { ...emptyFilters, search: 'nordic' }, TODAY)).toHaveLength(1);
    expect(filterInquiries(items, { ...emptyFilters, search: 'polska' }, TODAY)).toHaveLength(2);
  });
});

describe('filtry', () => {
  it('łączy filtry warunkiem AND', () => {
    const r = filterInquiries(items, { ...emptyFilters, country: 'polska', ownerId: 'u2' }, TODAY);
    expect(r.map((i) => i.number)).toEqual(['ZAP-2026-002']);
  });
  it('filtruje po etapie sprzedaży i źródle', () => {
    expect(filterInquiries(items, { ...emptyFilters, salesStage: 'oferta_wyslana' }, TODAY)).toHaveLength(1);
    expect(filterInquiries(items, { ...emptyFilters, source: 'telefon' }, TODAY)).toHaveLength(1);
  });
  it('bez filtrów zwraca wszystko', () => {
    expect(filterInquiries(items, emptyFilters, TODAY)).toHaveLength(4);
  });
});

describe('filtr terminu', () => {
  it('rozróżnia po terminie / dziś / 7 dni / bez terminu', () => {
    expect(matchesDue('2026-10-29', 'po_terminie', TODAY)).toBe(true);
    expect(matchesDue(TODAY, 'po_terminie', TODAY)).toBe(false);
    expect(matchesDue(TODAY, 'dzis', TODAY)).toBe(true);
    expect(matchesDue('2026-11-06', 'tydzien', TODAY)).toBe(true);
    expect(matchesDue('2026-11-07', 'tydzien', TODAY)).toBe(false);
    expect(matchesDue('2026-10-29', 'tydzien', TODAY)).toBe(false);
    expect(matchesDue(null, 'bez_terminu', TODAY)).toBe(true);
    expect(matchesDue(null, 'po_terminie', TODAY)).toBe(false);
  });
});

describe('sortowanie', () => {
  it('termin: zaległe na górze, bez terminu na końcu', () => {
    expect(sortInquiries(items, 'termin').map((i) => i.number)).toEqual([
      'ZAP-2026-001',
      'ZAP-2026-002',
      'ZAP-2026-010',
      'ZAP-2026-003',
    ]);
  });
  it('numer: sortowanie naturalne (010 po 003)', () => {
    expect(sortInquiries(items, 'numer').map((i) => i.number)).toEqual([
      'ZAP-2026-001',
      'ZAP-2026-002',
      'ZAP-2026-003',
      'ZAP-2026-010',
    ]);
  });
  it('najnowsze: wg daty zapytania malejąco', () => {
    expect(sortInquiries(items, 'najnowsze')[0].number).toBe('ZAP-2026-010');
  });
  it('nie mutuje wejścia', () => {
    const before = items.map((i) => i.number);
    sortInquiries(items, 'firma');
    expect(items.map((i) => i.number)).toEqual(before);
  });
});
