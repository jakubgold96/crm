import { defineConfig, devices } from '@playwright/test';

/**
 * Konfiguracja Playwright dla testów e2e Fazy 1.
 *
 * WYMAGANIA do uruchomienia (patrz tests/e2e/README.md):
 * - Działający lokalny Supabase (`supabase start`, wymaga Dockera).
 * - Aplikacja uruchomiona przeciwko tej instancji (`npm run dev`).
 * - Konta testowe założone zgodnie z tests/e2e/README.md.
 *
 * Ta konfiguracja NIE uruchamia automatycznie `supabase start` — webServer
 * uruchamia tylko `next dev`, zakładając że Supabase już działa pod adresem
 * z .env.local. Bez tego testy i tak nie przejdą (logowanie się nie uda).
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Faza 1: mała liczba testów, współdzielą dane demo — bezpieczniej sekwencyjnie.
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/login',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
