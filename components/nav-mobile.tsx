'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MOBILE_NAV_ITEMS = [
  { href: '/', label: 'Pulpit' },
  { href: '/zapytania', label: 'Zapytania' },
  { href: '/firmy', label: 'Firmy' },
  { href: '/kontakty', label: 'Kontakty' },
];

export function NavMobile() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-surface md:hidden">
      {MOBILE_NAV_ITEMS.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 py-3 text-center text-xs font-medium',
              isActive ? 'text-accent' : 'text-foreground-muted'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
