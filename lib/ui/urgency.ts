/**
 * Kolor neonu grupy na listach — wg pilności, nie dekoracji:
 * wymaga działania = magenta/czerwień (alarm), do przypomnienia = żółty,
 * czekamy na klienta = cyjan; w widoku sprzedaży: wygrane = zieleń,
 * przegrane = czerwień, pozostałe etapy = indygo.
 */
export function groupNeon(key: string): string {
  switch (key) {
    case 'wymaga_dzialania':
    case 'przegrane':
      return 'var(--danger)';
    case 'do_przypomnienia':
      return 'var(--accent)';
    case 'czekamy_na_klienta':
      return 'var(--neon-cyan)';
    case 'wygrane':
      return 'var(--sage)';
    default:
      return 'var(--kpi-1)';
  }
}
