/**
 * Prosty, zależny-od-niczego konwerter tablicy obiektów do CSV. Faza 2
 * potrzebuje tylko eksportu "do Excela/Arkuszy", nie pełnej biblioteki CSV —
 * CLAUDE.md #7 (nie dokładać rozmachu bez potrzeby z PRD).
 */
export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: (keyof T)[]): string {
  const header = columns.map((c) => escapeCsvCell(String(c))).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(formatCell(row[c]))).join(','));
  // BOM na początku, żeby Excel na Windows poprawnie rozpoznał UTF-8 (polskie znaki).
  return '﻿' + [header, ...lines].join('\r\n');
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'tak' : 'nie';
  return String(value);
}

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
