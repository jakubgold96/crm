'use client';

import { ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Szybkie wyszukiwanie z pulpitu. Zwykła wyszukiwarka (nie agent AI — ten
 * wchodzi w Fazie 4): przenosi na /zapytania z wypełnionym polem szukania.
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
      className="group flex w-full max-w-lg items-stretch border-b-2 border-border-strong bg-void/50 shadow-[inset_0_0_0_1px_var(--border)] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[inset_0_0_0_1px_rgb(61_90_254/0.3),0_10px_30px_-16px_rgb(61_90_254/0.8)]"
    >
      <span className="flex items-center pl-3.5 pr-2 font-data text-sm text-accent" aria-hidden>
        <Search className="size-4" strokeWidth={2} />
      </span>
      <label htmlFor="quick-search" className="sr-only">
        Szukaj zapytania
      </label>
      <input
        id="quick-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="szukaj: numer, firma, kontakt, kraj…"
        className="h-12 min-w-0 flex-1 bg-transparent font-data text-sm text-foreground placeholder:text-foreground-muted/70 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Szukaj"
        className="notch hover-glitch m-1.5 flex w-11 shrink-0 items-center justify-center bg-accent text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
      </button>
    </form>
  );
}
