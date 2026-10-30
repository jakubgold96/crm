import { InquiriesListClient } from '@/components/inquiries/inquiries-list-client';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import type { Inquiry, Profile } from '@/lib/types/database';

type InquiryWithCompany = Inquiry & { companies: { name: string } | null };

export default async function InquiriesPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*, companies(name)')
    .eq('is_archived', false)
    .order('next_step_due', { ascending: true, nullsFirst: false });

  const { data: profiles } = await supabase.from('profiles').select('*').eq('is_active', true);

  return (
    <InquiriesListClient
      inquiries={(inquiries ?? []) as unknown as InquiryWithCompany[]}
      profiles={(profiles ?? []) as Profile[]}
      currentUserId={profile.id}
    />
  );
}
