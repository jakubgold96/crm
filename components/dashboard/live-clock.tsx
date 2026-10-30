'use client';

import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', second: '2-digit' });

/** Zegar w pasku statusu pulpitu (czas Warszawy). Pierwszy render = czas z serwera, bez skoku. */
export function LiveClock({ initial }: { initial: string }) {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);
  return <time className="tabular">{now}</time>;
}
