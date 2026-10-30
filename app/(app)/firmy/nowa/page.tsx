import { CompanyForm } from '@/components/companies/company-form';

export default function NewCompanyPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Nowa firma</h1>
      <CompanyForm />
    </div>
  );
}
