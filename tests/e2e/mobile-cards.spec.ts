import { test, expect } from '@playwright/test';
import { login } from './helpers';

/**
 * Pokrywa kryterium akceptacji #7: widok mobilny jako karty, nie pomniejszona
 * tabela. Viewport mobilny (Pixel 7) jest ustawiony w playwright.config.ts
 * dla projektu `mobile-chromium` — ten plik jest uruchamiany WYŁĄCZNIE w tym
 * projekcie (testMatch), nie w `chromium` (testIgnore), więc nie potrzeba
 * (i nie można — nowsze Playwright to blokuje w test.describe) nadpisywać
 * urządzenia tutaj przez test.use().
 */
test.describe('Widok mobilny', () => {
  test('lista zapytań na viewport mobilnym renderuje karty, nie tabelę', async ({ page }) => {
    await login(page);
    await page.goto('/zapytania');

    // Tabela desktopowa jest ukryta (klasa hidden md:block) na mobile.
    await expect(page.locator('table')).toBeHidden();
    // Karty mobilne są widoczne.
    const firstCard = page.locator('a.rounded-lg.border.border-border').first();
    await expect(firstCard).toBeVisible();
  });

  test('dolna nawigacja mobilna jest widoczna i prowadzi do głównych sekcji', async ({ page }) => {
    await login(page);
    await expect(page.getByRole('link', { name: 'Zapytania' }).last()).toBeVisible();
    await page.getByRole('link', { name: 'Firmy' }).last().click();
    await expect(page).toHaveURL('/firmy');
  });
});
