'use client';

import { ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Szybkie wyszukiwanie z pulpitu. Zwykła wyszukiwarka (nie agent AI — ten
 * wchodzi w Fazie 4): przenosi na /zapytania z wypełnionym polem szukania,
 * gdzie działa ta sama logika co w liście (numer/firma/kontakt/kraj/opis/
 * następny krok).
 */
export function QuickSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const query = q.trim();
        router.push(query ? `/zapytania?q=${encodeURIComponent(query)}` : '/zapytania');
      }}
      className="flex w-full max-w-md items-center gap-2 rounded-full bg-hero-field p-1.5 pl-4 shadow-[0_1px_2px_rgb(18_20_26/0.06),0_8px_24px_-12px_rgb(18_20_26/0.25)] ring-1 ring-hero-line transition-shadow focus-within:ring-2 focus-within:ring-[color:var(--greet-1)]"
    >
      <Search className="size-4 shrink-0 text-hero-muted" strokeWidth={2} aria-hidden />
      <label htmlFor="quick-search" className="sr-only">
        Szukaj zapytania
      </label>
      <input
        id="quick-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Szukaj: numer, firma, kontakt, kraj…"
        className="min-w-0 flex-1 bg-transparent text-sm text-hero-fg caret-[color:var(--greet-1)] placeholder:text-hero-muted focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Szukaj"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-hero-fg text-white transition-transform duration-150 ease-out hover:scale-105 active:scale-95"
      >
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </form>
  );
}
