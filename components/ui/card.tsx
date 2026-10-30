import { cn } from '@/lib/utils';

/** Panel HUD: ścięty prawy górny róg, cienka krawędź, lekka poświata cyjanu od góry. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'hud bg-surface/90 backdrop-blur-[2px] [background-image:linear-gradient(180deg,rgb(61_90_254/0.05),transparent_120px)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-border px-5 py-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('font-display text-[15px] font-semibold uppercase tracking-[0.06em] text-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}
