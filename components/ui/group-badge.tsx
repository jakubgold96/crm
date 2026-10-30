import { operationalGroupLabels } from '@/lib/enums';
import type { OperationalGroup } from '@/lib/types/database';
import { groupNeon } from '@/lib/ui/urgency';

/** Znacznik grupy operacyjnej — ten sam kolor pilności co nagłówki grup na listach (lib/ui/urgency.ts). */
export function GroupBadge({ group }: { group: OperationalGroup }) {
  const c = groupNeon(group);
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 font-data text-[11px] font-medium uppercase tracking-[0.04em]"
      style={{
        // Tekst zawsze perłowy (kontrast), kolor grupy niesie tło i ramka.
        color: 'var(--pearl)',
        background: `color-mix(in srgb, ${c} 22%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 70%, transparent)`,
      }}
    >
      {operationalGroupLabels[group]}
    </span>
  );
}
