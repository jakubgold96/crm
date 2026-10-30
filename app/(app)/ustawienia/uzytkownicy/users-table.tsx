'use client';

import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/input';
import { userRoleLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/client';
import type { Profile, UserRole } from '@/lib/types/database';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function UsersTable({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(profiles);
  const [error, setError] = useState<string | null>(null);

  async function updateProfile(id: string, patch: Partial<Profile>) {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setRows((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    router.refresh();
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-danger">{error}</p>}
      <div className="hud overflow-hidden bg-surface/90">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.06em] text-foreground-muted">
            <tr>
              <th className="px-4 py-2.5">Użytkownik</th>
              <th className="px-4 py-2.5">Rola</th>
              <th className="px-4 py-2.5">Widzi finanse</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-pearl/[0.04]">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-foreground">{p.full_name}</span>
                  {p.id === currentUserId && <span className="ml-1 text-xs text-foreground-muted">(Ty)</span>}
                </td>
                <td className="px-4 py-2.5">
                  <Select
                    value={p.role}
                    onChange={(e) => updateProfile(p.id, { role: e.target.value as UserRole })}
                    disabled={p.id === currentUserId}
                    className="h-8 w-40"
                  >
                    {Object.entries(userRoleLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-4 py-2.5">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.can_view_financials}
                      onChange={(e) => updateProfile(p.id, { can_view_financials: e.target.checked })}
                    />
                    <span className="text-xs text-foreground-muted">
                      {p.role === 'administrator' ? 'Zawsze (administrator)' : ''}
                    </span>
                  </label>
                </td>
                <td className="px-4 py-2.5">
                  {p.id === currentUserId ? (
                    <Badge tone="sage">Aktywny</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => updateProfile(p.id, { is_active: !p.is_active })}
                      className="inline-block"
                    >
                      <Badge tone={p.is_active ? 'sage' : 'danger'}>
                        {p.is_active ? 'Aktywny (kliknij, by odebrać dostęp)' : 'Dezaktywowany (kliknij, by przywrócić)'}
                      </Badge>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
