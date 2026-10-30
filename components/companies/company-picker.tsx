'use client';

import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import type { Company } from '@/lib/types/database';
import { useEffect, useRef, useState } from 'react';

/** Prosty picker firmy z wyszukiwaniem po nazwie — używany w formularzach kontaktu i zapytania. */
export function CompanyPicker({
  value,
  onChange,
  initialLabel,
}: {
  value: string;
  onChange: (companyId: string, companyName: string) => void;
  initialLabel?: string;
}) {
  const [query, setQuery] = useState(initialLabel ?? '');
  const [results, setResults] = useState<Company[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query === initialLabel) {
      const id = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(id);
    }
    const timeout = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('companies')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
        .eq('is_archived', false)
        .limit(8);
      setResults((data ?? []) as Company[]);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Szukaj firmy po nazwie…"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border border-border-strong bg-surface-raised py-1 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.7)]">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.04]"
                onClick={() => {
                  onChange(c.id, c.name);
                  setQuery(c.name);
                  setOpen(false);
                }}
              >
                {c.name}
                {c.country && <span className="ml-1 text-xs text-foreground-muted">({c.country})</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {value && <input type="hidden" value={value} readOnly />}
    </div>
  );
}
