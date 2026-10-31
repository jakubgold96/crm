import { IcpForm } from '@/components/icp/icp-form';
import { PageTitle } from '@/components/ui/page-title';
import { requireUser } from '@/lib/auth';

export default async function NewIcpPage() {
  await requireUser();
  return (
    <div className="max-w-5xl space-y-6">
      <PageTitle>Nowy profil ICP</PageTitle>
      <IcpForm />
    </div>
  );
}
