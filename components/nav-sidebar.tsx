'use client';

import { cn } from '@/lib/utils';
import { userRoleLabels } from '@/lib/enums';
import type { Profile } from '@/lib/types/database';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS: { href: string; label: string; disabled?: boolean }[] = [
  { href: '/', label: 'Pulpit' },
  { href: '/zapytania', label: 'Zapytania' },
  { href: '/zadania', label: 'Zadania' },
  { href: '/firmy', label: 'Firmy' },
  { href: '/kontakty', label: 'Kontakty' },
  { href: '/archiwum', label: 'Archiwum' },
  { href: '/leady', label: 'Leady', disabled: true },
  { href: '/agent', label: 'Agent INNDES', disabled: true },
  { href: '/raporty', label: 'Raporty', disabled: true },
];

export function NavSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-5">
        <span className="text-sm font-semibold tracking-tight text-foreground">INNDES CRM</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          if (item.disabled) {
            return (
              <span
                key={item.href}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground-muted/50"
                title="Dostępne w kolejnej fazie"
              >
                {item.label}
                <span className="text-[10px] uppercase tracking-wide">wkrótce</span>
              </span>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-foreground-muted hover:bg-background hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <Link
          href="/ustawienia/profil"
          className="block rounded-md px-3 py-2 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
        >
          Mój profil
        </Link>
        {profile.role === 'administrator' && (
          <Link
            href="/ustawienia/uzytkownicy"
            className="block rounded-md px-3 py-2 text-sm text-foreground-muted hover:bg-background hover:text-foreground"
          >
            Użytkownicy
          </Link>
        )}
        <div className="mt-2 flex items-center justify-between px-3 py-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{profile.full_name}</p>
            <p className="text-xs text-foreground-muted">{userRoleLabels[profile.role]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-foreground-muted hover:bg-background hover:text-foreground"
        >
          Wyloguj się
        </button>
      </div>
    </aside>
  );
}
