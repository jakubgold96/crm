import type { Inquiry } from '@/lib/types/database';

/**
 * Filtrowanie / wyszukiwanie / sortowanie listy zapytań (PRD: "wyszukiwanie
 * (numer/firma/kontakt/kraj/opis/następny krok), filtry (termin/właściciel/
 * etap/kraj/źródło), sortowanie"). Czysty kod, bez AI (CLAUDE.md zasada #10)
 * i bez Reacta — żeby dało się go przetestować w Vitest.
 *
 * `today` w formacie YYYY-MM-DD jest parametrem, nie `new Date()` w środku —
 * testy muszą być deterministyczne.
 */

export type InquiryListItem = Inquiry & {
  companies: { name: string } | null;
  contacts: { first_name: string | null; last_name: string | null } | null;
};

export type DueFilter = '' | 'po_terminie' | 'dzis' | 'tydzien' | 'bez_terminu';
export type SortKey = 'termin' | 'najnowsze' | 'numer' | 'firma';

export type InquiryListFilters = {
  search: string;
  ownerId: string;
  country: string;
  source: string;
  salesStage: string;
  due: DueFilter;
};

export const emptyFilters: InquiryListFilters = {
  search: '',
  ownerId: '',
  country: '',
  source: '',
  salesStage: '',
  due: '',
};

export function contactName(item: InquiryListItem): string {
  return [item.contacts?.first_name, item.contacts?.last_name].filter(Boolean).join(' ');
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function matchesDue(due: string | null, filter: DueFilter, today: string): boolean {
  if (!filter) return true;
  const day = due ? due.slice(0, 10) : null;
  switch (filter) {
    case 'bez_terminu':
      return day === null;
    case 'po_terminie':
      return day !== null && day < today;
    case 'dzis':
      return day === today;
    case 'tydzien':
      return day !== null && day >= today && day <= addDays(today, 7);
  }
}

export function filterInquiries(
  items: InquiryListItem[],
  filters: InquiryListFilters,
  today: string
): InquiryListItem[] {
  const q = filters.search.trim().toLowerCase();
  return items.filter((i) => {
    if (q) {
      const haystack = [
        i.number,
        i.companies?.name,
        contactName(i),
        i.country,
        i.short_description,
        i.next_step,
      ]
        .filter(Boolean)
        .join('\n')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.ownerId && i.owner_id !== filters.ownerId) return false;
    if (filters.country && (i.country ?? '').toLowerCase() !== filters.country.toLowerCase()) return false;
    if (filters.source && i.source !== filters.source) return false;
    if (filters.salesStage && i.sales_stage !== filters.salesStage) return false;
    if (!matchesDue(i.next_step_due, filters.due, today)) return false;
    return true;
  });
}

export function sortInquiries(items: InquiryListItem[], key: SortKey): InquiryListItem[] {
  const list = [...items];
  switch (key) {
    case 'termin':
      // Bez terminu na końcu; wcześniejszy termin (czyli zaległe) na górze.
      return list.sort((a, b) => {
        if (!a.next_step_due && !b.next_step_due) return 0;
        if (!a.next_step_due) return 1;
        if (!b.next_step_due) return -1;
        return a.next_step_due.localeCompare(b.next_step_due);
      });
    case 'najnowsze':
      return list.sort((a, b) => (b.inquiry_date ?? '').localeCompare(a.inquiry_date ?? ''));
    case 'numer':
      return list.sort((a, b) => a.number.localeCompare(b.number, 'pl', { numeric: true }));
    case 'firma':
      return list.sort((a, b) => (a.companies?.name ?? '').localeCompare(b.companies?.name ?? '', 'pl'));
  }
}

export function activeFilterCount(filters: InquiryListFilters): number {
  return Object.values(filters).filter((v) => v.trim() !== '').length;
}
