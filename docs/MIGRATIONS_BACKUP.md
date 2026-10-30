# Plan migracji i backupu

## Migracje

- Wszystkie zmiany schematu przez pliki SQL w `supabase/migrations/`, numerowane chronologicznie (`supabase migration new <nazwa>`), nigdy ręczne zmiany w panelu Supabase na środowisku produkcyjnym.
- Każda migracja Fazy 1: tworzy enumy → tabele → indeksy → RLS policies → trigger numeracji zapytań → (opcjonalnie) seed startowy (role, 1 przykładowy użytkownik demo w środowisku dev, nie w prod).
- Migracje w jedną stronę (forward-only) w produkcji; cofanie przez nową migrację naprawczą, nie `down`-migrację na żywej bazie z danymi.
- Środowiska: `local` (Supabase CLI + Docker), `staging` (osobny projekt Supabase), `production`. Migracja najpierw na `local`, potem `staging` z przeglądem, dopiero potem `production`.

## Backup

- Supabase Pro ma automatyczne daily backups + point-in-time recovery — do potwierdzenia plan subskrypcji (patrz Decyzje).
- Dodatkowo: cotygodniowy `pg_dump` wywoływany przez scheduled job, zapisywany do osobnego storage (np. innego projektu Supabase Storage lub zewnętrznego bucketu) — niezależny od samego Supabase na wypadek problemu z kontem.
- Kryterium akceptacji #19 z briefu: "backup można pobrać i zweryfikować" → w Fazie 2 dodajemy przycisk/endpoint admina: "Pobierz ostatni backup" + prosty skrypt weryfikujący (restore do pustej bazy lokalnej + policzenie wierszy w kluczowych tabelach).
- Pliki (Supabase Storage) objęte są backupem Supabase; dodatkowo lista plików w `inquiry_files` pozwala zweryfikować kompletność po restore.

## RODO / eksport danych

- Eksport działa dla całości (admin) i dla rekordów powiązanych z konkretną firmą/kontaktem (np. na żądanie usunięcia danych osobowych) — format CSV/JSON, budowane w Fazie 2 ("Eksport i kopie zapasowe" to osobny moduł w nawigacji).
- Twarde usunięcie danych osobowych kontaktu (na żądanie RODO) to jedyny wyjątek od zasady "nic nie usuwamy fizycznie" — wymaga potwierdzenia administratora i zostawia wpis w `audit_log` o samym fakcie usunięcia (bez treści usuniętych danych).
