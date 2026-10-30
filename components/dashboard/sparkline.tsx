/**
 * Linia trendu rysowana z danych (bez biblioteki wykresów): proste odcinki
 * między tygodniami — dane to liczby całkowite, więc wygładzanie udawałoby
 * ruch, którego nie było. Skala Y od 0, żeby seria zer leżała na dole.
 *
 * SVG rozciąga się do szerokości tafli (preserveAspectRatio="none"), więc
 * kropka końcowa jest osobnym elementem HTML — w SVG zrobiłaby się elipsą.
 */
export function Sparkline({
  values,
  color,
  label,
  className,
}: {
  values: number[];
  color: string;
  label: string;
  className?: string;
}) {
  const width = 100;
  const height = 40;
  const padY = 4;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values.map((v, i) => [i * step, height - padY - (v / max) * (height - padY * 2)] as const);
  const last = points[points.length - 1];

  return (
    <div className={className}>
      <div className="relative h-full w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={label}
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <polyline
            points={points.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span
          aria-hidden
          className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${(last[0] / width) * 100}%`, top: `${(last[1] / height) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
