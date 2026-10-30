import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import type {
  ActivityLogEntry,
  AuditLogEntry,
  Company,
  Contact,
  Inquiry,
  InquiryFile,
  InquiryNote,
  Profile,
  ServiceScopeOption,
} from '@/lib/types/database';
import { notFound } from 'next/navigation';
import { InquiryDetailClient } from '@/components/inquiries/inquiry-detail-client';

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: inquiry } = await supabase.from('inquiries').select('*').eq('id', id).single();
  if (!inquiry) notFound();

  const typedInquiry = inquiry as Inquiry;

  const [
    { data: company },
    { data: contact },
    { data: selectedServices },
    { data: allServiceOptions },
    { data: notes },
    { data: files },
    { data: activity },
    { data: auditLog },
    { data: profiles },
  ] = await Promise.all([
    typedInquiry.company_id
      ? supabase.from('companies').select('*').eq('id', typedInquiry.company_id).single()
      : Promise.resolve({ data: null }),
    typedInquiry.contact_id
      ? supabase.from('contacts').select('*').eq('id', typedInquiry.contact_id).single()
      : Promise.resolve({ data: null }),
    supabase.from('inquiry_services').select('service_option_id').eq('inquiry_id', id),
    supabase.from('service_scope_options').select('*').order('sort_order'),
    supabase.from('inquiry_notes').select('*').eq('inquiry_id', id).order('created_at', { ascending: false }),
    supabase.from('inquiry_files').select('*').eq('inquiry_id', id).order('uploaded_at', { ascending: false }),
    supabase.from('activity_log').select('*').eq('inquiry_id', id).order('occurred_at', { ascending: false }),
    supabase
      .from('audit_log')
      .select('*')
      .eq('table_name', 'inquiries')
      .eq('record_id', id)
      .order('changed_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('is_active', true),
  ]);

  const selectedServiceIds = new Set((selectedServices ?? []).map((s) => s.service_option_id as string));

  return (
    <InquiryDetailClient
      inquiry={typedInquiry}
      company={company as Company | null}
      contact={contact as Contact | null}
      allServiceOptions={(allServiceOptions ?? []) as ServiceScopeOption[]}
      selectedServiceIds={selectedServiceIds}
      notes={(notes ?? []) as InquiryNote[]}
      files={(files ?? []) as InquiryFile[]}
      activity={(activity ?? []) as ActivityLogEntry[]}
      auditLog={(auditLog ?? []) as AuditLogEntry[]}
      profiles={(profiles ?? []) as Profile[]}
      currentUserId={profile.id}
    />
  );
}
