import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth';
import type { Profile } from '@/lib/types/database';
import { redirect } from 'next/navigation';
import { UsersTable } from './users-table';

export default async function UsersSettingsPage() {
  const { profile } = await requireUser();

  if (profile.role !== 'administrator') {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase.from('profiles').select('*').order('full_name');

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="rgb-split font-display text-2xl font-bold uppercase tracking-[0.04em] text-foreground">Użytkownicy</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Nowe konta zakładane są przez rejestrację (e-mail + hasło lub magic link). Tutaj zarządzasz rolą,
          uprawnieniem finansowym i dostępem.
        </p>
      </div>
      <UsersTable profiles={(profiles ?? []) as Profile[]} currentUserId={profile.id} />
    </div>
  );
}
