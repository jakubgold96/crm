import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Eksport RODO danych jednej firmy: sama firma + jej kontakty (osoby) +
 * zapytania powiązane. Analogicznie do /api/export/contact/[id].
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

  const { data: company, error } = await supabase.from('companies').select('*').eq('id', id).single();

  if (error || !company) {
    return NextResponse.json({ error: 'Firma nie istnieje.' }, { status: 404 });
  }

  const [{ data: contacts }, { data: inquiries }] = await Promise.all([
    supabase.from('contacts').select('*').eq('company_id', id).order('last_name'),
    supabase
      .from('inquiries')
      .select('number, inquiry_date, short_description, operational_group, sales_stage, is_archived')
      .eq('company_id', id)
      .order('inquiry_date'),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    exported_by: user.email,
    company,
    contacts: contacts ?? [],
    related_inquiries: inquiries ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="firma-${id}.json"`,
    },
  });
}
