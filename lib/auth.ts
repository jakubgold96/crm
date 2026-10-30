import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types/database';
import { redirect } from 'next/navigation';

/**
 * Pobiera zalogowanego użytkownika + jego profil (rola, uprawnienia).
 * Przekierowuje do /login, jeśli brak sesji — middleware już to robi na
 * poziomie żądania, ale ta funkcja jest druga linia obrony dla Server
 * Components wywoływanych bezpośrednio (np. przez cache/prefetch).
 */
export async function requireUser(): Promise<{ userId: string; email: string | null; profile: Profile }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    // Profil powinien istnieć zawsze (trigger handle_new_user), ale jeśli
    // z jakiegoś powodu go brak (np. desync po ręcznej ingerencji w bazę),
    // nie pokazujemy pustego/połamanego UI — wylogowujemy i każemy wejść
    // ponownie, co da administratorowi szansę zauważyć problem.
    redirect('/login');
  }

  if (!profile.is_active) {
    redirect('/login?deactivated=1');
  }

  return { userId: user.id, email: user.email ?? null, profile: profile as Profile };
}
