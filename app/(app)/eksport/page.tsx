import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Eksport ogólny danych biznesowych (docs/MIGRATIONS_BACKUP.md, sekcja
 * "RODO / eksport danych"). Dostępny dla każdego aktywnego użytkownika —
 * RLS na companies/contacts/inquiries ogranicza wynik do tego, co user i tak
 * widzi w aplikacji, więc eksport nie ujawnia niczego ponad UI.
 *
 * Eksport pojedynczego kontaktu/firmy (RODO, na żądanie osoby) jest osobno,
 * jako przycisk na karcie tego konkretnego rekordu — nie tutaj.
 */
export default function ExportPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Eksport danych</h1>
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

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Kopia zapasowa bazy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">
            Pobieranie i weryfikacja pełnego backupu — w przygotowaniu (kryterium akceptacji #19).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
