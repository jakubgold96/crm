'use client';

import { cn } from '@/lib/utils';
import { isNavActive } from '@/components/nav-sidebar';
import { Building2, Inbox, LayoutDashboard, ListChecks, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Pulpit', icon: LayoutDashboard },
  { href: '/zapytania', label: 'Zapytania', icon: Inbox },
  { href: '/zadania', label: 'Zadania', icon: ListChecks },
  { href: '/firmy', label: 'Firmy', icon: Building2 },
  { href: '/kontakty', label: 'Kontakty', icon: Users },
];

export function NavMobile() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Nawigacja"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-accent/40 bg-sidebar/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_-12px_rgb(245_228_0/0.35)] backdrop-blur md:hidden"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2.5 font-display text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors',
              active ? 'text-accent' : 'text-foreground-muted'
            )}
          >
            <span
              className={cn(
                'notch flex h-7 w-12 items-center justify-center transition-colors',
                active && 'bg-accent text-accent-foreground'
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
