import { ContactForm } from '@/components/contacts/contact-form';
import { createClient } from '@/lib/supabase/server';
import type { Contact } from '@/lib/types/database';
import { notFound } from 'next/navigation';

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contact } = await supabase
    .from('contacts')
    .select('*, companies(name)')
    .eq('id', id)
    .single();
  if (!contact) notFound();

  const typed = contact as unknown as Contact & { companies: { name: string } | null };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 rgb-split font-display text-2xl font-bold uppercase tracking-[0.04em] text-foreground">Edytuj kontakt</h1>
      <ContactForm initialData={typed} defaultCompanyName={typed.companies?.name} />
    </div>
  );
}
