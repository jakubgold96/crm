import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-surface-raised px-3.5 text-sm text-foreground placeholder:text-foreground-muted/80 transition-colors hover:border-border-strong focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 aria-[invalid=true]:border-danger',
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
        'w-full rounded-xl border border-border bg-surface-raised px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted/80 transition-colors hover:border-border-strong focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-[13px] font-medium text-foreground-muted', className)} {...props} />
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-surface-raised px-3.5 text-sm text-foreground transition-colors hover:border-border-strong focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
