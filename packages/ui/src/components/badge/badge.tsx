import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, MouseEvent } from 'react';
import { cn } from '../../lib/cn';

export type BadgeColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

const badgeVariants = cva(
  'inline-flex max-w-full items-center gap-1.5 rounded-full border font-sans text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        soft: 'border-transparent',
        solid: 'border-transparent',
        outline: 'border-border bg-surface',
      },
      color: {
        neutral: '',
        primary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
      },
      size: {
        sm: 'px-2',
        md: 'px-2.5 py-px',
      },
    },
    compoundVariants: [
      { variant: 'soft', color: 'neutral', className: 'bg-surface-muted text-text' },
      {
        variant: 'soft',
        color: 'primary',
        className: 'bg-primary-soft text-primary-soft-foreground',
      },
      {
        variant: 'soft',
        color: 'success',
        className: 'bg-success-soft text-success-soft-foreground',
      },
      {
        variant: 'soft',
        color: 'warning',
        className: 'bg-warning-soft text-warning-soft-foreground',
      },
      { variant: 'soft', color: 'danger', className: 'bg-danger-soft text-danger-soft-foreground' },
      { variant: 'soft', color: 'info', className: 'bg-info-soft text-info-soft-foreground' },

      { variant: 'solid', color: 'neutral', className: 'bg-text text-surface' },
      { variant: 'solid', color: 'primary', className: 'bg-primary text-primary-foreground' },
      { variant: 'solid', color: 'success', className: 'bg-success text-success-foreground' },
      { variant: 'solid', color: 'warning', className: 'bg-warning text-warning-foreground' },
      { variant: 'solid', color: 'danger', className: 'bg-danger text-danger-foreground' },
      { variant: 'solid', color: 'info', className: 'bg-info text-info-foreground' },

      { variant: 'outline', color: 'neutral', className: 'text-text' },
      { variant: 'outline', color: 'primary', className: 'text-primary-soft-foreground' },
      { variant: 'outline', color: 'success', className: 'text-success-soft-foreground' },
      { variant: 'outline', color: 'warning', className: 'text-warning-soft-foreground' },
      { variant: 'outline', color: 'danger', className: 'text-danger-soft-foreground' },
      { variant: 'outline', color: 'info', className: 'text-info-soft-foreground' },
    ],
    defaultVariants: { variant: 'soft', color: 'neutral', size: 'md' },
  },
);

const dotColors: Record<BadgeColor, string> = {
  neutral: 'bg-text-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

export interface BadgeLabels {
  /** ✕ tugmasining aria-label'i */
  remove?: string;
}

export interface BadgeProps
  extends Omit<ComponentProps<'span'>, 'color'>, VariantProps<typeof badgeVariants> {
  /** Chap tomonda rangli nuqta */
  dot?: boolean;
  /** Berilsa — ✕ tugmasi chiqadi (filtr teglari uchun) */
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  labels?: BadgeLabels;
}

export function Badge({
  variant,
  color,
  size,
  dot = false,
  onRemove,
  labels,
  className,
  children,
  ...props
}: BadgeProps) {
  const v = variant ?? 'soft';
  const c = color ?? 'neutral';
  const s = size ?? 'md';

  return (
    <span
      data-variant={v}
      data-color={c}
      data-size={s}
      className={cn(
        badgeVariants({ variant: v, color: c, size: s }),
        onRemove && 'pr-1',
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          data-badge-dot=""
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            v === 'solid' ? 'bg-current' : dotColors[c],
          )}
        />
      )}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label={labels?.remove ?? 'Olib tashlash'}
          onClick={onRemove}
          className="focus-ring relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-current opacity-60 transition-opacity duration-base after:absolute after:-inset-3 after:content-[''] hover:opacity-100"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="size-3"
          >
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
          </svg>
        </button>
      )}
    </span>
  );
}

export { badgeVariants };
