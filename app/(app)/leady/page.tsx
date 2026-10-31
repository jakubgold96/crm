import { LeadsListClient, type LeadListItem } from '@/components/leads/leads-list-client';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function LeadsPage() {
  await requireUser();
  const supabase = await createClient();

  const [{ data: leads }, { data: icp }, { data: profiles }] = await Promise.all([
    supabase.from('leads').select('*, icp_profiles(name)').eq('is_archived', false).order('updated_at', { ascending: false }),
    supabase.from('icp_profiles').select('id, name').eq('is_archived', false).order('name'),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
  ]);

  return (
    <LeadsListClient
      leads={(leads ?? []) as unknown as LeadListItem[]}
      icpProfiles={icp ?? []}
      profiles={profiles ?? []}
    />
  );
}
