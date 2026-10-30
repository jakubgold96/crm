import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Backup logiczny — pełny zrzut JSON wszystkich tabel biznesowych, nie tylko
 * companies/contacts/inquiries jak /api/export/json (ten dla operacyjnego
 * eksportu, nie backupu). Kryterium #19: "backup można pobrać i zweryfikować"
 * — weryfikacja to scripts/verify-backup.mjs (restore do lokalnej bazy +
 * porównanie liczby wierszy), patrz docs/MIGRATIONS_BACKUP.md.
 *
 * Tylko administrator — ten zrzut zawiera profiles (dane wszystkich
 * użytkowników) i audit_log/activity_log (historia działań), nie tylko
 * dane operacyjne jak zwykły eksport z /eksport.
 *
 * To backup logiczny (dane przez RLS-respecting klienta), nie pg_dump
 * fizyczny — ten sandbox nie ma connection stringa do Postgresa, a Supabase
 * Pro i tak ma wbudowane daily backups + PITR na poziomie infrastruktury
 * (docs/MIGRATIONS_BACKUP.md, sekcja "Backup"). Ten endpoint odpowiada na
 * węższe pytanie: "czy da się pobrać kompletny zrzut danych biznesowych
 * i zweryfikować go bez dostępu do panelu Supabase".
 */
const BACKUP_TABLES = [
  'profiles',
  'companies',
  'contacts',
  'service_scope_options',
  'inquiries',
  'inquiry_services',
  'inquiry_files',
  'inquiry_notes',
  'activity_log',
  'audit_log',
] as const;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Brak sesji.' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'administrator') {
    return NextResponse.json({ error: 'Backup pełnej bazy jest dostępny tylko dla administratora.' }, { status: 403 });
  }

  const results = await Promise.all(
    BACKUP_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw new Error(`Błąd eksportu tabeli ${table}: ${error.message}`);
      return [table, data ?? []] as const;
    })
  ).catch((err: Error) => {
    return err;
  });

  if (results instanceof Error) {
    return NextResponse.json({ error: results.message }, { status: 500 });
  }

  const tables = Object.fromEntries(results);
  const rowCounts = Object.fromEntries(results.map(([table, rows]) => [table, rows.length]));

  const payload = {
    backup_format_version: 1,
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    row_counts: rowCounts,
    tables,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="inndes-crm-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
