import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full border-0 border-b border-border-strong bg-surface-raised/80 shadow-[inset_0_0_0_1px_var(--border)] px-3.5 text-sm text-foreground placeholder:text-foreground-muted/80 transition-colors hover:border-cyan/50 focus:border-accent focus:bg-surface-raised focus:shadow-[inset_0_0_0_1px_rgb(245_228_0/0.35),0_6px_20px_-12px_rgb(245_228_0/0.8)] focus:outline-none disabled:opacity-50 aria-[invalid=true]:border-danger',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full border-0 border-b border-border-strong bg-surface-raised/80 shadow-[inset_0_0_0_1px_var(--border)] px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/80 transition-colors hover:border-cyan/50 focus:border-accent focus:bg-surface-raised focus:shadow-[inset_0_0_0_1px_rgb(245_228_0/0.35),0_6px_20px_-12px_rgb(245_228_0/0.8)] focus:outline-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block font-data text-[11px] font-medium uppercase tracking-[0.08em] text-foreground-muted', className)} {...props} />
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full border-0 border-b border-border-strong bg-surface-raised/80 shadow-[inset_0_0_0_1px_var(--border)] px-3.5 text-sm text-foreground transition-colors hover:border-cyan/50 focus:border-accent focus:bg-surface-raised focus:shadow-[inset_0_0_0_1px_rgb(245_228_0/0.35),0_6px_20px_-12px_rgb(245_228_0/0.8)] focus:outline-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
