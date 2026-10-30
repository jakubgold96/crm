-- INNDES CRM — Faza 1 — migracja 5: triggery audytowe
--
-- Każda zmiana pola na companies/contacts/inquiries trafia do audit_log
-- jako osobny wiersz (jedno pole = jeden wpis), żeby historia była czytelna
-- ("kto zmienił Właściciela z X na Y, kiedy"), nie jednym blobem JSON.
-- changed_by = auth.uid() z sesji wykonującej UPDATE (prawdziwy zalogowany
-- użytkownik, nigdy wolny tekst — CLAUDE.md zasada #6).

create function public.audit_companies()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.name is distinct from new.name then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'name', old.name, new.name, auth.uid());
  end if;
  if old.segment is distinct from new.segment then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'segment', old.segment::text, new.segment::text, auth.uid());
  end if;
  if old.relationship_status is distinct from new.relationship_status then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'relationship_status', old.relationship_status::text, new.relationship_status::text, auth.uid());
  end if;
  if old.is_archived is distinct from new.is_archived then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'is_archived', old.is_archived::text, new.is_archived::text, auth.uid());
  end if;
  if old.country is distinct from new.country then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'country', old.country, new.country, auth.uid());
  end if;
  if old.email is distinct from new.email then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'email', old.email, new.email, auth.uid());
  end if;
  if old.phone is distinct from new.phone then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('companies', new.id, 'phone', old.phone, new.phone, auth.uid());
  end if;
  return new;
end;
$$;

create trigger companies_audit
  after update on public.companies
  for each row execute function public.audit_companies();

create function public.audit_contacts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.first_name is distinct from new.first_name or old.last_name is distinct from new.last_name then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('contacts', new.id, 'name', concat(old.first_name, ' ', old.last_name), concat(new.first_name, ' ', new.last_name), auth.uid());
  end if;
  if old.role is distinct from new.role then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('contacts', new.id, 'role', old.role::text, new.role::text, auth.uid());
  end if;
  if old.contact_consent is distinct from new.contact_consent then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('contacts', new.id, 'contact_consent', old.contact_consent::text, new.contact_consent::text, auth.uid());
  end if;
  if old.email is distinct from new.email then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('contacts', new.id, 'email', old.email, new.email, auth.uid());
  end if;
  if old.company_id is distinct from new.company_id then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('contacts', new.id, 'company_id', old.company_id::text, new.company_id::text, auth.uid());
  end if;
  return new;
end;
$$;

create trigger contacts_audit
  after update on public.contacts
  for each row execute function public.audit_contacts();

create function public.audit_inquiries()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.operational_group is distinct from new.operational_group then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'operational_group', old.operational_group::text, new.operational_group::text, auth.uid());
  end if;
  if old.sales_stage is distinct from new.sales_stage then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'sales_stage', old.sales_stage::text, new.sales_stage::text, auth.uid());
  end if;
  if old.owner_id is distinct from new.owner_id then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'owner_id', old.owner_id::text, new.owner_id::text, auth.uid());
  end if;
  if old.next_step is distinct from new.next_step then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'next_step', old.next_step, new.next_step, auth.uid());
  end if;
  if old.next_step_due is distinct from new.next_step_due then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'next_step_due', old.next_step_due::text, new.next_step_due::text, auth.uid());
  end if;
  if old.short_description is distinct from new.short_description then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'short_description', old.short_description, new.short_description, auth.uid());
  end if;
  if old.is_archived is distinct from new.is_archived then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'is_archived', old.is_archived::text, new.is_archived::text, auth.uid());
    if new.is_archived = true then
      insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
      values ('inquiries', new.id, 'archived_reason', null, new.archived_reason, auth.uid());
    end if;
  end if;
  if old.task_status is distinct from new.task_status then
    insert into audit_log (table_name, record_id, field_name, old_value, new_value, changed_by)
    values ('inquiries', new.id, 'task_status', old.task_status::text, new.task_status::text, auth.uid());
  end if;

  -- Każda istotna zmiana zasila też zdenormalizowany activity_log (sekcja
  -- "Aktywność" na karcie zapytania), żeby nie trzeba było łączyć dwóch
  -- tabel w UI dla prostego, chronologicznego widoku.
  if old.operational_group is distinct from new.operational_group
     or old.sales_stage is distinct from new.sales_stage
     or old.owner_id is distinct from new.owner_id
     or old.next_step is distinct from new.next_step
     or old.next_step_due is distinct from new.next_step_due
     or old.is_archived is distinct from new.is_archived then
    insert into activity_log (inquiry_id, type, summary, created_by)
    values (new.id, 'change', 'Zaktualizowano pola zapytania', auth.uid());
  end if;

  return new;
end;
$$;

create trigger inquiries_audit
  after update on public.inquiries
  for each row execute function public.audit_inquiries();

-- Notatka dodana do zapytania też trafia do activity_log (jedno źródło
-- prawdy dla chronologii, notatka sama w sobie zostaje też w inquiry_notes
-- dla pełnej treści / ukrywania).
create function public.log_note_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into activity_log (inquiry_id, type, summary, created_by)
  values (new.inquiry_id, 'note', left(new.body, 140), new.created_by);
  return new;
end;
$$;

create trigger inquiry_notes_log_activity
  after insert on public.inquiry_notes
  for each row execute function public.log_note_activity();
