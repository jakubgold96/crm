import { ContactForm } from '@/components/contacts/contact-form';
import { createClient } from '@/lib/supabase/server';

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ firma?: string }>;
}) {
  const { firma } = await searchParams;
  let companyName: string | undefined;

  if (firma) {
    const supabase = await createClient();
    const { data } = await supabase.from('companies').select('name').eq('id', firma).single();
    companyName = data?.name;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Nowy kontakt</h1>
      <ContactForm defaultCompanyId={firma} defaultCompanyName={companyName} />
    </div>
  );
}
