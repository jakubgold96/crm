import { test, expect } from '@playwright/test';
import { login } from './helpers';

/**
 * Pokrywa decyzję właściciela produktu (STATUS.md, 2026-10-30): zakres
 * usługi nie blokuje utworzenia zapytania, ale jest wymagany przy
 * przejściu do etapu "Przygotowanie oferty" i dalszych.
 */
test.describe('Walidacja zakresu usługi względem etapu sprzedaży', () => {
  test('nowe zapytanie zapisuje się bez wybranego zakresu usługi', async ({ page }) => {
    await login(page);

    await page.goto('/zapytania/nowe');
    await page.getByPlaceholder('Szukaj firmy po nazwie…').fill('Studio Architektura');
    await page.getByText('Studio Architektura').first().click();
    await page.getByLabel('Krótki opis').fill('Zakres nieustalony — test e2e');
    // "Nieustalone" jest domyślnie zaznaczone — nic nie zmieniamy.
    await page.getByRole('button', { name: 'Dodaj zapytanie' }).click();

    await expect(page).toHaveURL(/\/zapytania\/[0-9a-f-]+$/);
  });

  test('przejście do etapu "Przygotowanie oferty" z nieustalonym zakresem jest blokowane', async ({ page }) => {
    await login(page);

    await page.goto('/zapytania/nowe');
    await page.getByPlaceholder('Szukaj firmy po nazwie…').fill('Studio Architektura');
    await page.getByText('Studio Architektura').first().click();
    await page.getByLabel('Krótki opis').fill('Blokada etapu — test e2e');
    await page.getByRole('button', { name: 'Dodaj zapytanie' }).click();
    await expect(page).toHaveURL(/\/zapytania\/[0-9a-f-]+$/);

    await page.getByLabel('Etap sprzedaży').selectOption({ label: 'Przygotowanie oferty' });

    await expect(page.getByText(/zakres usługi musi być ustalony/)).toBeVisible();
    // Etap NIE powinien się zmienić w UI po odrzuceniu.
    await page.reload();
    await expect(page.getByLabel('Etap sprzedaży')).not.toHaveValue('przygotowanie_oferty');
  });

  test('przejście do "Przygotowanie oferty" działa po ustaleniu zakresu', async ({ page }) => {
    await login(page);

    await page.goto('/zapytania/nowe');
    await page.getByPlaceholder('Szukaj firmy po nazwie…').fill('Studio Architektura');
    await page.getByText('Studio Architektura').first().click();
    await page.getByLabel('Krótki opis').fill('Zakres ustalony — test e2e');
    await page.getByRole('button', { name: 'Dodaj zapytanie' }).click();
    await expect(page).toHaveURL(/\/zapytania\/[0-9a-f-]+$/);

    // Odznacz "Nieustalone" i wybierz jedną usługę.
    await page.getByLabel('Nieustalone').uncheck();
    await page.getByLabel('Projektowanie mebli').check();

    await page.getByLabel('Etap sprzedaży').selectOption({ label: 'Przygotowanie oferty' });
    await page.reload();
    await expect(page.getByLabel('Etap sprzedaży')).toHaveValue('przygotowanie_oferty');
  });
});
