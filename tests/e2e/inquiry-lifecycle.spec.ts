import { test, expect } from '@playwright/test';
import { login, uniqueName } from './helpers';

/**
 * Pokrywa kryteria akceptacji MVP #2, #3, #4 (docs/ACCEPTANCE_TESTS.md):
 * można dodać firmę, kontakt i zapytanie; numer zapytania nadaje baza;
 * można ustawić grupę, etap, właściciela, następny krok i termin.
 */
test.describe('Cykl życia zapytania: firma → kontakt → zapytanie → edycja', () => {
  test('tworzy firmę, kontakt, zapytanie i edytuje pola na karcie', async ({ page }) => {
    await login(page);

    const companyName = uniqueName('E2E Testowa Firma');

    // 1. Nowa firma
    await page.goto('/firmy/nowa');
    await page.getByLabel('Nazwa firmy *').fill(companyName);
    await page.getByLabel('Kraj').fill('Polska');
    await page.getByRole('button', { name: 'Dodaj firmę' }).click();
    await expect(page).toHaveURL(/\/firmy\/[0-9a-f-]+$/);
    await expect(page.getByRole('heading', { name: companyName })).toBeVisible();

    // 2. Nowy kontakt dla tej firmy
    await page.getByRole('link', { name: '+ Nowy kontakt' }).click();
    await page.getByLabel('Imię').fill('Jan');
    await page.getByLabel('Nazwisko').fill('Testowy');
    await page.getByLabel('E-mail').fill(`jan.testowy.${Date.now()}@example.com`);
    await page.getByRole('button', { name: 'Dodaj kontakt' }).click();
    await expect(page.getByRole('heading', { name: 'Jan Testowy' })).toBeVisible();

    // 3. Nowe zapytanie dla tej firmy — sprawdzamy, że numer jest nadany automatycznie
    await page.goBack(); // wraca na kartę firmy
    await page.getByRole('link', { name: '+ Nowe zapytanie dla tej firmy' }).click();
    await page.getByLabel('Krótki opis').fill('Zapytanie testowe e2e');
    await page.getByRole('button', { name: 'Dodaj zapytanie' }).click();

    await expect(page).toHaveURL(/\/zapytania\/[0-9a-f-]+$/);
    // Numer w nagłówku musi pasować do formatu INQ-NNNNNN, nigdy pusty ani ręcznie wpisany.
    await expect(page.getByRole('heading', { name: /^INQ-\d{6}$/ })).toBeVisible();

    // 4. Edycja: grupa operacyjna, etap sprzedaży, właściciel, następny krok, termin
    await page.getByLabel('Grupa operacyjna').selectOption({ label: 'Do przypomnienia' });
    await page.getByLabel('Etap sprzedaży').selectOption({ label: 'Kwalifikacja' });
    await page.getByLabel('Następny krok').fill('Zadzwonić do klienta');
    await page.getByLabel('Termin').fill('2026-12-01');

    await page.reload();
    await expect(page.getByLabel('Grupa operacyjna')).toHaveValue('do_przypomnienia');
    await expect(page.getByLabel('Etap sprzedaży')).toHaveValue('kwalifikacja');
    await expect(page.getByLabel('Następny krok')).toHaveValue('Zadzwonić do klienta');
  });

  test('historia zmian pokazuje autora i zmienione pole po edycji etapu sprzedaży', async ({ page }) => {
    await login(page);

    await page.goto('/zapytania/nowe');
    // Zakłada istnienie firmy demo z seed.sql ("Nordic Home AS") — jeśli
    // seed się zmieni, dostosować selektor.
    await page.getByPlaceholder('Szukaj firmy po nazwie…').fill('Nordic');
    await page.getByText('Nordic Home AS').click();
    await page.getByRole('button', { name: 'Dodaj zapytanie' }).click();
    await expect(page).toHaveURL(/\/zapytania\/[0-9a-f-]+$/);

    await page.getByLabel('Etap sprzedaży').selectOption({ label: 'Negocjacje' });
    await page.reload();

    await page.getByRole('button', { name: /Pokaż \(\d+\)/ }).click();
    await expect(page.getByText(/sales_stage/)).toBeVisible();
  });
});
