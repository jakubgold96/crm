import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Eksport ogólny JSON — wszystkie trzy tabele biznesowe naraz. Dostępny dla
 * każdego aktywnego usera; RLS ogranicza wynik tak samo jak w aplikacji.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Brak sesji.' }, { status: 401 });
  }

  const [{ data: companies }, { data: contacts }, { data: inquiries }] = await Promise.all([
    supabase.from('companies').select('*').order('created_at'),
    supabase.from('contacts').select('*').order('created_at'),
    supabase.from('inquiries').select('*').order('created_at'),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    companies: companies ?? [],
    contacts: contacts ?? [],
    inquiries: inquiries ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="inndes-crm-eksport.json"',
    },
  });
}
