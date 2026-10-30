-- INNDES CRM — Faza 1 — migracja 6: Storage dla plików zapytań
-- Bucket prywatny — pliki dostępne wyłącznie przez signed URL generowany
-- server-side, nigdy publiczny link.

insert into storage.buckets (id, name, public)
values ('inquiry-files', 'inquiry-files', false)
on conflict (id) do nothing;

-- Każdy plik w buckecie jest w folderze <inquiry_id>/<filename>, więc
-- polityka storage sprawdza po prostu czy użytkownik jest aktywny — kontrola
-- "czy to zapytanie w ogóle istnieje i do niego należy" i tak dzieje się
-- przez inquiry_files (RLS tamtej tabeli), a nie przez samą ścieżkę w Storage.
create policy "inquiry_files_storage_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'inquiry-files' and public.is_active_user());

create policy "inquiry_files_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'inquiry-files' and public.is_active_user());

-- Brak polityki DELETE na storage.objects dla roli authenticated — pliki nie
-- są usuwane przez użytkowników z poziomu aplikacji w Fazie 1.
