#!/usr/bin/env bash
# Weryfikacja backupu (kryterium akceptacji #19: "backup można pobrać
# i zweryfikować"): bierze plik JSON z GET /api/backup/snapshot, odtwarza
# strukturę (stub auth/storage + migracje, jak w tests/sql/README.md),
# wczytuje dane z backupu do każdej tabeli przez jsonb_populate_recordset,
# i porównuje liczbę wierszy po restore z `row_counts` zapisanym w backupie.
#
# Użycie:
#   scripts/verify-backup.sh ścieżka/do/backupu.json
#
# Wymaga lokalnego Postgresa (bez Dockera — ten sam stub co tests/sql/,
# patrz tests/sql/README.md "Bez Dockera"). Jeśli createdb/psql/dropdb
# wymagają uprawnień roli `postgres` (peer authentication) na Twoim
# systemie, uruchom cały skrypt jako: sudo -u postgres scripts/verify-backup.sh ...
# (zweryfikowane realnie w tym repo z `sudo -u postgres` — patrz STATUS.md).
set -euo pipefail

BACKUP_FILE="${1:-}"
if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo "Użycie: scripts/verify-backup.sh ścieżka/do/backupu.json" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_NAME="inndes_backup_verify_$$"

cleanup() {
  dropdb --if-exists "$DB_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1/4 Tworzę pustą bazę testową ($DB_NAME) =="
createdb "$DB_NAME"

echo "== 2/4 Odtwarzam strukturę (stub auth/storage + migracje) =="
psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f "$REPO_ROOT/tests/sql/stub/auth_storage_stub.sql"
for f in "$REPO_ROOT"/supabase/migrations/*.sql; do
  psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f "$f"
done

echo "== 3/4 Wczytuję dane z backupu do każdej tabeli =="
# profiles.id ma FK do auth.users(id), a auth.users nie jest tabelą
# biznesową — nie jest częścią backupu (patrz BACKUP_TABLES w
# app/api/backup/snapshot/route.ts). Przy restore do pustej bazy trzeba
# więc najpierw wstawić do auth.users same id profili z backupu (bez
# e-maili prawdziwych userów — to tylko po to, żeby FK się zgodziło),
# inaczej insert do profiles odpada z "violates foreign key constraint".
PROFILE_IDS_JSON=$(node -e "
  const fs = require('fs');
  const backup = JSON.parse(fs.readFileSync('$BACKUP_FILE', 'utf8'));
  const ids = (backup.tables?.profiles ?? []).map((p) => p.id);
  process.stdout.write(JSON.stringify(ids));
")
echo "$PROFILE_IDS_JSON" | psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -c "
  insert into auth.users (id, email)
  select value::uuid, 'restored-' || value::text || '@verify.local'
  from jsonb_array_elements_text(\$\$$(cat)\$\$::jsonb);
" >/dev/null

# Kolejność respektuje foreign keys: profiles → companies → contacts →
# service_scope_options → inquiries → (inquiry_services, inquiry_files,
# inquiry_notes, activity_log, audit_log). Ta sama lista jak BACKUP_TABLES
# w app/api/backup/snapshot/route.ts.
TABLES=(profiles companies contacts service_scope_options inquiries inquiry_services inquiry_files inquiry_notes activity_log audit_log)

for table in "${TABLES[@]}"; do
  ROWS_JSON=$(node -e "
    const fs = require('fs');
    const backup = JSON.parse(fs.readFileSync('$BACKUP_FILE', 'utf8'));
    const rows = backup.tables?.['$table'] ?? [];
    process.stdout.write(JSON.stringify(rows));
  ")
  # profiles: trigger on_auth_user_created już wstawił wiersz-zaślepkę przy
  # insercie do auth.users powyżej — tu nadpisujemy go prawdziwymi danymi
  # z backupu (ON CONFLICT DO UPDATE), inaczej byłby duplicate key.
  if [[ "$table" == "profiles" ]]; then
    CONFLICT_CLAUSE="on conflict (id) do update set full_name = excluded.full_name, role = excluded.role, can_view_financials = excluded.can_view_financials, is_active = excluded.is_active"
  else
    CONFLICT_CLAUSE="on conflict do nothing"
  fi
  echo "$ROWS_JSON" | psql -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -c "
    insert into public.$table
    select * from jsonb_populate_recordset(null::public.$table, \$\$$(cat)\$\$::jsonb)
    $CONFLICT_CLAUSE;
  " >/dev/null
done

echo "== 4/4 Porównuję liczbę wierszy: backup vs. baza po restore =="
FAILED=0
for table in "${TABLES[@]}"; do
  EXPECTED=$(node -e "
    const fs = require('fs');
    const backup = JSON.parse(fs.readFileSync('$BACKUP_FILE', 'utf8'));
    process.stdout.write(String(backup.row_counts?.['$table'] ?? 0));
  ")
  ACTUAL=$(psql -d "$DB_NAME" -t -A -c "select count(*) from public.$table;")

  if [[ "$EXPECTED" == "$ACTUAL" ]]; then
    echo "  OK    $table: $ACTUAL wierszy (zgodne z backupem)"
  else
    echo "  FAIL  $table: backup=$EXPECTED, po restore=$ACTUAL"
    FAILED=1
  fi
done

if [[ "$FAILED" -eq 1 ]]; then
  echo ""
  echo "FAIL: weryfikacja backupu nie powiodła się — liczby wierszy się nie zgadzają."
  exit 1
fi

echo ""
echo "=== WERYFIKACJA BACKUPU PRZESZŁA: restore kompletny, wszystkie tabele zgodne ==="
