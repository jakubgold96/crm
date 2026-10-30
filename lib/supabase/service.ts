/**
 * Klient Supabase z kluczem service_role — OMIJA RLS.
 *
 * UŻYWAĆ WYŁĄCZNIE w kodzie server-side, który z definicji musi ominąć RLS
 * (np. przyszła funkcja RODO "usuń dane osobowe kontaktu" wywoływana tylko
 * przez administratora, albo zadania cron Fazy 4/5 bez sesji użytkownika).
 * W Fazie 1 ten plik nie jest jeszcze nigdzie importowany — istnieje jako
 * jedyne dozwolone miejsce na service role key, żeby nikt nie wpadł na
 * pomysł wrzucenia go gdzie indziej (CLAUDE.md #1).
 *
 * NIGDY nie importować tego pliku z komponentu klienckiego ani z kodu, który
 * mógłby trafić do bundla przeglądarki. SUPABASE_SERVICE_ROLE_KEY musi być
 * dostępny tylko jako zmienna środowiskowa bez prefiksu NEXT_PUBLIC_.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createServiceClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createServiceClient() nie może być wywołane w przeglądarce.');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Brak NEXT_PUBLIC_SUPABASE_URL lub SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.'
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
