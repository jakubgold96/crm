import { PageTitle } from '@/components/ui/page-title';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth';

/**
 * Eksport ogólny danych biznesowych (docs/MIGRATIONS_BACKUP.md, sekcja
 * "RODO / eksport danych"). Dostępny dla każdego aktywnego użytkownika —
 * RLS na companies/contacts/inquiries ogranicza wynik do tego, co user i tak
 * widzi w aplikacji, więc eksport nie ujawnia niczego ponad UI.
 *
 * Eksport pojedynczego kontaktu/firmy (RODO, na żądanie osoby) jest osobno,
 * jako przycisk na karcie tego konkretnego rekordu — nie tutaj.
 *
 * Backup pełnej bazy (sekcja poniżej) jest inny: zawiera profiles i
 * audit_log/activity_log, więc widoczny tylko dla administratora — endpoint
 * /api/backup/snapshot i tak to wymusza, tu tylko nie pokazujemy przycisku,
 * którego kliknięcie skończyłoby się 403.
 */
export default async function ExportPage() {
  const { profile } = await requireUser();
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <PageTitle>Eksport danych</PageTitle>
        <p className="mt-1 text-sm text-foreground-muted">
          Pobierz dane biznesowe w formacie CSV (do Excela/Arkuszy) lub JSON. Eksport zawiera tylko
          rekordy, do których masz dostęp w aplikacji.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSV — osobne pliki</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <a href="/api/export/csv/companies" download>
              <Button size="sm" variant="secondary">
                Pobierz companies.csv
              </Button>
            </a>
            <a href="/api/export/csv/contacts" download>
              <Button size="sm" variant="secondary">
                Pobierz contacts.csv
              </Button>
            </a>
            <a href="/api/export/csv/inquiries" download>
              <Button size="sm" variant="secondary">
                Pobierz inquiries.csv
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>JSON — wszystko w jednym pliku</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-foreground-muted">
            Jeden plik z firmami, kontaktami i zapytaniami razem — przydatny do archiwizacji lub
            importu do innego systemu.
          </p>
          <a href="/api/export/json" download>
            <Button size="sm">Pobierz eksport JSON</Button>
          </a>
        </CardContent>
      </Card>

      {profile.role === 'administrator' ? (
        <Card>
          <CardHeader>
            <CardTitle>Kopia zapasowa bazy (administrator)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground-muted">
              Pełny zrzut wszystkich tabel biznesowych (w tym użytkowników i historii zmian — dlatego
              widoczny tylko dla administratora). Po pobraniu można zweryfikować kompletność:
              przywrócić do pustej lokalnej bazy i porównać liczbę wierszy.
            </p>
            <a href="/api/backup/snapshot" download>
              <Button size="sm">Pobierz backup</Button>
            </a>
            <p className="text-xs text-foreground-muted">
              Weryfikacja: <code className="rounded bg-background px-1 py-0.5">scripts/verify-backup.sh ścieżka/do/backupu.json</code> —
              odtwarza strukturę w lokalnej bazie testowej i porównuje liczbę wierszy po restore z
              zapisaną w backupie.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>Kopia zapasowa bazy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">
              Pełny backup (z historią zmian i użytkownikami) jest dostępny tylko dla administratora.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
