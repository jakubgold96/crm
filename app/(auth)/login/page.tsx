import { LoginForm } from './login-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ deactivated?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">INNDES CRM</h1>
          <p className="mt-1 text-sm text-foreground-muted">Zaloguj się do swojego konta</p>
        </div>
        <LoginForm searchParams={searchParams} />
      </div>
    </div>
  );
}
