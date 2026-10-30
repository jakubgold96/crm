import { describe, expect, it } from 'vitest';
import { inquirySchema, scopeRequiredForStage, validateScopeForStage } from '@/lib/validation/inquiry';

describe('inquirySchema', () => {
  const base = {
    company_id: '11111111-1111-4111-8111-111111111111',
    inquiry_date: '2026-10-30',
  };

  it('akceptuje minimalne poprawne dane (tylko firma i data)', () => {
    const result = inquirySchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('odrzuca brak company_id', () => {
    const result = inquirySchema.safeParse({ ...base, company_id: undefined });
    expect(result.success).toBe(false);
  });

  it('odrzuca nieprawidłowy UUID jako company_id', () => {
    const result = inquirySchema.safeParse({ ...base, company_id: 'nie-uuid' });
    expect(result.success).toBe(false);
  });

  it('wymaga object_type_other, gdy object_type = "inne"', () => {
    const result = inquirySchema.safeParse({ ...base, object_type: 'inne', object_type_other: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('object_type_other');
    }
  });

  it('akceptuje object_type = "inne" z wypełnionym doprecyzowaniem', () => {
    const result = inquirySchema.safeParse({
      ...base,
      object_type: 'inne',
      object_type_other: 'Przestrzeń coworkingowa',
    });
    expect(result.success).toBe(true);
  });

  it('nie wymaga object_type_other dla innych wartości object_type', () => {
    const result = inquirySchema.safeParse({ ...base, object_type: 'hotel' });
    expect(result.success).toBe(true);
  });

  it('domyślnie scope_undetermined = true, gdy nie podano', () => {
    const result = inquirySchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scope_undetermined).toBe(true);
    }
  });

  it('domyślnie operational_group = wymaga_dzialania', () => {
    const result = inquirySchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.operational_group).toBe('wymaga_dzialania');
    }
  });

  it('domyślnie sales_stage = nowe', () => {
    const result = inquirySchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sales_stage).toBe('nowe');
    }
  });
});

describe('scopeRequiredForStage — decyzja właściciela: zakres wymagany dopiero przy przygotowaniu oferty i dalej', () => {
  it('nie wymaga zakresu dla "nowe"', () => {
    expect(scopeRequiredForStage('nowe')).toBe(false);
  });
  it('nie wymaga zakresu dla "kwalifikacja"', () => {
    expect(scopeRequiredForStage('kwalifikacja')).toBe(false);
  });
  it('nie wymaga zakresu dla "kompletowanie_danych"', () => {
    expect(scopeRequiredForStage('kompletowanie_danych')).toBe(false);
  });
  it('wymaga zakresu dla "przygotowanie_oferty"', () => {
    expect(scopeRequiredForStage('przygotowanie_oferty')).toBe(true);
  });
  it('wymaga zakresu dla "oferta_wyslana"', () => {
    expect(scopeRequiredForStage('oferta_wyslana')).toBe(true);
  });
  it('wymaga zakresu dla "negocjacje"', () => {
    expect(scopeRequiredForStage('negocjacje')).toBe(true);
  });
  it('wymaga zakresu dla "wygrane"', () => {
    expect(scopeRequiredForStage('wygrane')).toBe(true);
  });
  it('nie wymaga zakresu dla "przegrane" (sprawa zamknięta, nie trzeba doprecyzowywać)', () => {
    expect(scopeRequiredForStage('przegrane')).toBe(false);
  });
});

describe('validateScopeForStage', () => {
  it('nie zgłasza błędu dla wczesnego etapu nawet gdy zakres nieustalony', () => {
    const error = validateScopeForStage({
      sales_stage: 'kwalifikacja',
      scope_undetermined: true,
      service_option_ids: [],
    });
    expect(error).toBeNull();
  });

  it('zgłasza błąd dla "przygotowanie_oferty", gdy scope_undetermined = true', () => {
    const error = validateScopeForStage({
      sales_stage: 'przygotowanie_oferty',
      scope_undetermined: true,
      service_option_ids: [],
    });
    expect(error).not.toBeNull();
  });

  it('zgłasza błąd dla "przygotowanie_oferty", gdy scope_undetermined = false ale brak wybranych usług', () => {
    const error = validateScopeForStage({
      sales_stage: 'przygotowanie_oferty',
      scope_undetermined: false,
      service_option_ids: [],
    });
    expect(error).not.toBeNull();
  });

  it('nie zgłasza błędu dla "przygotowanie_oferty", gdy zakres ustalony z co najmniej jedną usługą', () => {
    const error = validateScopeForStage({
      sales_stage: 'przygotowanie_oferty',
      scope_undetermined: false,
      service_option_ids: ['11111111-1111-4111-8111-111111111111'],
    });
    expect(error).toBeNull();
  });
});
