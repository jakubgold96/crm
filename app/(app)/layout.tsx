import { NavSidebar } from '@/components/nav-sidebar';
import { NavMobile } from '@/components/nav-mobile';
import { requireUser } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <NavSidebar profile={profile} />
      </div>
      <main className="flex-1 overflow-x-hidden pb-16 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
      <NavMobile />
    </div>
  );
}
