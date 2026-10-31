/**
 * Kolor neonu grupy na listach — wg pilności, nie dekoracji:
 * wymaga działania = magenta/czerwień (alarm), do przypomnienia = bursztyn (żółty jest
 * zarezerwowany dla akcji),
 * czekamy na klienta = kobalt; w widoku sprzedaży: wygrane = perła,
 * przegrane = czerwień, pozostałe etapy = kobalt.
 */
export function groupNeon(key: string): string {
  switch (key) {
    case 'wymaga_dzialania':
    case 'przegrane':
      return 'var(--danger)';
    case 'do_przypomnienia':
      return 'var(--terracotta)';
    case 'czekamy_na_klienta':
      return 'var(--cobalt)';
    case 'wygrane':
      return 'var(--sage)';
    default:
      return 'var(--kpi-1)';
  }
}

/**
 * Kolor statusu leada — ta sama logika co grupy zapytań:
 * czeka na człowieka (do zatwierdzenia/zbadany) = bursztyn, w kontakcie = kobalt,
 * sukces = perła, odrzucony/zakaz = magenta, początek/wstrzymany = mgła.
 */
export function leadStatusNeon(status: string): string {
  switch (status) {
    case 'zbadany':
    case 'do_zatwierdzenia':
      return 'var(--terracotta)';
    case 'gotowy_do_kontaktu':
    case 'kontakt_wyslany':
    case 'odpowiedzial':
      return 'var(--cobalt)';
    case 'zakwalifikowany':
    case 'rozmowa_umowiona':
      return 'var(--sage)';
    case 'nie_pasuje':
    case 'zakaz_kontaktu':
      return 'var(--danger)';
    default:
      return 'var(--fog)';
  }
}
