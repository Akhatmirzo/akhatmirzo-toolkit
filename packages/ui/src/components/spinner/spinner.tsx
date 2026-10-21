import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

export const spinnerVariants = cva(
  'block shrink-0 animate-spinner rounded-full border-2 border-current border-r-transparent motion-reduce:[animation-duration:1.5s]',
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface SpinnerProps
  extends Omit<ComponentProps<'span'>, 'children'>, VariantProps<typeof spinnerVariants> {
  /** Ekran o'quvchi uchun matn */
  label?: string;
}

export function Spinner({ size, label = 'Yuklanmoqda', className, ...props }: SpinnerProps) {
  const s = size ?? 'md';
  return (
    <span
      role="status"
      data-size={s}
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <span aria-hidden="true" className={spinnerVariants({ size: s })} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
