import { LeadForm } from '@/components/leads/lead-form';
import { PageTitle } from '@/components/ui/page-title';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function NewLeadPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const [{ data: icp }, { data: profiles }] = await Promise.all([
    supabase.from('icp_profiles').select('id, name').eq('is_archived', false).order('name'),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <PageTitle>Nowy lead</PageTitle>
        <p className="mt-2 text-sm text-foreground-muted">Wystarczy domena firmy — resztę uzupełnisz na karcie leada.</p>
      </div>
      <LeadForm icpProfiles={icp ?? []} profiles={profiles ?? []} currentUserId={profile.id} />
    </div>
  );
}
