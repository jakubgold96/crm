import { CompanyForm } from '@/components/companies/company-form';

export default function NewCompanyPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-[0.04em] text-foreground">Nowa firma</h1>
      <CompanyForm />
    </div>
  );
}
