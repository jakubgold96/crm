import { DashboardView, type DashboardInquiry } from '@/components/dashboard/dashboard-view';
import { requireUser } from '@/lib/auth';
import type { StageChange } from '@/lib/dashboard/sales-kpis';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const { profile } = await requireUser();
  const supabase = await createClient();

  // Archiwalne też — wygrane/przegrane bywają archiwizowane, a KPI liczą historię.
  const [{ data: inquiryRows }, { data: stageRows }] = await Promise.all([
    supabase.from('inquiries').select('*, companies(name)'),
    supabase
      .from('audit_log')
      .select('record_id, old_value, new_value, changed_at')
      .eq('table_name', 'inquiries')
      .eq('field_name', 'sales_stage'),
  ]);

  return (
    <DashboardView
      profile={profile}
      all={(inquiryRows ?? []) as unknown as DashboardInquiry[]}
      stageChanges={(stageRows ?? []) as StageChange[]}
      now={new Date()}
    />
  );
}
