import { NavSidebar } from '@/components/nav-sidebar';
import { NavMobile } from '@/components/nav-mobile';
import { requireUser } from '@/lib/auth';
import { UserRound } from 'lucide-react';
import Link from 'next/link';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <NavSidebar profile={profile} />
      </div>
      <main className="min-w-0 flex-1 pb-24 md:pb-0">
        <header className="flex h-14 items-center justify-between px-4 md:hidden">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-foreground">
            INNDES <span className="text-foreground-muted">CRM</span>
          </Link>
          <Link
            href="/ustawienia/profil"
            aria-label="Mój profil"
            className="rounded-full p-2 text-foreground-muted hover:bg-white/[0.06] hover:text-foreground"
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
