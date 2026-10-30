# Stack — propozycja i uzasadnienie

| Warstwa | Wybór | Uzasadnienie |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR dla szybkiego ładowania na telefonie w terenie, server components ograniczają JS po stronie klienta, dobra integracja z Supabase. |
| UI | Tailwind CSS + shadcn/ui (Radix prymitywy) | Spójny system komponentów bez narzutu utrzymania własnego design systemu; łatwo dostosować do palety granat/kobalt/terakota/szałwia. |
| Baza danych | PostgreSQL przez Supabase | RLS natywnie w bazie (nie w aplikacji) = bezpieczeństwo niezależne od warstwy frontendu; dobre dla małego zespołu bez własnego DBA. |
| Auth | Supabase Auth (e-mail+hasło i magic link) | Indywidualne konta bez budowania własnego systemu haseł; sesje JWT współpracują z RLS (`auth.uid()`). |
| RLS | Obowiązkowe na wszystkich tabelach z danymi firmowymi | Zgodnie z zasadą produktu — agent i frontend nie mogą ominąć kontroli dostępu. |
| Storage plików | Supabase Storage (bucket prywatny + signed URLs) | Pliki zapytań/ofert niepubliczne domyślnie. |
| Backend agenta | Next.js Route Handlers (server-side) + Supabase Edge Functions dla zadań długotrwałych/schedulowanych | Klucze serwisowe i wywołania LLM nigdy w przeglądarce. |
| Harmonogram (raporty, follow-upy) | Supabase Cron (pg_cron) → wywołuje Edge Function / webhook | Brak dodatkowej infrastruktury kolejkowej na starcie; wystarcza dla 2–3-osobowego zespołu. |
| Poczta (Faza 4) | OAuth 2.0 Gmail API i/lub Microsoft Graph | Zero haseł w bazie; tokeny odświeżane server-side, szyfrowane w spoczynku. |
| Hosting | Vercel (frontend + API routes) + Supabase (backend-as-a-service) | Jeden deploy dla front+API, Supabase osobno zarządza bazą/auth/storage. |
| Testy | Vitest (logika/unit), Playwright (e2e + smoke RLS) | Szybkie sprzężenie zwrotne + realna weryfikacja izolacji danych między użytkownikami. |

## Co NIE jest w stacku na starcie
- Żadnego własnego mikroserwisu kolejkowego (Redis/RabbitMQ) — pg_cron + Edge Functions wystarczą przy tej skali.
- Żadnego ORM z ciężką warstwą abstrakcji (Prisma rozważony, ale zaczynamy na Supabase JS client + wygenerowanych typach z `supabase gen types`, żeby nie dublować schematu w dwóch miejscach).
- Żaden framework agentowy (LangChain itp.) — wywołania LLM jako proste, kontrolowane funkcje server-side z jawnym listowaniem narzędzi, żeby dało się audytować `agent_runs` 1:1 z kodem.
