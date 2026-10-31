'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { PageTitle } from '@/components/ui/page-title';
import { StatusChip } from '@/components/ui/status-chip';
import { contactConsentLabels, factConfidenceLabels, leadStatusLabels } from '@/lib/enums';
import { createClient } from '@/lib/supabase/client';
import type { AuditLogEntry, ContactConsent, IcpProfile, Lead, LeadFact, LeadStatus, Profile } from '@/lib/types/database';
import { leadStatusNeon } from '@/lib/ui/urgency';
import { formatDate, formatDateTime } from '@/lib/utils';
import { factSchema, scoreSchema } from '@/lib/validation/lead';
import { ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CONFIDENCE_COLOR: Record<LeadFact['confidence'], string> = {
  wysoka: 'var(--sage)',
  srednia: 'var(--cobalt)',
  niska: 'var(--terracotta)',
  brak_potwierdzenia: 'var(--danger)',
};

const FIELD_LABELS: Record<string, string> = {
  status: 'Status',
  score: 'Wynik',
  score_rationale: 'Uzasadnienie wyniku',
  owner_id: 'Właściciel',
  icp_profile_id: 'Profil ICP',
  contact_consent: 'Zgoda na kontakt',
  converted_inquiry_id: 'Zapytanie z leada',
  is_archived: 'Archiwum',
  archived_reason: 'Powód archiwizacji',
};

function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function LeadDetailClient({
  lead,
  facts,
  auditLog,
  icpProfiles,
  profiles,
  convertedInquiryNumber,
}: {
  lead: Lead;
  facts: LeadFact[];
  auditLog: AuditLogEntry[];
  icpProfiles: Pick<IcpProfile, 'id' | 'name'>[];
  profiles: Pick<Profile, 'id' | 'full_name'>[];
  convertedInquiryNumber: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const nameOf = (id: string | null) => profiles.find((p) => p.id === id)?.full_name ?? (id ? 'nieznany użytkownik' : '—');
  const title = lead.company_name || lead.domain || 'Lead';
  const locked = Boolean(lead.converted_inquiry_id) || lead.is_archived;

  async function update(patch: Partial<Lead>, key: string) {
    setError(null);
    setBusy(key);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: e } = await supabase.from('leads').update({ ...patch, updated_by: user?.id }).eq('id', lead.id);
    setBusy(null);
    if (e) {
      setError(e.message);
      return false;
    }
    router.refresh();
    return true;
  }

  // ---------- Dane leada ----------
  const [data, setData] = useState({
    company_name: lead.company_name ?? '',
    country: lead.country ?? '',
    icp_profile_id: lead.icp_profile_id ?? '',
    owner_id: lead.owner_id ?? '',
    contact_consent: lead.contact_consent,
    need: lead.need ?? '',
    proposed_service: lead.proposed_service ?? '',
  });

  // ---------- Scoring ----------
  const [score, setScore] = useState({ score: lead.score?.toString() ?? '', score_rationale: lead.score_rationale ?? '' });
  const [scoreErrors, setScoreErrors] = useState<Record<string, string>>({});

  async function saveScore(e: React.FormEvent) {
    e.preventDefault();
    const parsed = scoreSchema.safeParse(score);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setScoreErrors(next);
      return;
    }
    setScoreErrors({});
    await update({ score: parsed.data.score, score_rationale: parsed.data.score_rationale }, 'score');
  }

  // ---------- Fakty ----------
  const [fact, setFact] = useState({ fact: '', source_url: '', verified_at: '', confidence: 'brak_potwierdzenia' as LeadFact['confidence'] });
  const [factErrors, setFactErrors] = useState<Record<string, string>>({});
  const [showHidden, setShowHidden] = useState(false);
  const [hiding, setHiding] = useState<{ id: string; reason: string } | null>(null);

  async function addFact(e: React.FormEvent) {
    e.preventDefault();
    const parsed = factSchema.safeParse(fact);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setFactErrors(next);
      return;
    }
    setFactErrors({});
    setBusy('fact');
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const v = parsed.data;
    const { error: err } = await supabase.from('lead_facts').insert({
      lead_id: lead.id,
      fact: v.fact,
      source_url: v.source_url || null,
      verified_at: v.verified_at || null,
      confidence: v.confidence,
      created_by: user?.id,
    });
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setFact({ fact: '', source_url: '', verified_at: '', confidence: 'brak_potwierdzenia' });
    router.refresh();
  }

  async function hideFact() {
    if (!hiding || hiding.reason.trim().length < 3) return;
    setBusy('hide');
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error: err } = await supabase
      .from('lead_facts')
      .update({ is_hidden: true, hidden_reason: hiding.reason.trim(), hidden_at: new Date().toISOString(), hidden_by: user?.id })
      .eq('id', hiding.id);
    setBusy(null);
    if (err) {
      setError(err.message);
      return;
    }
    setHiding(null);
    router.refresh();
  }

  // ---------- Konwersja ----------
  const [confirmConvert, setConfirmConvert] = useState(false);
  async function convert() {
    setError(null);
    setBusy('convert');
    const supabase = createClient();
    const { data: inquiry, error: err } = await supabase.rpc('convert_lead_to_inquiry', { p_lead_id: lead.id });
    setBusy(null);
    if (err || !inquiry) {
      setError(err?.message ?? 'Nie udało się utworzyć zapytania.');
      setConfirmConvert(false);
      return;
    }
    router.push(`/zapytania/${(inquiry as { id: string }).id}`);
    router.refresh();
  }

  // ---------- Archiwum ----------
  const [archiveReason, setArchiveReason] = useState('');
  const [archiving, setArchiving] = useState(false);

  const visibleFacts = facts.filter((f) => !f.is_hidden);
  const hiddenFacts = facts.filter((f) => f.is_hidden);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <PageTitle>{title}</PageTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusChip label={leadStatusLabels[lead.status]} color={leadStatusNeon(lead.status)} />
            {lead.domain && (
              <a
                href={`https://${lead.domain}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 font-data text-xs text-pearl underline decoration-cobalt decoration-2 underline-offset-4 hover:decoration-magenta"
              >
                {lead.domain}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
            {lead.is_archived && <Badge tone="neutral">Zarchiwizowany</Badge>}
            {lead.contact_consent === 'zakaz' && <Badge tone="danger">Zakaz kontaktu</Badge>}
          </div>
        </div>
        {!locked && (
          <div className="w-full sm:w-64">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={lead.status}
              disabled={busy === 'status'}
              onChange={(e) => update({ status: e.target.value as LeadStatus }, 'status')}
            >
              {Object.entries(leadStatusLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="bg-danger-bg px-3 py-2 text-sm text-danger shadow-[inset_0_0_0_1px_rgb(255_47_163/0.45)]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* Scoring */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.score !== null ? (
                <div className="flex items-start gap-5">
                  <p className="font-display text-5xl font-bold leading-none text-cobalt">{lead.score}</p>
                  <p className="text-sm text-foreground">{lead.score_rationale}</p>
                </div>
              ) : (
                <p className="text-sm text-foreground-muted">Lead nie ma jeszcze wyniku. Wynik zawsze zapisujemy razem z uzasadnieniem.</p>
              )}
              {!locked && (
                <form onSubmit={saveScore} className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-start" noValidate>
                  <div>
                    <Label htmlFor="score">Wynik 0–100</Label>
                    <Input
                      id="score"
                      inputMode="numeric"
                      value={score.score}
                      onChange={(e) => setScore((s) => ({ ...s, score: e.target.value }))}
                      aria-invalid={Boolean(scoreErrors.score)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rationale">Uzasadnienie</Label>
                    <Textarea
                      id="rationale"
                      rows={2}
                      value={score.score_rationale}
                      onChange={(e) => setScore((s) => ({ ...s, score_rationale: e.target.value }))}
                      aria-invalid={Boolean(scoreErrors.score_rationale)}
                    />
                  </div>
                  <Button type="submit" size="sm" className="sm:mt-6" disabled={busy === 'score'}>
                    {busy === 'score' ? 'Zapisywanie…' : 'Zapisz wynik'}
                  </Button>
                  {(scoreErrors.score || scoreErrors.score_rationale) && (
                    <p className="text-xs text-danger sm:col-span-3">{scoreErrors.score ?? scoreErrors.score_rationale}</p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {/* Fakty */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Fakty ze źródłami</CardTitle>
              <span className="font-data text-sm text-foreground-muted tabular">[{visibleFacts.length}]</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleFacts.length === 0 ? (
                <p className="text-sm text-foreground-muted">
                  Brak faktów. Każdy fakt ma link do źródła — bez źródła zapisuje się tylko jako „brak potwierdzenia”.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {visibleFacts.map((f) => (
                    <li key={f.id} className="py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 text-sm text-foreground">{f.fact}</p>
                        <StatusChip label={factConfidenceLabels[f.confidence]} color={CONFIDENCE_COLOR[f.confidence]} />
                      </div>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-data text-xs text-foreground-muted">
                        {f.source_url ? (
                          <a
                            href={f.source_url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1 text-pearl underline decoration-cobalt decoration-2 underline-offset-4 hover:decoration-magenta"
                          >
                            {hostOf(f.source_url)}
                            <ExternalLink className="size-3" aria-hidden />
                          </a>
                        ) : (
                          <span className="text-danger">brak źródła</span>
                        )}
                        {f.verified_at && <span>zweryfikowano {formatDate(f.verified_at)}</span>}
                        <span>
                          {nameOf(f.created_by)}, {formatDateTime(f.created_at)}
                        </span>
                        {!locked &&
                          (hiding?.id === f.id ? (
                            <span className="flex w-full items-center gap-2 pt-1">
                              <Input
                                className="h-8"
                                placeholder="Powód ukrycia (wymagany)"
                                value={hiding.reason}
                                onChange={(e) => setHiding({ id: f.id, reason: e.target.value })}
                                autoFocus
                              />
                              <Button size="sm" variant="danger" disabled={hiding.reason.trim().length < 3 || busy === 'hide'} onClick={hideFact}>
                                Ukryj
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setHiding(null)}>
                                Anuluj
                              </Button>
                            </span>
                          ) : (
                            <button type="button" className="hover:text-pearl" onClick={() => setHiding({ id: f.id, reason: '' })}>
                              ukryj
                            </button>
                          ))}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {hiddenFacts.length > 0 && (
                <div>
                  <button type="button" className="font-data text-xs text-foreground-muted hover:text-pearl" onClick={() => setShowHidden((s) => !s)}>
                    {showHidden ? 'Zwiń ukryte' : `Pokaż ukryte (${hiddenFacts.length})`}
                  </button>
                  {showHidden && (
                    <ul className="mt-2 space-y-2">
                      {hiddenFacts.map((f) => (
                        <li key={f.id} className="text-sm text-foreground-muted line-through decoration-fog/50">
                          {f.fact}
                          <span className="ml-2 font-data text-xs no-underline">
                            (ukrył: {nameOf(f.hidden_by)} — {f.hidden_reason})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!locked && (
                <form onSubmit={addFact} className="space-y-3 border-t border-border pt-4" noValidate>
                  <div>
                    <Label htmlFor="fact">Nowy fakt</Label>
                    <Textarea id="fact" rows={2} value={fact.fact} onChange={(e) => setFact((s) => ({ ...s, fact: e.target.value }))} />
                    {factErrors.fact && <p className="mt-1 text-xs text-danger">{factErrors.fact}</p>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem_12rem]">
                    <div>
                      <Label htmlFor="source">Link do źródła</Label>
                      <Input
                        id="source"
                        placeholder="https://…"
                        value={fact.source_url}
                        onChange={(e) => {
                          const url = e.target.value;
                          setFact((s) => ({
                            ...s,
                            source_url: url,
                            // Z linkiem domyślnie "średnia"; bez linku zawsze "brak potwierdzenia".
                            confidence: url ? (s.confidence === 'brak_potwierdzenia' ? 'srednia' : s.confidence) : 'brak_potwierdzenia',
                          }));
                        }}
                      />
                      {factErrors.source_url && <p className="mt-1 text-xs text-danger">{factErrors.source_url}</p>}
                    </div>
                    <div>
                      <Label htmlFor="verified">Zweryfikowano</Label>
                      <Input id="verified" type="date" value={fact.verified_at} onChange={(e) => setFact((s) => ({ ...s, verified_at: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="confidence">Pewność</Label>
                      <Select
                        id="confidence"
                        value={fact.confidence}
                        onChange={(e) => setFact((s) => ({ ...s, confidence: e.target.value as LeadFact['confidence'] }))}
                      >
                        {Object.entries(factConfidenceLabels).map(([v, l]) => (
                          <option key={v} value={v} disabled={!fact.source_url && v !== 'brak_potwierdzenia'}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  {factErrors.confidence && <p className="text-xs text-danger">{factErrors.confidence}</p>}
                  <Button type="submit" size="sm" variant="secondary" disabled={busy === 'fact'}>
                    {busy === 'fact' ? 'Dodawanie…' : 'Dodaj fakt'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Historia */}
          <Card>
            <CardHeader>
              <CardTitle>Historia zmian</CardTitle>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <p className="text-sm text-foreground-muted">
                  Utworzony {formatDateTime(lead.created_at)} przez {nameOf(lead.created_by)}. Bez zmian od tego czasu.
                </p>
              ) : (
                <ul className="space-y-2">
                  {auditLog.map((a) => (
                    <li key={a.id} className="text-sm">
                      <span className="font-data text-xs text-foreground-muted">{formatDateTime(a.changed_at)}</span>{' '}
                      <span className="text-foreground">
                        {nameOf(a.changed_by)} — {FIELD_LABELS[a.field_name] ?? a.field_name}:{' '}
                        {displayValue(a.field_name, a.old_value, nameOf, icpProfiles)} → {displayValue(a.field_name, a.new_value, nameOf, icpProfiles)}
                      </span>
                    </li>
                  ))}
                  <li className="text-sm text-foreground-muted">
                    <span className="font-data text-xs">{formatDateTime(lead.created_at)}</span> {nameOf(lead.created_by)} — utworzył lead
                  </li>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Konwersja */}
          <Card>
            <CardHeader>
              <CardTitle>Zapytanie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.converted_inquiry_id ? (
                <Link
                  href={`/zapytania/${lead.converted_inquiry_id}`}
                  className="inline-flex items-center gap-2 text-sm text-pearl underline decoration-cobalt decoration-2 underline-offset-4 hover:decoration-magenta"
                >
                  Utworzono zapytanie {convertedInquiryNumber ?? ''}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : lead.is_archived ? (
                <p className="text-sm text-foreground-muted">Lead jest zarchiwizowany.</p>
              ) : lead.contact_consent === 'zakaz' || lead.status === 'zakaz_kontaktu' ? (
                <p className="text-sm text-danger">Zakaz kontaktu — z tego leada nie można utworzyć zapytania.</p>
              ) : confirmConvert ? (
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    Utworzę zapytanie {lead.company_id ? 'dla istniejącej firmy' : `i nową firmę „${lead.company_name || lead.domain}”`}. Lead
                    dostanie status „Zakwalifikowany”. Kontynuować?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={convert} disabled={busy === 'convert'}>
                      {busy === 'convert' ? 'Tworzenie…' : 'Tak, utwórz zapytanie'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmConvert(false)}>
                      Anuluj
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground-muted">Gdy lead jest gotowy, przenieś go do zapytań. Zawsze ręcznie — nigdy automatycznie.</p>
                  <Button size="sm" onClick={() => setConfirmConvert(true)}>
                    Utwórz zapytanie z leada
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dane */}
          <Card>
            <CardHeader>
              <CardTitle>Dane leada</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await update(
                    {
                      company_name: data.company_name.trim() || null,
                      country: data.country.trim() || null,
                      icp_profile_id: data.icp_profile_id || null,
                      owner_id: data.owner_id || null,
                      contact_consent: data.contact_consent,
                      need: data.need.trim() || null,
                      proposed_service: data.proposed_service.trim() || null,
                    },
                    'data'
                  );
                }}
              >
                <fieldset disabled={locked} className="space-y-3">
                  <div>
                    <Label htmlFor="d-name">Nazwa firmy</Label>
                    <Input id="d-name" value={data.company_name} onChange={(e) => setData((s) => ({ ...s, company_name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="d-country">Kraj</Label>
                      <Input id="d-country" value={data.country} onChange={(e) => setData((s) => ({ ...s, country: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="d-consent">Zgoda na kontakt</Label>
                      <Select
                        id="d-consent"
                        value={data.contact_consent}
                        onChange={(e) => setData((s) => ({ ...s, contact_consent: e.target.value as ContactConsent }))}
                      >
                        {Object.entries(contactConsentLabels).map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="d-icp">Profil ICP</Label>
                    <Select id="d-icp" value={data.icp_profile_id} onChange={(e) => setData((s) => ({ ...s, icp_profile_id: e.target.value }))}>
                      <option value="">— nie wybrano —</option>
                      {icpProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="d-owner">Właściciel</Label>
                    <Select id="d-owner" value={data.owner_id} onChange={(e) => setData((s) => ({ ...s, owner_id: e.target.value }))}>
                      <option value="">— brak —</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="d-need">Potrzeba</Label>
                    <Textarea id="d-need" rows={2} value={data.need} onChange={(e) => setData((s) => ({ ...s, need: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="d-service">Proponowana usługa</Label>
                    <Input id="d-service" value={data.proposed_service} onChange={(e) => setData((s) => ({ ...s, proposed_service: e.target.value }))} />
                  </div>
                  {!locked && (
                    <Button type="submit" size="sm" variant="secondary" disabled={busy === 'data'}>
                      {busy === 'data' ? 'Zapisywanie…' : 'Zapisz dane'}
                    </Button>
                  )}
                </fieldset>
              </form>
            </CardContent>
          </Card>

          {/* Archiwum */}
          {!lead.is_archived && !lead.converted_inquiry_id && (
            <Card>
              <CardHeader>
                <CardTitle>Archiwizuj</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {archiving ? (
                  <>
                    <Input placeholder="Powód (wymagany)" value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} autoFocus />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={archiveReason.trim().length < 3 || busy === 'archive'}
                        onClick={() =>
                          update({ is_archived: true, archived_reason: archiveReason.trim(), archived_at: new Date().toISOString() }, 'archive')
                        }
                      >
                        Archiwizuj
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setArchiving(false)}>
                        Anuluj
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-foreground-muted">Lead nie znika — trafia do archiwum z powodem i historią.</p>
                    <Button size="sm" variant="secondary" onClick={() => setArchiving(true)}>
                      Archiwizuj lead
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function displayValue(
  field: string,
  value: string | null,
  nameOf: (id: string | null) => string,
  icp: Pick<IcpProfile, 'id' | 'name'>[]
): string {
  if (value === null || value === '') return '—';
  if (field === 'status') return leadStatusLabels[value as LeadStatus] ?? value;
  if (field === 'owner_id') return nameOf(value);
  if (field === 'icp_profile_id') return icp.find((p) => p.id === value)?.name ?? value;
  if (field === 'contact_consent') return contactConsentLabels[value as ContactConsent] ?? value;
  if (field === 'is_archived') return value === 'true' ? 'tak' : 'nie';
  return value;
}
