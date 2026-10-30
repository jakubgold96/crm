#!/usr/bin/env bash
# Test współbieżności numeracji zapytań: N równoległych pomyślnych insertów
# + M równoległych insertów z jawnym ROLLBACK (przerwana transakcja),
# wszystkie wystrzelone w tym samym momencie.
#
# Dowodzi (patrz docs/DATA_MODEL.md, decyzja właściciela produktu
# "unikaj luk wynikających z równoczesnego zapisu"):
#   - każdy POMYŚLNY insert dostaje unikalny, poprawnie sformatowany numer,
#     zero duplikatów, nawet przy pełnej współbieżności;
#   - PRZERWANA transakcja (ROLLBACK po nadaniu numeru) nie psuje numeracji
#     dla pozostałych, równolegle działających transakcji — może tylko
#     "skonsumować" numer, który nigdy nie trafi do żadnego wiersza (luka),
#     co jest świadomie zaakceptowanym zachowaniem sekwencji Postgres, nie
#     błędem.
#
# Użycie: ./run.sh <nazwa_bazy>
# Wymaga: zaaplikowanych migracji + fixtures.sql (user '11111111-...' i
# firma '44444444-...' z tests/sql/fixtures.sql).

set -euo pipefail
DB="${1:-inndes_test}"
N_OK=50
N_ROLLBACK=10
USER_ID="11111111-1111-1111-1111-111111111111"
COMPANY_ID="44444444-4444-4444-4444-444444444444"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Stan przed testem ==="
BEFORE_COUNT=$(sudo -u postgres psql -d "$DB" -tA -c "select count(*) from public.inquiries;")
echo "Liczba zapytań przed testem: $BEFORE_COUNT"

echo "=== Odpalanie $N_OK pomyślnych insertów + $N_ROLLBACK przerwanych transakcji równolegle ==="
pids=()
for i in $(seq 1 "$N_OK"); do
  sudo -u postgres psql -d "$DB" -v ON_ERROR_STOP=1 -v user_id="$USER_ID" -v company_id="$COMPANY_ID" \
    -f "$HERE/insert_one.sql" > "/tmp/concurrency_ok_${i}.log" 2>&1 &
  pids+=($!)
done
for i in $(seq 1 "$N_ROLLBACK"); do
  sudo -u postgres psql -d "$DB" -v user_id="$USER_ID" -v company_id="$COMPANY_ID" \
    -f "$HERE/insert_one_rollback.sql" > "/tmp/concurrency_rollback_${i}.log" 2>&1 &
  pids+=($!)
done

fail=0
for pid in "${pids[@]}"; do
  wait "$pid" || fail=1
done

echo "=== Weryfikacja ==="
AFTER_COUNT=$(sudo -u postgres psql -d "$DB" -tA -c "select count(*) from public.inquiries;")
NEW_ROWS=$((AFTER_COUNT - BEFORE_COUNT))
echo "Liczba zapytań po teście: $AFTER_COUNT (nowych: $NEW_ROWS, oczekiwano: $N_OK)"

if [ "$NEW_ROWS" -ne "$N_OK" ]; then
  echo "FAIL: liczba nowych wierszy ($NEW_ROWS) != liczba pomyślnych insertów ($N_OK) — przerwane transakcje wpłynęły na insert innych procesów."
  exit 1
fi

DUPLICATES=$(sudo -u postgres psql -d "$DB" -tA -c \
  "select count(*) from (select number, count(*) c from public.inquiries group by number having count(*) > 1) d;")
if [ "$DUPLICATES" -ne 0 ]; then
  echo "FAIL: znaleziono $DUPLICATES zduplikowanych numerów."
  exit 1
fi
echo "OK: zero zduplikowanych numerów po $N_OK równoległych insertach."

BAD_FORMAT=$(sudo -u postgres psql -d "$DB" -tA -c \
  "select count(*) from public.inquiries where number !~ '^INQ-\d{6}$';")
if [ "$BAD_FORMAT" -ne 0 ]; then
  echo "FAIL: $BAD_FORMAT numerów nie pasuje do formatu INQ-NNNNNN."
  exit 1
fi
echo "OK: wszystkie numery pasują do formatu INQ-NNNNNN."

if [ "$fail" -ne 0 ]; then
  echo "FAIL: co najmniej jeden z procesów 'pomyślnego insertu' zwrócił niezerowy kod wyjścia — sprawdź /tmp/concurrency_ok_*.log."
  exit 1
fi

echo "=== Sprawdzenie, że ROLLBACK faktycznie nie zapisał żadnego ze swoich wierszy ==="
ROLLBACK_ROWS=$(sudo -u postgres psql -d "$DB" -tA -c \
  "select count(*) from public.inquiries where short_description = 'Test przerwanej transakcji';")
if [ "$ROLLBACK_ROWS" -ne 0 ]; then
  echo "FAIL: znaleziono $ROLLBACK_ROWS wierszy z przerwanych transakcji — ROLLBACK nie zadziałał."
  exit 1
fi
echo "OK: żadna z $N_ROLLBACK przerwanych transakcji nie zostawiła wiersza (ROLLBACK działa poprawnie)."

echo "=== WSZYSTKIE TESTY WSPÓŁBIEŻNOŚCI (w tym przerwane transakcje) PRZESZŁY ==="
