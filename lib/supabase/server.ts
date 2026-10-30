/**
 * Klient Supabase do użycia w Server Components / Server Actions / Route
 * Handlers. Czyta/zapisuje cookies sesji. Używa publicznego anon key —
 * uwierzytelnienie i autoryzacja idą przez sesję użytkownika + RLS, nie
 * przez podniesione uprawnienia. Service role key (jeśli kiedykolwiek
 * potrzebny — np. dla audit_log insertów robionych poza RLS) żyje
 * WYŁĄCZNIE w lib/supabase/service.ts i nigdy nie jest importowany z kodu
 * dostępnego klientowi (CLAUDE.md #1).
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll wywołane z Server Component bez middleware odświeżającego
            // sesję — bezpieczne do zignorowania, jeśli middleware.ts działa.
          }
        },
      },
    }
  );
}
