'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Wylogowanie poza sidebarem — na telefonie sidebar jest ukryty. */
export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await createClient().auth.signOut();
        router.push('/login');
        router.refresh();
      }}
    >
      <LogOut className="size-4" aria-hidden />
      {pending ? 'Wylogowywanie…' : 'Wyloguj się'}
    </Button>
  );
}
