import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Kontrola duplikatów firmy — miękkie ostrzeżenie, nie blokada (PRD sekcja 2:
 * "Dodaj kontrolę duplikatów ... " bez wymogu twardego bloku). Szuka po
 * nazwie (podobieństwo trigram), domenie, e-mailu, telefonie, NIP/VAT.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Brak sesji.' }, { status: 401 });
  }

  const body = await request.json();
  const { name, website, email, phone, tax_id, excludeId } = body as {
    name?: string;
    website?: string;
    email?: string;
    phone?: string;
    tax_id?: string;
    excludeId?: string;
  };

  const matches: { id: string; name: string; reason: string }[] = [];

  async function addMatches(
    reason: string,
    query: PromiseLike<{ data: { id: string; name: string }[] | null }>
  ) {
    const { data } = await query;
    for (const row of data ?? []) {
      if (excludeId && row.id === excludeId) continue;
      if (!matches.some((m) => m.id === row.id && m.reason === reason)) {
        matches.push({ id: row.id, name: row.name, reason });
      }
    }
  }

  if (name && name.trim().length > 1) {
    await addMatches(
      'Podobna nazwa',
      supabase.from('companies').select('id, name').ilike('name', `%${name.trim()}%`).limit(5)
    );
  }
  if (website && website.trim().length > 2) {
    const domain = website.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    await addMatches(
      'Ta sama strona WWW',
      supabase.from('companies').select('id, name').ilike('website', `%${domain}%`).limit(5)
    );
  }
  if (email && email.trim().length > 2) {
    await addMatches(
      'Ten sam e-mail',
      supabase.from('companies').select('id, name').ilike('email', email.trim()).limit(5)
    );
  }
  if (phone && phone.trim().length > 3) {
    await addMatches(
      'Ten sam telefon',
      supabase.from('companies').select('id, name').eq('phone', phone.trim()).limit(5)
    );
  }
  if (tax_id && tax_id.trim().length > 2) {
    await addMatches(
      'Ten sam NIP/VAT',
      supabase.from('companies').select('id, name').eq('tax_id', tax_id.trim()).limit(5)
    );
  }

  return NextResponse.json({ matches });
}
