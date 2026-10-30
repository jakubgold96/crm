import { CompanyForm } from '@/components/companies/company-form';
import { createClient } from '@/lib/supabase/server';
import type { Company } from '@/lib/types/database';
import { notFound } from 'next/navigation';

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: company } = await supabase.from('companies').select('*').eq('id', id).single();
  if (!company) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Edytuj firmę</h1>
      <CompanyForm initialData={company as Company} />
    </div>
  );
}
