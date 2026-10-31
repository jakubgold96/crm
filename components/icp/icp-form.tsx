'use client';

import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { companySegmentLabels, objectTypeLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/client';
import type { CompanySegment, IcpProfile, ObjectType } from '@/lib/types/database';
import { icpSchema, linesToArray } from '@/lib/validation/lead';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LIST_FIELDS = [
  ['countries', 'Kraje', 'Polska\nNorwegia'],
  ['matching_services', 'Pasujące usługi', ''],
  ['positive_criteria', 'Kryteria pozytywne', ''],
  ['exclusion_criteria', 'Kryteria wykluczające', ''],
  ['example_projects', 'Przykładowe projekty', ''],
] as const;

type ListField = (typeof LIST_FIELDS)[number][0];

export function IcpForm({ initial }: { initial?: IcpProfile }) {
  const router = useRouter();
  const [v, setV] = useState({
    name: initial?.name ?? '',
    segment: (initial?.segment ?? '') as CompanySegment | '',
    object_type: (initial?.object_type ?? '') as ObjectType | '',
    min_scope: initial?.min_scope ?? '',
    typical_problem: initial?.typical_problem ?? '',
    preferred_language: initial?.preferred_language ?? '',
    message_tone: initial?.message_tone ?? '',
    countries: (initial?.countries ?? []).join('\n'),
    matching_services: (initial?.matching_services ?? []).join('\n'),
    positive_criteria: (initial?.positive_criteria ?? []).join('\n'),
    exclusion_criteria: (initial?.exclusion_criteria ?? []).join('\n'),
    example_projects: (initial?.example_projects ?? []).join('\n'),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof v, value: string) => setV((s) => ({ ...s, [k]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = icpSchema.safeParse(v);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Popraw formularz');
      return;
    }
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const row = {
      name: parsed.data.name,
      segment: v.segment || null,
      object_type: v.object_type || null,
      min_scope: v.min_scope.trim() || null,
      typical_problem: v.typical_problem.trim() || null,
      preferred_language: v.preferred_language.trim() || null,
      message_tone: v.message_tone.trim() || null,
      ...(Object.fromEntries(LIST_FIELDS.map(([k]) => [k, linesToArray(v[k as ListField])])) as Record<ListField, string[]>),
      updated_by: user?.id,
    };
    const res = initial
      ? await supabase.from('icp_profiles').update(row).eq('id', initial.id).select('id').single()
      : await supabase.from('icp_profiles').insert({ ...row, created_by: user?.id }).select('id').single();
    setSaving(false);
    if (res.error) {
      setError(res.error.message);
      return;
    }
    router.push('/icp');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="hud space-y-5 bg-surface/90 p-5 sm:p-6" noValidate>
      {error && (
        <p role="alert" className="bg-danger-bg px-3 py-2 text-sm text-danger shadow-[inset_0_0_0_1px_rgb(255_47_163/0.45)]">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Label htmlFor="name">Nazwa profilu</Label>
          <Input id="name" value={v.name} onChange={(e) => set('name', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="segment">Segment</Label>
          <Select id="segment" value={v.segment} onChange={(e) => set('segment', e.target.value)}>
            <option value="">—</option>
            {Object.entries(companySegmentLabels).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="object_type">Typ obiektu</Label>
          <Select id="object_type" value={v.object_type} onChange={(e) => set('object_type', e.target.value)}>
            <option value="">—</option>
            {Object.entries(objectTypeLabels).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="typical_problem">Typowy problem klienta</Label>
          <Textarea id="typical_problem" rows={2} value={v.typical_problem} onChange={(e) => set('typical_problem', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="min_scope">Minimalna skala</Label>
          <Textarea id="min_scope" rows={2} value={v.min_scope} onChange={(e) => set('min_scope', e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIST_FIELDS.map(([k, label, placeholder]) => (
          <div key={k}>
            <Label htmlFor={k}>{label} (jedna w linii)</Label>
            <Textarea id={k} rows={4} placeholder={placeholder} value={v[k as ListField]} onChange={(e) => set(k as ListField, e.target.value)} />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="preferred_language">Preferowany język</Label>
          <Input id="preferred_language" value={v.preferred_language} onChange={(e) => set('preferred_language', e.target.value)} />
        </div>
        <div>
          <Label htmlFor="message_tone">Ton wiadomości</Label>
          <Input id="message_tone" value={v.message_tone} onChange={(e) => set('message_tone', e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Zapisywanie…' : 'Zapisz profil'}
        </Button>
        <Link href="/icp">
          <Button type="button" variant="secondary">
            Anuluj
          </Button>
        </Link>
      </div>
    </form>
  );
}
