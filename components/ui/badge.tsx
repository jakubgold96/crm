import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 font-data text-[11px] font-medium uppercase tracking-[0.04em] tabular',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-raised text-foreground-muted shadow-[inset_0_0_0_1px_var(--border-strong)]',
        accent: 'bg-cobalt/20 text-pearl shadow-[inset_0_0_0_1px_rgb(61_90_254/0.7)]',
        warning: 'bg-warning-bg text-warning-fg shadow-[inset_0_0_0_1px_rgb(255_138_30/0.35)]',
        terracotta: 'bg-terracotta-bg text-terracotta shadow-[inset_0_0_0_1px_rgb(255_138_30/0.4)]',
        sage: 'bg-sage-bg text-sage shadow-[inset_0_0_0_1px_rgb(245_247_255/0.35)]',
        danger: 'bg-danger-bg text-danger shadow-[inset_0_0_0_1px_rgb(255_47_163/0.5),0_0_12px_-4px_rgb(255_47_163/0.7)]',
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
