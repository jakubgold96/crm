'use client';

import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ProfileForm({ fullName }: { fullName: string }) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ full_name: name }).eq('id', user.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <div>
        <Label htmlFor="full_name">Imię i nazwisko</Label>
        <Input id="full_name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Zapisywanie…' : 'Zapisz'}
        </Button>
        {saved && <span className="text-sm text-sage">Zapisano.</span>}
      </div>
    </div>
  );
}
