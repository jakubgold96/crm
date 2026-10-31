import { IcpForm } from '@/components/icp/icp-form';
import { PageTitle } from '@/components/ui/page-title';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { IcpProfile } from '@/lib/types/database';
import { notFound } from 'next/navigation';

export default async function EditIcpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase.from('icp_profiles').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const profile = data as IcpProfile;
  return (
    <div className="max-w-5xl space-y-6">
      <PageTitle>{profile.name}</PageTitle>
      <IcpForm initial={profile} />
    </div>
  );
}
