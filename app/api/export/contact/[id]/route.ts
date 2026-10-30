import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Eksport RODO danych jednego kontaktu — "na żądanie usunięcia danych
 * osobowych" (docs/MIGRATIONS_BACKUP.md). Dane kontaktu + firma, do której
 * należy, + zapytania powiązane z tym kontaktem (żeby osoba widziała,
 * z czym jej dane są powiązane). RLS obowiązuje normalnie — zwraca tylko
 * dane, do których eksportujący i tak ma dostęp w aplikacji.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Brak sesji.' }, { status: 401 });
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*, companies(id, name)')
    .eq('id', id)
    .single();

  if (error || !contact) {
    return NextResponse.json({ error: 'Kontakt nie istnieje.' }, { status: 404 });
  }

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('number, inquiry_date, short_description, operational_group, sales_stage, is_archived')
    .eq('contact_id', id)
    .order('inquiry_date');

  const payload = {
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    contact,
    related_inquiries: inquiries ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="kontakt-${id}.json"`,
    },
  });
}
