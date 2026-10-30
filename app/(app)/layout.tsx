import { NavSidebar } from '@/components/nav-sidebar';
import { NavMobile } from '@/components/nav-mobile';
import { requireUser } from '@/lib/auth';
import { UserRound } from 'lucide-react';
import Link from 'next/link';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="relative z-[1] flex min-h-screen">
      <div className="hidden md:block">
        <NavSidebar profile={profile} />
      </div>
      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
          <Link href="/" className="flex items-baseline gap-1.5" aria-label="INNDES CRM — pulpit">
            <span data-text="INNDES" className="glitch font-display text-base font-bold uppercase tracking-[0.12em] text-foreground">
              INNDES
            </span>
            <span className="font-data text-[11px] text-cyan">{'//CRM'}</span>
          </Link>
          <Link
            href="/ustawienia/profil"
            aria-label="Mój profil"
            className="p-2 text-foreground-muted hover:text-cyan"
          >
            <UserRound className="size-5" strokeWidth={1.75} aria-hidden />
          </Link>
        </header>
        <div className="mx-auto max-w-[88rem] px-4 pb-6 md:px-8 md:py-6">{children}</div>
      </main>
      <NavMobile />
    </div>
  );
}
