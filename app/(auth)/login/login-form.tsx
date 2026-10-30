'use client';

import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'password' | 'magic-link';

export function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ deactivated?: string }>;
}) {
  const { deactivated } = use(searchParams);
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('Nieprawidłowy e-mail lub hasło.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) {
      setError('Nie udało się wysłać linku logowania. Spróbuj ponownie.');
      return;
    }
    setMagicLinkSent(true);
  }

  if (magicLinkSent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm text-foreground">
        Wysłaliśmy link logowania na adres <strong>{email}</strong>. Sprawdź skrzynkę i kliknij
        link, aby się zalogować.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)]">
      {deactivated && (
        <div className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          Twoje konto zostało dezaktywowane. Skontaktuj się z administratorem.
        </div>
      )}

      <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {mode === 'password' && (
          <div>
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logowanie…' : mode === 'password' ? 'Zaloguj się' : 'Wyślij link logowania'}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'password' ? 'magic-link' : 'password');
          setError(null);
        }}
        className="mt-4 w-full text-center text-sm text-accent hover:underline"
      >
        {mode === 'password' ? 'Zaloguj się linkiem e-mail (bez hasła)' : 'Zaloguj się hasłem'}
      </button>
    </div>
  );
}
