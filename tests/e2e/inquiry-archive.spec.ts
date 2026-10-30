import { test, expect } from '@playwright/test';
import { login } from './helpers';

/** Pokrywa kryterium akceptacji #5: zapytania nie są usuwane, tylko archiwizowane. */
test.describe('Archiwizacja zapytania', () => {
  test('zarchiwizowane zapytanie znika z głównej listy, ale pozostaje dostępne pod swoim URL', async ({ page }) => {
    await login(page);

    await page.goto('/zapytania/nowe');
    await page.getByPlaceholder('Szukaj firmy po nazwie…').fill('Hotel Baltyk');
    await page.getByText('Hotel Baltyk').first().click();
    await page.getByLabel('Krótki opis').fill('Do archiwizacji — test e2e');
    await page.getByRole('button', { name: 'Dodaj zapytanie' }).click();

    const url = page.url();
    const numberHeading = page.getByRole('heading', { name: /^INQ-\d{6}$/ });
    const number = await numberHeading.textContent();

    await page.getByRole('button', { name: 'Archiwizuj' }).click();
    await page.getByLabel('Powód archiwizacji *').fill('Test e2e — klient zrezygnował');
    await page.getByRole('button', { name: 'Potwierdź archiwizację' }).click();

    await expect(page.getByText('Zarchiwizowane')).toBeVisible();

    // Zniknęło z głównej listy (lista domyślnie filtruje is_archived = false).
    await page.goto('/zapytania');
    await expect(page.getByText(number!)).not.toBeVisible();

    // Ale rekord nadal istnieje pod swoim URL — to jest dowód, że to
    // archiwizacja, nie fizyczne usunięcie.
    await page.goto(url);
    await expect(page.getByRole('heading', { name: number! })).toBeVisible();
  });
});
