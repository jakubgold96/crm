/**
 * Klient Supabase do użycia w komponentach klienckich ("use client").
 * Używa tylko publicznego anon key — nigdy service role key (CLAUDE.md #1).
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
