import { test, expect, devices } from '@playwright/test';
import { login } from './helpers';

/** Pokrywa kryterium akceptacji #7: widok mobilny jako karty, nie pomniejszona tabela. */
test.describe('Widok mobilny', () => {
  test.use({ ...devices['Pixel 7'] });

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
