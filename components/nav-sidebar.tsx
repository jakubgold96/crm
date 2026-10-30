'use client';

import { cn } from '@/lib/utils';
import { userRoleLabels } from '@/lib/enums';
import type { Profile } from '@/lib/types/database';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Archive,
  BarChart3,
  Building2,
  Download,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Sparkles,
  Target,
  UserCog,
  Users,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: LucideIcon; disabled?: boolean };

export const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Praca',
    items: [
      { href: '/', label: 'Pulpit', icon: LayoutDashboard },
      { href: '/zapytania', label: 'Zapytania', icon: Inbox },
      { href: '/zadania', label: 'Zadania', icon: ListChecks },
    ],
  },
  {
    label: 'Baza',
    items: [
      { href: '/firmy', label: 'Firmy', icon: Building2 },
      { href: '/kontakty', label: 'Kontakty', icon: Users },
      { href: '/archiwum', label: 'Archiwum', icon: Archive },
    ],
  },
  {
    label: 'Dane',
    items: [{ href: '/eksport', label: 'Eksport', icon: Download }],
  },
  {
    label: 'Wkrótce',
    items: [
      { href: '/leady', label: 'Leady', icon: Target, disabled: true },
      { href: '/agent', label: 'Agent INNDES', icon: Sparkles, disabled: true },
      { href: '/raporty', label: 'Raporty', icon: BarChart3, disabled: true },
    ],
  },
];

export function isNavActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function NavSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = profile.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <aside className="sticky top-0 z-10 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-sidebar/95">
      <div aria-hidden className="hazard h-1 opacity-80" />
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="group flex items-baseline gap-1.5" aria-label="INNDES CRM — pulpit">
          <span
            data-text="INNDES"
            className="glitch font-display text-lg font-bold uppercase tracking-[0.12em] text-foreground"
          >
            INNDES
          </span>
          <span className="font-data text-[11px] text-cyan">{'//CRM'}</span>
        </Link>
      </div>

      <nav aria-label="Główna nawigacja" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 font-data text-[10.5px] font-medium uppercase tracking-[0.12em] text-foreground-muted/70">
              <span className="text-magenta">{'//'}</span> {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <span
                        className="flex items-center gap-3 px-3 py-2 font-display text-[13.5px] font-semibold uppercase tracking-[0.06em] text-foreground-muted/40"
                        title="Dostępne w kolejnej fazie"
                      >
                        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                        {item.label}
                      </span>
                    </li>
                  );
                }
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href} className="relative">
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-3 top-1/2 h-6 w-[3px] -translate-y-1/2 bg-accent shadow-[0_0_12px_rgb(245_228_0/0.9)]"
                      />
                    )}
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'notch flex items-center gap-3 px-3 py-2 font-display text-[13.5px] font-semibold uppercase tracking-[0.06em] transition-[background-color,color,box-shadow] duration-150',
                        active
                          ? 'bg-accent text-accent-foreground'
                          : 'hover-glitch text-foreground-muted hover:bg-cyan/[0.07] hover:text-cyan'
                      )}
                    >
                      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-0.5 px-3 pb-3">
        <Link
          href="/ustawienia/profil"
          className={cn(
            'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
            pathname.startsWith('/ustawienia/profil')
              ? 'bg-cyan/[0.08] text-cyan'
              : 'text-foreground-muted hover:bg-cyan/[0.06] hover:text-cyan'
          )}
        >
          <UserRound className="size-4" strokeWidth={1.75} aria-hidden />
          Mój profil
        </Link>
        {profile.role === 'administrator' && (
          <Link
            href="/ustawienia/uzytkownicy"
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm transition-colors',
              pathname.startsWith('/ustawienia/uzytkownicy')
                ? 'bg-white/[0.06] text-foreground'
                : 'text-foreground-muted hover:bg-white/[0.04] hover:text-foreground'
            )}
          >
            <UserCog className="size-4" strokeWidth={1.75} aria-hidden />
            Użytkownicy
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        <span
          aria-hidden
          className="notch flex size-9 shrink-0 items-center justify-center bg-accent font-display text-[13px] font-bold text-accent-foreground"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{profile.full_name}</p>
          <p className="truncate font-data text-[11px] uppercase tracking-[0.06em] text-cyan/80">{userRoleLabels[profile.role]}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Wyloguj się"
          title="Wyloguj się"
          className="p-2 text-foreground-muted transition-colors hover:bg-magenta/10 hover:text-magenta"
        >
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
