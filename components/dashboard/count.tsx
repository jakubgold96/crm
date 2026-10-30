/** Liczba nabijana animacją CSS (.count w globals.css); czytniki ekranu dostają wartość wprost. */
export function Count({ value, className }: { value: number; className?: string }) {
  return (
    <span className={className}>
      <span aria-hidden className="count tabular" style={{ ['--to' as string]: value }} />
      <span className="sr-only">{value}</span>
    </span>
  );
}
