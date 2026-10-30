import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const buttonVariants = cva(
  'notch hover-glitch inline-flex items-center justify-center gap-2 font-display text-[13px] font-semibold uppercase tracking-[0.08em] transition-[background-color,color,box-shadow,filter] duration-150 ease-out active:brightness-90 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-accent-foreground hover:bg-accent-hover',
        secondary:
          'bg-surface-raised text-foreground shadow-[inset_0_0_0_1px_var(--border-strong)] hover:bg-surface-hover hover:text-pearl hover:shadow-[inset_0_0_0_1px_rgb(61_90_254/0.6)]',
        ghost: 'text-foreground-muted hover:bg-surface-raised hover:text-foreground',
        danger: 'bg-danger text-danger-foreground',
      },
      size: {
        sm: 'h-8 px-3.5',
        md: 'h-10 px-4',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
