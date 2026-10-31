import { LeadDetailClient } from '@/components/leads/lead-detail-client';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { AuditLogEntry, Lead, LeadFact } from '@/lib/types/database';
import { notFound } from 'next/navigation';

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const supabase = await createClient();

  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  if (!lead) notFound();

  const [{ data: facts }, { data: audit }, { data: icp }, { data: profiles }, inquiryRes] = await Promise.all([
    supabase.from('lead_facts').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase.from('audit_log').select('*').eq('table_name', 'leads').eq('record_id', id).order('changed_at', { ascending: false }),
    supabase.from('icp_profiles').select('id, name').order('name'),
    // Wszyscy (też nieaktywni) — historia musi pokazać autora nawet po dezaktywacji konta.
    supabase.from('profiles').select('id, full_name').order('full_name'),
    lead.converted_inquiry_id
      ? supabase.from('inquiries').select('number').eq('id', lead.converted_inquiry_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <LeadDetailClient
      lead={lead as Lead}
      facts={(facts ?? []) as LeadFact[]}
      auditLog={(audit ?? []) as AuditLogEntry[]}
      icpProfiles={icp ?? []}
      profiles={profiles ?? []}
      convertedInquiryNumber={(inquiryRes.data as { number: string } | null)?.number ?? null}
    />
  );
}
