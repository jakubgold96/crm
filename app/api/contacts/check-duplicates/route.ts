import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/** Kontrola duplikatów kontaktu — po e-mailu, telefonie, (firma+nazwisko). Miękkie ostrzeżenie. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Brak sesji.' }, { status: 401 });
  }

  const { email, phone, company_id, last_name, excludeId } = (await request.json()) as {
    email?: string;
    phone?: string;
    company_id?: string;
    last_name?: string;
    excludeId?: string;
  };

  const matches: { id: string; name: string; reason: string }[] = [];

  async function addMatches(
    reason: string,
    query: PromiseLike<{ data: { id: string; first_name: string | null; last_name: string | null }[] | null }>
  ) {
    const { data } = await query;
    for (const row of data ?? []) {
      if (excludeId && row.id === excludeId) continue;
      const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || '(bez nazwiska)';
      matches.push({ id: row.id, name, reason });
    }
  }

  if (email && email.trim().length > 2) {
    await addMatches(
      'Ten sam e-mail',
      supabase.from('contacts').select('id, first_name, last_name').ilike('email', email.trim()).limit(5)
    );
  }
  if (phone && phone.trim().length > 3) {
    await addMatches(
      'Ten sam telefon',
      supabase.from('contacts').select('id, first_name, last_name').eq('phone', phone.trim()).limit(5)
    );
  }
  if (company_id && last_name && last_name.trim().length > 1) {
    await addMatches(
      'To samo nazwisko w tej firmie',
      supabase
        .from('contacts')
        .select('id, first_name, last_name')
        .eq('company_id', company_id)
        .ilike('last_name', last_name.trim())
        .limit(5)
    );
  }

  return NextResponse.json({ matches });
}
