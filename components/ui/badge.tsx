import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium tabular',
  {
    variants: {
      tone: {
        neutral: 'border border-border bg-surface-raised text-foreground-muted',
        accent: 'bg-accent/15 text-accent',
        warning: 'bg-warning-bg text-warning-fg',
        terracotta: 'bg-terracotta-bg text-terracotta',
        sage: 'bg-sage-bg text-sage',
        danger: 'bg-danger-bg text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
