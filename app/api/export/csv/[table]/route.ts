import { createClient } from '@/lib/supabase/server';
import { toCsv } from '@/lib/export/csv';
import { NextResponse } from 'next/server';

/**
 * Eksport ogólny CSV, jedna tabela na request (docs/MIGRATIONS_BACKUP.md,
 * sekcja "RODO / eksport danych" — "eksport działa dla całości"). Dostępny
 * dla każdego aktywnego usera, bez dodatkowej logiki uprawnień: RLS na
 * companies/contacts/inquiries już ogranicza wynik do tego, co użytkownik
 * normalnie widzi w aplikacji (is_active_user()), więc eksport nigdy nie
 * pokaże więcej niż UI.
 *
 * Whitelist nazw tabel — nigdy nie wstawiać segmentu [table] z URL
 * bezpośrednio do zapytania.
 */
const TABLES = {
  companies: {
    columns: [
      'id',
      'name',
      'country',
      'city',
      'address',
      'tax_id',
      'website',
      'email',
      'phone',
      'segment',
      'relationship_status',
      'is_archived',
      'created_at',
      'updated_at',
    ],
  },
  contacts: {
    columns: [
      'id',
      'company_id',
      'first_name',
      'last_name',
      'position',
      'role',
      'email',
      'phone',
      'language',
      'contact_consent',
      'created_at',
      'updated_at',
    ],
  },
  inquiries: {
    columns: [
      'id',
      'number',
      'inquiry_date',
      'company_id',
      'contact_id',
      'country',
      'project_location',
      'short_description',
      'object_type',
      'source',
      'operational_group',
      'sales_stage',
      'owner_id',
      'next_step',
      'next_step_due',
      'task_status',
      'is_archived',
      'archived_reason',
      'archived_at',
      'created_at',
      'updated_at',
    ],
  },
} as const;

type TableName = keyof typeof TABLES;

export async function GET(request: Request, { params }: { params: Promise<{ table: string }> }) {
  const { table } = await params;

  if (!isTableName(table)) {
    return NextResponse.json({ error: 'Nieznana tabela eksportu.' }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Brak sesji.' }, { status: 401 });
  }

  const { columns } = TABLES[table];
  const { data, error } = await supabase.from(table).select(columns.join(',')).order('created_at');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = toCsv((data ?? []) as unknown as Record<string, unknown>[], columns as unknown as string[]);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${table}.csv"`,
    },
  });
}

function isTableName(value: string): value is TableName {
  return value in TABLES;
}
