'use client';

import { PageTitle } from '@/components/ui/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import {
  activityTypeLabels,
  inquirySourceLabels,
  objectTypeLabels,
  operationalGroupLabels,
  salesStageLabels,
} from '@/lib/enums';
import { validateScopeForStage } from '@/lib/validation/inquiry';
import { createClient } from '@/lib/supabase/client';
import { formatDate, formatDateTime } from '@/lib/utils';
import type {
  ActivityLogEntry,
  AuditLogEntry,
  Company,
  Contact,
  Inquiry,
  InquiryFile,
  InquiryNote,
  Profile,
  ServiceScopeOption,
} from '@/lib/types/database';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  inquiry: Inquiry;
  company: Company | null;
  contact: Contact | null;
  allServiceOptions: ServiceScopeOption[];
  selectedServiceIds: Set<string>;
  notes: InquiryNote[];
  files: InquiryFile[];
  activity: ActivityLogEntry[];
  auditLog: AuditLogEntry[];
  profiles: Profile[];
  currentUserId: string;
}

export function InquiryDetailClient({
  inquiry: initialInquiry,
  company,
  contact,
  allServiceOptions,
  selectedServiceIds: initialSelectedServiceIds,
  notes: initialNotes,
  files,
  activity,
  auditLog,
  profiles,
  currentUserId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [inquiry, setInquiry] = useState(initialInquiry);
  const [selectedServiceIds, setSelectedServiceIds] = useState(initialSelectedServiceIds);
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  async function updateField<K extends keyof Inquiry>(field: K, value: Inquiry[K]) {
    setSavingField(field as string);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Jeśli zmieniamy sales_stage, sprawdź wymóg ustalonego zakresu usługi.
    if (field === 'sales_stage') {
      const scopeError = validateScopeForStage({
        sales_stage: value as string,
        scope_undetermined: inquiry.scope_undetermined,
        service_option_ids: Array.from(selectedServiceIds),
      });
      if (scopeError) {
        setError(scopeError);
        setSavingField(null);
        return;
      }
    }

    const { error } = await supabase
      .from('inquiries')
      .update({ [field]: value, updated_by: user?.id })
      .eq('id', inquiry.id);

    setSavingField(null);
    if (error) {
      setError(error.message);
      return;
    }
    setInquiry((prev) => ({ ...prev, [field]: value }));
    router.refresh();
  }

  async function toggleService(serviceId: string) {
    const next = new Set(selectedServiceIds);
    if (next.has(serviceId)) next.delete(serviceId);
    else next.add(serviceId);
    setSelectedServiceIds(next);

    const { error } = await supabase.rpc('set_inquiry_services', {
      p_inquiry_id: inquiry.id,
      p_service_option_ids: Array.from(next),
    });
    if (error) setError(error.message);
  }

  async function handleAddNote() {
    if (!newNote.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('inquiry_notes')
      .insert({ inquiry_id: inquiry.id, body: newNote.trim(), created_by: user?.id })
      .select('*')
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setNotes((prev) => [data as InquiryNote, ...prev]);
    setNewNote('');
    router.refresh();
  }

  async function handleHideNote(noteId: string, reason: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('inquiry_notes')
      .update({ is_hidden: true, hidden_reason: reason, hidden_at: new Date().toISOString(), hidden_by: user?.id })
      .eq('id', noteId);
    if (error) {
      setError(error.message);
      return;
    }
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, is_hidden: true, hidden_reason: reason } : n)));
  }

  async function handleArchive() {
    if (!archiveReason.trim()) {
      setError('Podaj powód archiwizacji.');
      return;
    }
    const { error } = await supabase
      .from('inquiries')
      .update({ is_archived: true, archived_reason: archiveReason.trim(), archived_at: new Date().toISOString() })
      .eq('id', inquiry.id);
    if (error) {
      setError(error.message);
      return;
    }
    setArchiving(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PageTitle className="font-data tracking-[0.02em]">{inquiry.number}</PageTitle>
            {inquiry.is_archived && <Badge tone="neutral">Zarchiwizowane</Badge>}
          </div>
          <p className="mt-1 text-sm text-foreground-muted">
            {company ? (
              <Link href={`/firmy/${company.id}`} className="hover:text-accent hover:underline">
                {company.name}
              </Link>
            ) : (
              '—'
            )}
            {inquiry.inquiry_date && ` · zgłoszono ${formatDate(inquiry.inquiry_date)}`}
          </p>
        </div>
        {!inquiry.is_archived && (
          <Button size="sm" variant="secondary" onClick={() => setArchiving(true)}>
            Archiwizuj
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {archiving && (
        <Card>
          <CardContent className="space-y-3 py-4">
            <Label htmlFor="archive_reason">Powód archiwizacji *</Label>
            <Textarea id="archive_reason" rows={2} value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" variant="danger" onClick={handleArchive}>
                Potwierdź archiwizację
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setArchiving(false)}>
                Anuluj
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Podstawowe */}
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Field label="Osoba kontaktowa" value={contact ? [contact.first_name, contact.last_name].filter(Boolean).join(' ') : null} />
                <Field label="Kraj / miejsce" value={[inquiry.country, inquiry.project_location].filter(Boolean).join(', ')} />
                <Field
                  label="Typ obiektu"
                  value={
                    inquiry.object_type
                      ? objectTypeLabels[inquiry.object_type] +
                        (inquiry.object_type === 'inne' && inquiry.object_type_other ? ` (${inquiry.object_type_other})` : '')
                      : null
                  }
                />
                <Field label="Źródło" value={inquiry.source ? inquirySourceLabels[inquiry.source] : null} />
              </dl>
              {inquiry.short_description && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Opis</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{inquiry.short_description}</p>
                </div>
              )}

              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">Zakres usługi</p>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={inquiry.scope_undetermined}
                    onChange={(e) => updateField('scope_undetermined', e.target.checked)}
                  />
                  Nieustalone
                </label>
                {!inquiry.scope_undetermined && (
                  <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {allServiceOptions.map((opt) => (
                      <label key={opt.id} className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.has(opt.id)}
                          onChange={() => toggleService(opt.id)}
                        />
                        {opt.label_pl}
                      </label>
                    ))}
                  </div>
                )}
                {inquiry.scope_notes && <p className="mt-2 text-sm text-foreground-muted">{inquiry.scope_notes}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Oferta — placeholder MVP */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle>Oferta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground-muted">Pełny moduł Ofert pojawi się w kolejnej fazie.</p>
            </CardContent>
          </Card>

          {/* Pliki */}
          <Card>
            <CardHeader>
              <CardTitle>Pliki ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="text-sm text-foreground-muted">Brak załączonych plików.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-foreground">{f.file_name}</span>
                      <span className="text-xs text-foreground-muted">{formatDate(f.uploaded_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-foreground-muted">
                Przesyłanie plików: dokończone w ramach Fazy 2 (integracja ze Storage w UI).
              </p>
            </CardContent>
          </Card>

          {/* Aktywność */}
          <Card>
            <CardHeader>
              <CardTitle>Aktywność</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Dodaj notatkę…"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                  Dodaj notatkę
                </Button>
              </div>

              <ul className="space-y-3 border-t border-border pt-4">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{activityTypeLabels[a.type]}</Badge>
                      <span className="text-xs text-foreground-muted">{formatDateTime(a.occurred_at)}</span>
                    </div>
                    <p className="mt-1 text-foreground">{a.summary}</p>
                  </li>
                ))}
                {activity.length === 0 && <p className="text-sm text-foreground-muted">Brak aktywności.</p>}
              </ul>

              {notes.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Notatki (pełna treść)
                  </p>
                  <ul className="space-y-2">
                    {notes.map((n) => (
                      <li key={n.id} className="hud hud-sm bg-surface-raised p-3 text-sm">
                        {n.is_hidden ? (
                          <p className="italic text-foreground-muted">
                            Notatka ukryta ({n.hidden_reason || 'brak powodu'})
                          </p>
                        ) : (
                          <>
                            <p className="whitespace-pre-wrap text-foreground">{n.body}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs text-foreground-muted">{formatDateTime(n.created_at)}</span>
                              <button
                                type="button"
                                className="text-xs text-danger hover:underline"
                                onClick={() => {
                                  const reason = window.prompt('Powód ukrycia notatki:');
                                  if (reason) handleHideNote(n.id, reason);
                                }}
                              >
                                Ukryj wpis
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historia zmian — osobna sekcja audytowa */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Historia zmian</CardTitle>
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => setShowHistory((s) => !s)}
              >
                {showHistory ? 'Zwiń' : `Pokaż (${auditLog.length})`}
              </button>
            </CardHeader>
            {showHistory && (
              <CardContent>
                {auditLog.length === 0 ? (
                  <p className="text-sm text-foreground-muted">Brak zmian.</p>
                ) : (
                  <ul className="space-y-2">
                    {auditLog.map((entry) => (
                      <li key={entry.id} className="text-sm">
                        <span className="text-foreground-muted">{formatDateTime(entry.changed_at)}</span>{' '}
                        <span className="text-foreground">
                          — zmieniono <strong>{entry.field_name}</strong>: {entry.old_value || '—'} →{' '}
                          {entry.new_value || '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Następne działanie */}
          <Card>
            <CardHeader>
              <CardTitle>Następne działanie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InlineSelect
                label="Grupa operacyjna"
                value={inquiry.operational_group}
                options={operationalGroupLabels}
                onChange={(v) => updateField('operational_group', v as Inquiry['operational_group'])}
                saving={savingField === 'operational_group'}
              />
              <InlineSelect
                label="Etap sprzedaży"
                value={inquiry.sales_stage}
                options={salesStageLabels}
                onChange={(v) => updateField('sales_stage', v as Inquiry['sales_stage'])}
                saving={savingField === 'sales_stage'}
              />
              <div>
                <Label htmlFor="owner_id">Właściciel</Label>
                <Select
                  id="owner_id"
                  value={inquiry.owner_id ?? ''}
                  onChange={(e) => updateField('owner_id', (e.target.value || null) as Inquiry['owner_id'])}
                >
                  <option value="">— nie przypisano —</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} {p.id === currentUserId ? '(Ty)' : ''}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="next_step">Następny krok</Label>
                <Input
                  id="next_step"
                  defaultValue={inquiry.next_step ?? ''}
                  onBlur={(e) => updateField('next_step', e.target.value || null)}
                />
              </div>
              <div>
                <Label htmlFor="next_step_due">Termin</Label>
                <Input
                  id="next_step_due"
                  type="date"
                  defaultValue={inquiry.next_step_due ?? ''}
                  onChange={(e) => updateField('next_step_due', e.target.value || null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Powiązane leady i kontakty */}
          <Card>
            <CardHeader>
              <CardTitle>Powiązane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {contact && (
                <Link href={`/kontakty/${contact.id}`} className="block text-accent hover:underline">
                  Kontakt: {[contact.first_name, contact.last_name].filter(Boolean).join(' ')}
                </Link>
              )}
              {company && (
                <Link href={`/firmy/${company.id}`} className="block text-accent hover:underline">
                  Firma: {company.name}
                </Link>
              )}
              <p className="text-xs text-foreground-muted">Powiązane leady pojawią się w Fazie 3.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value || '—'}</dd>
    </div>
  );
}

function InlineSelect({
  label,
  value,
  options,
  onChange,
  saving,
}: {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (v: string) => void;
  saving: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={saving}>
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
    </div>
  );
}
