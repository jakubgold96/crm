import { InquiryForm } from '@/components/inquiries/inquiry-form';

export default async function NewInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ firma?: string }>;
}) {
  const { firma } = await searchParams;
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Nowe zapytanie</h1>
      <InquiryForm defaultCompanyId={firma} />
    </div>
  );
}
