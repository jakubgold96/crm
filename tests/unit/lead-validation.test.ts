import { describe, expect, it } from 'vitest';
import { factSchema, leadSchema, normalizeDomain, scoreSchema } from '@/lib/validation/lead';

describe('normalizeDomain', () => {
  it('wyciąga czystą domenę z adresu, linku i e-maila', () => {
    expect(normalizeDomain('https://www.Studio-Przyklad.pl/kontakt?x=1')).toBe('studio-przyklad.pl');
    expect(normalizeDomain('studio-przyklad.pl')).toBe('studio-przyklad.pl');
    expect(normalizeDomain('biuro@hotel-baltyk.pl')).toBe('hotel-baltyk.pl');
    expect(normalizeDomain('http://sub.firma.co.uk:8080/')).toBe('sub.firma.co.uk');
  });
  it('odrzuca śmieci', () => {
    expect(normalizeDomain('')).toBe('');
    expect(normalizeDomain('nie domena')).toBe('');
    expect(normalizeDomain('localhost')).toBe('');
  });
});

describe('leadSchema (#8: lead z samej domeny)', () => {
  it('przyjmuje samą domenę', () => {
    expect(leadSchema.safeParse({ domain: 'studio-przyklad.pl' }).success).toBe(true);
  });
  it('przyjmuje samą nazwę firmy', () => {
    expect(leadSchema.safeParse({ company_name: 'Studio Przykład' }).success).toBe(true);
  });
  it('odrzuca brak domeny i nazwy', () => {
    const r = leadSchema.safeParse({ country: 'Polska' });
    expect(r.success).toBe(false);
  });
  it('odrzuca niepoprawną domenę', () => {
    expect(leadSchema.safeParse({ domain: 'nie domena' }).success).toBe(false);
  });
});

describe('scoreSchema (#10: wynik z uzasadnieniem)', () => {
  it('wymaga uzasadnienia', () => {
    expect(scoreSchema.safeParse({ score: 70, score_rationale: '' }).success).toBe(false);
    expect(scoreSchema.safeParse({ score: 70, score_rationale: '   krótko ' }).success).toBe(false);
    expect(scoreSchema.safeParse({ score: 70, score_rationale: 'Hotele butikowe w PL, 3 obiekty' }).success).toBe(true);
  });
  it('wynik w zakresie 0–100', () => {
    expect(scoreSchema.safeParse({ score: 101, score_rationale: 'uzasadnienie testowe' }).success).toBe(false);
    expect(scoreSchema.safeParse({ score: '55', score_rationale: 'uzasadnienie testowe' }).success).toBe(true);
  });
});

describe('factSchema (#9: brak źródła = brak potwierdzenia)', () => {
  it('fakt bez źródła tylko jako „brak potwierdzenia”', () => {
    expect(factSchema.safeParse({ fact: 'Ma 3 hotele', confidence: 'wysoka' }).success).toBe(false);
    expect(factSchema.safeParse({ fact: 'Ma 3 hotele', confidence: 'brak_potwierdzenia' }).success).toBe(true);
  });
  it('źródło musi być linkiem http(s)', () => {
    expect(factSchema.safeParse({ fact: 'Ma 3 hotele', source_url: 'firma.pl', confidence: 'wysoka' }).success).toBe(false);
    expect(
      factSchema.safeParse({ fact: 'Ma 3 hotele', source_url: 'https://firma.pl/o-nas', confidence: 'wysoka' }).success
    ).toBe(true);
  });
});

import { icpSchema, linesToArray } from '@/lib/validation/lead';

describe('profile ICP', () => {
  it('wymaga tylko nazwy', () => {
    expect(icpSchema.safeParse({ name: 'Hotel / restauracja' }).success).toBe(true);
    expect(icpSchema.safeParse({ name: ' ' }).success).toBe(false);
  });
  it('linesToArray tnie po liniach, usuwa puste i duplikaty', () => {
    expect(linesToArray('Polska\n\n Niemcy \nPolska\n')).toEqual(['Polska', 'Niemcy']);
  });
});
