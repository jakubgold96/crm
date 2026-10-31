import { z } from 'zod';

/**
 * Walidacja leadów i faktów (Faza 3a). Te same reguły pilnuje baza
 * (migracja 9) — tu są po to, żeby użytkownik dostał czytelny komunikat
 * przed wysłaniem, a nie błąd constraintu.
 */

export const leadStatuses = [
  'nowy',
  'do_researchu',
  'zbadany',
  'do_zatwierdzenia',
  'gotowy_do_kontaktu',
  'kontakt_wyslany',
  'odpowiedzial',
  'zakwalifikowany',
  'rozmowa_umowiona',
  'nie_teraz',
  'nie_pasuje',
  'zakaz_kontaktu',
] as const;

export const factConfidences = ['wysoka', 'srednia', 'niska', 'brak_potwierdzenia'] as const;

/**
 * "https://www.Studio-Przyklad.pl/kontakt?x=1" -> "studio-przyklad.pl".
 * Zwraca '' gdy z wejścia nie da się wyciągnąć domeny.
 */
export function normalizeDomain(input: string): string {
  let s = input.trim().toLowerCase();
  if (!s) return '';
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
  s = s.replace(/^[^@/]*@/, ''); // e-mail albo user@host -> część po @
  s = s.split(/[/?#:]/)[0];
  s = s.replace(/^www\./, '').replace(/\.$/, '');
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(s) ? s : '';
}

const optionalText = z.string().trim().optional().or(z.literal(''));

export const leadSchema = z
  .object({
    domain: optionalText,
    company_name: optionalText,
    country: optionalText,
    icp_profile_id: z.string().uuid().optional().nullable().or(z.literal('')),
    owner_id: z.string().uuid().optional().nullable().or(z.literal('')),
    need: optionalText,
    proposed_service: optionalText,
  })
  .superRefine((v, ctx) => {
    const hasDomain = Boolean(v.domain && v.domain.length > 0);
    const hasName = Boolean(v.company_name && v.company_name.length > 0);
    if (!hasDomain && !hasName) {
      ctx.addIssue({ code: 'custom', path: ['domain'], message: 'Podaj domenę albo nazwę firmy' });
    }
    if (hasDomain && !normalizeDomain(v.domain!)) {
      ctx.addIssue({ code: 'custom', path: ['domain'], message: 'To nie wygląda na domenę (np. studio-przyklad.pl)' });
    }
  });

export type LeadFormValues = z.infer<typeof leadSchema>;

export const scoreSchema = z.object({
  score: z.coerce.number({ message: 'Wynik 0–100' }).int('Wynik musi być liczbą całkowitą').min(0, 'Wynik 0–100').max(100, 'Wynik 0–100'),
  score_rationale: z.string().trim().min(10, 'Uzasadnienie jest wymagane (min. 10 znaków) — wynik bez uzasadnienia nie jest zapisywany'),
});

export const factSchema = z
  .object({
    fact: z.string().trim().min(3, 'Opisz fakt'),
    source_url: optionalText,
    verified_at: optionalText,
    confidence: z.enum(factConfidences),
  })
  .superRefine((v, ctx) => {
    const url = v.source_url ?? '';
    if (url && !/^https?:\/\/\S+\.\S+/i.test(url)) {
      ctx.addIssue({ code: 'custom', path: ['source_url'], message: 'Źródło musi być linkiem http(s)://' });
    }
    if (!url && v.confidence !== 'brak_potwierdzenia') {
      ctx.addIssue({
        code: 'custom',
        path: ['confidence'],
        message: 'Bez linku do źródła fakt może mieć tylko poziom „Brak potwierdzenia”',
      });
    }
  });

export type FactFormValues = z.infer<typeof factSchema>;

/** Profil ICP: tylko nazwa jest wymagana — resztę właściciel uzupełnia, gdy ją zna (nic nie zgadujemy). */
export const icpSchema = z.object({
  name: z.string().trim().min(2, 'Nazwa profilu jest wymagana'),
});

/** Pole "jedna pozycja w linii" -> tablica bez pustych i duplikatów. */
export function linesToArray(text: string): string[] {
  return [...new Set(text.split('\n').map((s) => s.trim()).filter(Boolean))];
}
