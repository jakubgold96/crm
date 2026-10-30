import { describe, expect, it } from 'vitest';
import { companySchema } from '@/lib/validation/company';

describe('companySchema', () => {
  it('wymaga nazwy firmy', () => {
    const result = companySchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('akceptuje samą nazwę (reszta pól opcjonalna)', () => {
    const result = companySchema.safeParse({ name: 'Test Sp. z o.o.' });
    expect(result.success).toBe(true);
  });

  it('odrzuca nieprawidłowy e-mail', () => {
    const result = companySchema.safeParse({ name: 'Test', email: 'nie-email' });
    expect(result.success).toBe(false);
  });

  it('akceptuje pusty e-mail (pole opcjonalne)', () => {
    const result = companySchema.safeParse({ name: 'Test', email: '' });
    expect(result.success).toBe(true);
  });

  it('domyślny relationship_status to "nowy"', () => {
    const result = companySchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.relationship_status).toBe('nowy');
    }
  });

  it('odrzuca nieznaną wartość segmentu', () => {
    const result = companySchema.safeParse({ name: 'Test', segment: 'nieznany_segment' });
    expect(result.success).toBe(false);
  });
});
