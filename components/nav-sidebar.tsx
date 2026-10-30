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
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-sidebar">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-foreground">
          INNDES <span className="text-foreground-muted">CRM</span>
        </Link>
      </div>

      <nav aria-label="Główna nawigacja" className="flex-1 space-y-6 overflow-y-auto px-3 pb-4 pt-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted/70">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                if (item.disabled) {
                  return (
                    <li key={item.href}>
                      <span
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground-muted/55"
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
                        className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-foreground"
                      />
                    )}
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-150',
                        active
                          ? 'border-white/15 bg-white/[0.06] text-foreground'
                          : 'border-transparent text-foreground-muted hover:bg-white/[0.04] hover:text-foreground'
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
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
            pathname.startsWith('/ustawienia/profil')
              ? 'bg-white/[0.06] text-foreground'
              : 'text-foreground-muted hover:bg-white/[0.04] hover:text-foreground'
          )}
        >
          <UserRound className="size-4" strokeWidth={1.75} aria-hidden />
          Mój profil
        </Link>
        {profile.role === 'administrator' && (
          <Link
            href="/ustawienia/uzytkownicy"
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
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
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-[13px] font-semibold text-background"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{profile.full_name}</p>
          <p className="truncate text-xs text-foreground-muted">{userRoleLabels[profile.role]}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Wyloguj się"
          title="Wyloguj się"
          className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </aside>
  );
}
