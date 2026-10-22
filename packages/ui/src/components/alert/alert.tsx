import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AlertColor = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type AlertVariant = 'soft' | 'outline' | 'solid';

const alertVariants = cva(
  'relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 font-sans text-sm',
  {
    variants: {
      variant: {
        soft: 'border-transparent',
        outline: 'bg-surface text-text',
        solid: 'border-transparent',
      },
      color: {
        neutral: '',
        primary: '',
        success: '',
        warning: '',
        danger: '',
        info: '',
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

      { variant: 'outline', color: 'neutral', className: 'border-border' },
      { variant: 'outline', color: 'primary', className: 'border-primary' },
      { variant: 'outline', color: 'success', className: 'border-success' },
      { variant: 'outline', color: 'warning', className: 'border-warning' },
      { variant: 'outline', color: 'danger', className: 'border-danger' },
      { variant: 'outline', color: 'info', className: 'border-info' },

      { variant: 'solid', color: 'neutral', className: 'bg-text text-surface' },
      { variant: 'solid', color: 'primary', className: 'bg-primary text-primary-foreground' },
      { variant: 'solid', color: 'success', className: 'bg-success text-success-foreground' },
      { variant: 'solid', color: 'warning', className: 'bg-warning text-warning-foreground' },
      { variant: 'solid', color: 'danger', className: 'bg-danger text-danger-foreground' },
      { variant: 'solid', color: 'info', className: 'bg-info text-info-foreground' },
    ],
    defaultVariants: { variant: 'soft', color: 'info' },
  },
);

/** `outline` variantida ikonka rangi (fon — surface, matn — text) */
const outlineIconColors: Record<AlertColor, string> = {
  neutral: 'text-text-muted',
  primary: 'text-primary-soft-foreground',
  success: 'text-success-soft-foreground',
  warning: 'text-warning-soft-foreground',
  danger: 'text-danger-soft-foreground',
  info: 'text-info-soft-foreground',
};

function SvgIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full"
    >
      {children}
    </svg>
  );
}

/** Rangga mos ichki ikonka: info ⓘ, success ✓, warning △, danger ⊗ */
function DefaultIcon({ color }: { color: AlertColor }) {
  switch (color) {
    case 'success':
      return (
        <SvgIcon>
          <circle cx="10" cy="10" r="7.5" />
          <path d="M6.75 10.25l2.25 2.25 4.25-4.5" />
        </SvgIcon>
      );
    case 'warning':
      return (
        <SvgIcon>
          <path d="M8.7 3.25a1.5 1.5 0 0 1 2.6 0l6.06 10.5a1.5 1.5 0 0 1-1.3 2.25H3.94a1.5 1.5 0 0 1-1.3-2.25z" />
          <path d="M10 7.5v3.5M10 13.75h.01" />
        </SvgIcon>
      );
    case 'danger':
      return (
        <SvgIcon>
          <circle cx="10" cy="10" r="7.5" />
          <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
        </SvgIcon>
      );
    default:
      return (
        <SvgIcon>
          <circle cx="10" cy="10" r="7.5" />
          <path d="M10 9.25v4.5M10 6.5h.01" />
        </SvgIcon>
      );
  }
}

export interface AlertLabels {
  /** ✕ tugmasining aria-label'i */
  close?: string;
}

export interface AlertProps
  extends Omit<ComponentProps<'div'>, 'color' | 'title'>, VariantProps<typeof alertVariants> {
  /** Qalin sarlavha (ikonka bilan bir qatorda) */
  title?: ReactNode;
  /** Ikonka; `false` — ikonkasiz. Standart — rangga mos ichki SVG */
  icon?: ReactNode | false;
  /** O'ng tomondagi harakat (tor ekranda matn ostiga tushadi) */
  action?: ReactNode;
  /** Berilsa — ✕ tugmasi chiqadi. Yopilishni ilova boshqaradi */
  onClose?: () => void;
  /** Sahifa tepasi uchun: radius 0, faqat pastki chegara, kontent markazda */
  banner?: boolean;
  labels?: AlertLabels;
}

/**
 * Sahifa ichidagi doimiy xabar. Toast'dan farqi — o'zi yo'qolmaydi, kontent oqimida turadi.
 * `danger` va `warning` — `role="alert"` (darhol o'qiladi), qolganlari — `role="status"`.
 */
export function Alert({
  color,
  variant,
  title,
  icon,
  action,
  onClose,
  banner = false,
  labels,
  className,
  children,
  ...props
}: AlertProps) {
  const c = color ?? 'info';
  const v = variant ?? 'soft';
  const role = c === 'danger' || c === 'warning' ? 'alert' : 'status';
  const iconNode = icon === undefined ? <DefaultIcon color={c} /> : icon;
  const hasIcon = iconNode !== false && iconNode !== null;

  return (
    <div
      role={role}
      data-color={c}
      data-variant={v}
      data-banner={banner ? '' : undefined}
      className={cn(
        alertVariants({ variant: v, color: c }),
        banner && 'justify-center rounded-none border-x-0 border-t-0',
        banner && v === 'soft' && 'border-b-border',
        banner && onClose && 'pr-12',
        className,
      )}
      {...props}
    >
      {hasIcon && (
        <span
          data-alert-icon=""
          className={cn(
            'mt-px flex size-[18px] shrink-0 items-center justify-center [&_svg]:size-[18px]',
            v === 'outline' && outlineIconColors[c],
          )}
        >
          {iconNode}
        </span>
      )}
      <div
        className={cn(
          'flex min-w-0 flex-col gap-x-4 gap-y-3 sm:flex-row sm:items-center',
          banner ? 'flex-initial' : 'flex-1',
        )}
      >
        <div className={cn('flex min-w-0 flex-col gap-0.5', !banner && 'flex-1')}>
          {title != null && <div className="leading-5 font-semibold">{title}</div>}
          {children != null && <div className="leading-5 [&_a]:underline">{children}</div>}
        </div>
        {action != null && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          aria-label={labels?.close ?? 'Yopish'}
          onClick={onClose}
          className={cn(
            "focus-ring relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-current opacity-70 transition-opacity duration-base after:absolute after:-inset-2 after:content-[''] hover:opacity-100",
            banner ? 'absolute top-3 right-3' : '-my-0.5 -mr-1',
          )}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="size-4"
          >
            <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { alertVariants };
