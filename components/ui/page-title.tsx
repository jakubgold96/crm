import { cn } from '@/lib/utils';

/**
 * Tytuł ekranu w świecie HUD: Chakra Petch, stały podział kanałów RGB
 * i okresowy glitch (wyłączany przy prefers-reduced-motion). `count` dopisuje
 * licznik w nawiasie kwadratowym czcionką danych.
 */
export function PageTitle({ children, count, className }: { children: string; count?: number; className?: string }) {
  return (
    <h1
      className={cn(
        'flex items-baseline gap-3 font-display text-2xl font-bold uppercase tracking-[0.06em] text-foreground sm:text-3xl',
        className
      )}
    >
      <span data-text={children} className="glitch rgb-split">
        {children}
      </span>
      {count !== undefined && <span className="font-data text-sm font-normal text-fog tabular">[{count}]</span>}
    </h1>
  );
}
