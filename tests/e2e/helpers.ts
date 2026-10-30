import type { Page } from '@playwright/test';

const EMAIL = process.env.E2E_USER_EMAIL ?? 'sprzedaz.test@inndes.local';
const PASSWORD = process.env.E2E_USER_PASSWORD ?? 'change-me';

export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(EMAIL);
  await page.getByLabel('Hasło').fill(PASSWORD);
  // exact: true — strona ma drugi przycisk "Zaloguj się linkiem e-mail
  // (bez hasła)", który bez exact też dopasowuje się do nazwy "Zaloguj się".
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await page.waitForURL('/');
}

/** Generuje unikalną nazwę testową, żeby kolejne przebiegi testów się nie zderzały. */
export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}
