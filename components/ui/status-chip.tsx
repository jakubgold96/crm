/** Chip statusu w kolorze z mapy pilności (lib/ui/urgency.ts); tekst zawsze perłowy dla kontrastu. */
export function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 font-data text-[11px] font-medium uppercase tracking-[0.04em] text-pearl"
      style={{
        background: `color-mix(in srgb, ${color} 22%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 70%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
