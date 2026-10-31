import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Dzisiejsza data (YYYY-MM-DD) w LOKALNEJ strefie urządzenia. Oba helpery
 * poniżej porównują na niej — wcześniej isDueToday brał datę UTC, a isOverdue
 * lokalną, więc tuż po północy (PL: do 1:00/2:00) to samo zapytanie było
 * jednocześnie "po terminie" i "na dziś".
 */
export function localToday(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Czy termin jest po terminie (przed dzisiaj). */
export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) < localToday();
}

export function isDueToday(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) === localToday();
}

/**
 * Imię do powitania: pierwsze słowo pola "imię i nazwisko" z profilu.
 * Gdy w profilu jest jeszcze e-mail (domyślne przy zakładaniu konta), bierze
 * pierwszy człon loginu przed "@" ("sprzedaz.test@..." -> "sprzedaz").
 */
export function greetingName(fullName: string | null | undefined): string {
  const raw = (fullName ?? '').trim();
  if (!raw) return '';
  const base = raw.includes('@') ? raw.split('@')[0] : raw;
  return base.split(/[\s._-]+/).filter(Boolean)[0] ?? '';
}

/** Polska odmiana po liczebniku: plural(1,'lead','leady','leadów') -> "1 lead", 3 -> "3 leady", 5 -> "5 leadów". */
export function plural(n: number, one: string, few: string, many: string): string {
  const last = n % 10;
  const lastTwo = n % 100;
  const word = n === 1 ? one : last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
  return `${n} ${word}`;
}
