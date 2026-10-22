import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ProgressColor = 'primary' | 'success' | 'warning' | 'danger';
export type ProgressSize = 'sm' | 'md' | 'lg';
/** `indeterminate` — qiymat noma'lum, `loading` — jarayonda, `complete` — `value >= max` */
export type ProgressState = 'indeterminate' | 'loading' | 'complete';

interface ProgressBaseProps {
  /** Joriy qiymat; `null` (standart) — noaniq holat */
  value?: number | null;
  /** Maksimal qiymat */
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  /** Chiziqda — ustida chapda ko'rinadi; doirada — ko'rinmas nom (aria-label) */
  label?: ReactNode;
  /** Qiymatni ko'rsatish (chiziqda o'ngda, doirada markazda; `sm` doirada ko'rsatilmaydi) */
  showValue?: boolean;
  /** Qiymat matni (ko'rinadigan va `aria-valuetext`). Standart: `"64%"` */
  formatValue?: (value: number, max: number) => string;
}

const fillColors: Record<ProgressColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
};

const strokeColors: Record<ProgressColor, string> = {
  primary: 'stroke-primary',
  success: 'stroke-success',
  warning: 'stroke-warning',
  danger: 'stroke-danger',
};

function defaultFormatValue(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

/** Chiziq va doira uchun umumiy hisob: chegaralangan qiymat, foiz, holat va matn */
function useProgressValue(
  value: number | null | undefined,
  maxProp: number | undefined,
  formatValue: ProgressBaseProps['formatValue'],
) {
  const max = maxProp != null && maxProp > 0 ? maxProp : 100;
  const indeterminate = value == null || Number.isNaN(value);
  const current = indeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const percent = (current / max) * 100;
  const state: ProgressState = indeterminate
    ? 'indeterminate'
    : current >= max
      ? 'complete'
      : 'loading';
  const text = indeterminate ? undefined : (formatValue ?? defaultFormatValue)(current, max);
  return { max, indeterminate, current, percent, state, text };
}

const barHeights: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export interface ProgressProps
  extends Omit<ComponentProps<'div'>, 'color' | 'children'>, ProgressBaseProps {}

/**
 * Chiziqli jarayon ko'rsatkichi. `value={null}` — noaniq holat (40% bo'lak chapdan o'ngga yuradi;
 * reduced-motion'da opacity pulsatsiyasi).
 */
export function Progress({
  value = null,
  max: maxProp,
  color = 'primary',
  size = 'md',
  label,
  showValue = false,
  formatValue,
  className,
  ...props
}: ProgressProps) {
  const labelId = useId();
  const { max, indeterminate, current, percent, state, text } = useProgressValue(
    value,
    maxProp,
    formatValue,
  );
  const valueVisible = showValue && !indeterminate;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : current}
      aria-valuetext={text}
      aria-labelledby={label != null ? labelId : undefined}
      data-state={state}
      data-color={color}
      data-size={size}
      className={cn('flex w-full flex-col gap-1.5 font-sans', className)}
      {...props}
    >
      {(label != null || valueVisible) && (
        <div className="flex items-center justify-between gap-3 text-sm">
          {label != null && (
            <span id={labelId} className="min-w-0 truncate text-text">
              {label}
            </span>
          )}
          {valueVisible && (
            <span aria-hidden="true" className="ml-auto shrink-0 text-text-muted tabular-nums">
              {text}
            </span>
          )}
        </div>
      )}
      <div
        data-progress-track=""
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-surface-muted',
          barHeights[size],
        )}
      >
        {indeterminate ? (
          <div className="absolute inset-0 animate-shimmer [animation-duration:1.4s] motion-reduce:animate-none">
            <div
              data-progress-indicator=""
              className={cn(
                'absolute inset-y-0 left-[60%] w-[40%] rounded-full',
                'motion-reduce:left-0 motion-reduce:w-full motion-reduce:animate-pulse',
                fillColors[color],
              )}
            />
          </div>
        ) : (
          <div
            data-progress-indicator=""
            className={cn(
              'h-full w-full rounded-full transition-transform duration-slow ease-out motion-reduce:transition-none',
              fillColors[color],
            )}
            style={{ transform: `translateX(-${100 - percent}%)` }}
          />
        )}
      </div>
    </div>
  );
}

const circleDimensions: Record<ProgressSize, { size: number; stroke: number; className: string }> =
  {
    sm: { size: 24, stroke: 3, className: 'size-6' },
    md: { size: 40, stroke: 4, className: 'size-10 text-[10px]' },
    lg: { size: 64, stroke: 6, className: 'size-16 text-sm' },
  };

export interface ProgressCircleProps
  extends Omit<ComponentProps<'div'>, 'color' | 'children'>, ProgressBaseProps {}

/**
 * Doira shaklidagi jarayon ko'rsatkichi. Noaniq holatda 1s aylanadi
 * (reduced-motion'da opacity pulsatsiyasi).
 */
export function ProgressCircle({
  value = null,
  max: maxProp,
  color = 'primary',
  size = 'md',
  label,
  showValue = false,
  formatValue,
  className,
  ...props
}: ProgressCircleProps) {
  const labelId = useId();
  const { max, indeterminate, current, percent, state, text } = useProgressValue(
    value,
    maxProp,
    formatValue,
  );
  const dim = circleDimensions[size];
  const radius = (dim.size - dim.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Noaniq holatda doiraning chorak qismi aylanadi
  const offset = indeterminate ? circumference * 0.75 : circumference * (1 - percent / 100);
  const plainLabel = typeof label === 'string' || typeof label === 'number';

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={indeterminate ? undefined : current}
      aria-valuetext={text}
      aria-label={plainLabel ? String(label) : undefined}
      aria-labelledby={label != null && !plainLabel ? labelId : undefined}
      data-state={state}
      data-color={color}
      data-size={size}
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center font-sans',
        dim.className,
        className,
      )}
      {...props}
    >
      {label != null && !plainLabel && (
        <span id={labelId} className="sr-only">
          {label}
        </span>
      )}
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${dim.size} ${dim.size}`}
        fill="none"
        className={cn(
          'size-full -rotate-90',
          indeterminate && 'animate-spin motion-reduce:animate-pulse',
        )}
      >
        <circle
          cx={dim.size / 2}
          cy={dim.size / 2}
          r={radius}
          strokeWidth={dim.stroke}
          className="stroke-surface-muted"
        />
        <circle
          data-progress-indicator=""
          cx={dim.size / 2}
          cy={dim.size / 2}
          r={radius}
          strokeWidth={dim.stroke}
          strokeLinecap={indeterminate || percent > 0 ? 'round' : 'butt'}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            'transition-[stroke-dashoffset] duration-slow ease-out motion-reduce:transition-none',
            strokeColors[color],
          )}
        />
      </svg>
      {showValue && !indeterminate && size !== 'sm' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center font-medium text-text tabular-nums"
        >
          {text}
        </span>
      )}
    </div>
  );
}
