import { LoginForm } from './login-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ deactivated?: string }>;
}) {
  return (
    <div className="relative z-[1] flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] overflow-hidden">
        <div className="grid-floor opacity-50" />
      </div>
      <div className="boot-in relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="flex items-baseline justify-center gap-2">
            <span data-text="INNDES" className="glitch rgb-split font-display text-4xl font-bold uppercase tracking-[0.14em] text-foreground">
              INNDES
            </span>
            <span className="font-data text-sm text-cyan">{'//CRM'}</span>
          </h1>
          <p className="mt-3 font-data text-[13px] text-foreground-muted">
            <span className="text-magenta">&gt;</span> zaloguj się do swojego konta<span aria-hidden className="caret" />
          </p>
        </div>
        <LoginForm searchParams={searchParams} />
      </div>
    </div>
  );
}
