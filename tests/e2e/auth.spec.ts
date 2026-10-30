import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_USER_EMAIL ?? 'sprzedaz.test@inndes.local';
const PASSWORD = process.env.E2E_USER_PASSWORD ?? 'change-me';

test.describe('Logowanie i ochrona tras', () => {
  test('niezalogowany użytkownik jest przekierowany z /zapytania na /login', async ({ page }) => {
    await page.goto('/zapytania');
    await expect(page).toHaveURL(/\/login/);
  });

  test('logowanie hasłem z poprawnymi danymi prowadzi na pulpit', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(EMAIL);
    await page.getByLabel('Hasło').fill(PASSWORD);
    // exact: true — odróżnia submit od przycisku "Zaloguj się linkiem e-mail (bez hasła)".
    await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Pulpit' })).toBeVisible();
  });

  test('logowanie z błędnym hasłem pokazuje komunikat i nie przechodzi dalej', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(EMAIL);
    await page.getByLabel('Hasło').fill('zdecydowanie-zle-haslo');
    await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();

    await expect(page.getByText('Nieprawidłowy e-mail lub hasło.')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('wylogowanie z sidebara wraca na /login i blokuje powrót do /zapytania', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(EMAIL);
    await page.getByLabel('Hasło').fill(PASSWORD);
    await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Wyloguj się' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/zapytania');
    await expect(page).toHaveURL(/\/login/);
  });
});
