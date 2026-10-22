import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

const emptyStateVariants = cva(
  'flex w-full flex-col items-center px-6 text-center font-sans text-text',
  {
    variants: {
      size: {
        sm: 'py-6',
        md: 'py-10',
        lg: 'py-16',
      },
      bordered: {
        true: 'rounded-xl border border-dashed border-border',
        false: '',
      },
    },
    defaultVariants: { size: 'md', bordered: false },
  },
);

export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface EmptyStateProps
  extends Omit<ComponentProps<'div'>, 'title'>, VariantProps<typeof emptyStateVariants> {
  /** Berilsa — 48px doira ichida (`lg` da 64px) */
  icon?: ReactNode;
  /** Sarlavha (majburiy) */
  title: ReactNode;
  /** Qisqa izoh — nima uchun bo'sh va nima qilish mumkin */
  description?: ReactNode;
  /** Asosiy harakat (odatda `Button variant="primary"`) */
  action?: ReactNode;
  /** Ikkilamchi harakat (odatda `Button variant="ghost"`) */
  secondaryAction?: ReactNode;
  /** Sarlavha tegi: `h2`–`h6` */
  headingLevel?: EmptyStateHeadingLevel;
}

/**
 * Bo'sh ro'yxat, natijasiz qidiruv yoki birinchi kirish holati.
 * Tugmalar yonma-yon; tor ekranda (< 640px) ustma-ust va to'liq kenglikda.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size,
  bordered,
  headingLevel = 3,
  className,
  ...props
}: EmptyStateProps) {
  const s = size ?? 'md';
  const Heading = `h${headingLevel}` as const;
  const hasActions = action != null || secondaryAction != null;

  return (
    <div
      data-size={s}
      data-bordered={bordered ? '' : undefined}
      className={cn(emptyStateVariants({ size: s, bordered }), className)}
      {...props}
    >
      {icon != null && (
        <div
          aria-hidden="true"
          data-empty-state-icon=""
          className={cn(
            'mb-2 flex shrink-0 items-center justify-center rounded-full bg-surface-muted text-text-muted',
            s === 'lg' ? 'size-16 [&_svg]:size-8' : 'size-12 [&_svg]:size-6',
          )}
        >
          {icon}
        </div>
      )}
      <Heading className={cn('m-0 font-semibold text-text', s === 'lg' ? 'text-lg' : 'text-base')}>
        {title}
      </Heading>
      {description != null && (
        <p className="m-0 mt-2 max-w-[40ch] text-sm text-text-muted">{description}</p>
      )}
      {hasActions && (
        <div className="mt-5 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export { emptyStateVariants };
