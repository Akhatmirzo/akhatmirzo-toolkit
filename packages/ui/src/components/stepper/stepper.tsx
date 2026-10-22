import { useControllableState } from '@akhatmirzo/hooks';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/* Ichki ikonkalar */

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 6v8M12 18.5h.01" />
    </svg>
  );
}

/* Turlar */

export type StepperStatus = 'complete' | 'current' | 'upcoming' | 'error';
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperSize = 'sm' | 'md';

export interface StepperStep {
  title: ReactNode;
  description?: ReactNode;
  /** Raqam o'rniga ikonka (bajarilgan qadamda ✓, xatoda ! ko'rinadi) */
  icon?: ReactNode;
  /** "ixtiyoriy" belgisi */
  optional?: boolean;
  /** Qadamni xato holatiga o'tkazadi */
  status?: 'error';
}

export interface StepperLabels {
  /** Ekran o'quvchi uchun qadam raqami. Default `(i, n) => "${i}-qadam, ${n} tadan"` */
  step?: (index: number, count: number) => string;
  /** Default `"ixtiyoriy"` */
  optional?: string;
  /** Default `"bajarildi"` */
  completed?: string;
  /** Default `"xato"` */
  error?: string;
}

const defaultLabels: Required<StepperLabels> = {
  step: (i, n) => `${i}-qadam, ${n} tadan`,
  optional: 'ixtiyoriy',
  completed: 'bajarildi',
  error: 'xato',
};

export interface StepperProps extends Omit<ComponentProps<'div'>, 'children' | 'defaultValue'> {
  steps: StepperStep[];
  /** Joriy qadam indeksi (0 dan). `steps.length` — hammasi bajarilgan */
  value?: number;
  /** Default `0` */
  defaultValue?: number;
  /** Berilsa — o'tgan qadamlar bosiladigan bo'ladi */
  onValueChange?: (index: number) => void;
  /** Kelgusi qadamlarga ham o'tishga ruxsat. Default `false` */
  allowFutureSteps?: boolean;
  /** Default `horizontal` */
  orientation?: StepperOrientation;
  /** Doira: `md` — 32px, `sm` — 24px. Default `md` */
  size?: StepperSize;
  /**
   * `"2 / 4 · Yetkazib berish"` + chiziq. `'auto'` — faqat gorizontalda va 640px dan tor
   * ekranda. Default `'auto'`
   */
  compact?: boolean | 'auto';
  labels?: StepperLabels;
}

const circleSize: Record<StepperSize, string> = {
  sm: 'size-6 text-xs [&_svg]:size-3.5',
  md: 'size-8 text-sm [&_svg]:size-4',
};

const circleStatus: Record<StepperStatus, string> = {
  complete: 'bg-primary text-primary-foreground',
  current: 'border-2 border-primary bg-surface text-primary ring-4 ring-primary/15',
  upcoming: 'border border-border-strong bg-surface text-text-muted',
  error: 'bg-danger text-danger-foreground',
};

const titleStatus: Record<StepperStatus, string> = {
  complete: 'text-text',
  current: 'font-semibold text-text',
  upcoming: 'text-text-muted',
  error: 'text-danger',
};

/** Vertikal ulovchi chiziq: doira markazidan pastga */
const verticalConnector: Record<StepperSize, string> = {
  sm: 'left-[11px] top-8',
  md: 'left-[15px] top-10',
};

/**
 * Ko'p qadamli jarayon ko'rsatkichi (ro'yxatdan o'tish, checkout, sozlash ustasi).
 * @example
 * <Stepper
 *   value={step}
 *   onValueChange={setStep}
 *   steps={[{ title: 'Savat' }, { title: 'Yetkazib berish' }, { title: "To'lov" }]}
 * />
 */
export function Stepper({
  steps,
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  allowFutureSteps = false,
  orientation = 'horizontal',
  size = 'md',
  compact = 'auto',
  labels: labelsProp,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  ...props
}: StepperProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [value, setValue] = useControllableState<number>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const count = steps.length;
  const horizontal = orientation === 'horizontal';
  const showCompact = compact === true || (compact === 'auto' && horizontal);
  const showFull = compact !== true;

  const statusOf = (step: StepperStep, i: number): StepperStatus =>
    step.status === 'error'
      ? 'error'
      : i < value
        ? 'complete'
        : i === value
          ? 'current'
          : 'upcoming';

  const clickable = (i: number) =>
    onValueChange !== undefined && i !== value && (i < value || allowFutureSteps);

  const full = (
    <ol
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      data-slot="stepper-list"
      data-orientation={orientation}
      className={cn(
        'm-0 flex list-none p-0',
        horizontal ? 'items-start gap-3' : 'flex-col',
        compact === 'auto' && horizontal && 'max-sm:hidden',
      )}
    >
      {steps.map((step, i) => {
        const status = statusOf(step, i);
        const last = i === count - 1;
        const canClick = clickable(i);
        const Comp = canClick ? 'button' : 'div';

        const body = (
          <>
            <span
              aria-hidden="true"
              data-slot="stepper-indicator"
              data-status={status}
              className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tabular-nums',
                'transition-[background-color,border-color,color,box-shadow] duration-slow ease-out motion-reduce:transition-none',
                circleSize[size],
                circleStatus[status],
              )}
            >
              {status === 'complete' ? (
                <CheckIcon />
              ) : status === 'error' ? (
                <AlertIcon />
              ) : (
                (step.icon ?? i + 1)
              )}
            </span>
            <span
              className={cn(
                'flex min-w-0 flex-col gap-0.5 text-left',
                size === 'md' ? 'pt-1.5' : 'pt-0.5',
              )}
            >
              <span
                data-slot="stepper-title"
                className={cn(
                  'text-sm leading-5 transition-colors duration-base ease-out',
                  horizontal && 'whitespace-nowrap',
                  titleStatus[status],
                  canClick && 'group-hover:text-primary',
                )}
              >
                <span className="sr-only">{labels.step(i + 1, count)}: </span>
                {step.title}
                {status === 'complete' && <span className="sr-only">, {labels.completed}</span>}
                {status === 'error' && <span className="sr-only">, {labels.error}</span>}
              </span>
              {step.optional && <span className="text-xs text-text-muted">{labels.optional}</span>}
              {step.description != null && (
                <span
                  data-slot="stepper-description"
                  className={cn(
                    'text-text-muted',
                    size === 'md' ? 'text-sm' : 'text-xs',
                    status === 'error' && 'text-danger',
                  )}
                >
                  {step.description}
                </span>
              )}
            </span>
          </>
        );

        return (
          <li
            key={i}
            data-slot="stepper-step"
            data-status={status}
            aria-current={status === 'current' ? 'step' : undefined}
            className={cn(
              'relative flex',
              horizontal ? 'flex-1 items-start gap-3 last:flex-none' : 'min-w-0 pb-6 last:pb-0',
            )}
          >
            <Comp
              {...(canClick ? { type: 'button' as const, onClick: () => setValue(i) } : {})}
              data-clickable={canClick ? '' : undefined}
              className={cn(
                'group flex items-start gap-3 rounded-md border-0 bg-transparent p-0 font-sans',
                !horizontal && 'min-w-0',
                canClick && 'cursor-pointer focus-ring',
              )}
            >
              {body}
            </Comp>
            {!last && (
              <span
                aria-hidden="true"
                data-slot="stepper-connector"
                className={cn(
                  'overflow-hidden rounded-full bg-border',
                  horizontal
                    ? cn(
                        'h-0.5 min-w-6 flex-1 self-start',
                        size === 'md' ? 'mt-[15px]' : 'mt-[11px]',
                      )
                    : cn('absolute bottom-1 w-0.5', verticalConnector[size]),
                )}
              >
                <span
                  className={cn(
                    'block size-full bg-primary transition-transform duration-slow ease-out motion-reduce:transition-none',
                    horizontal ? 'origin-left' : 'origin-top',
                    i < value ? 'scale-100' : horizontal ? 'scale-x-0' : 'scale-y-0',
                  )}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );

  // Ixcham ko'rinish: "2 / 4 · Yetkazib berish" + chiziq
  const index = Math.min(Math.max(value, 0), Math.max(count - 1, 0));
  const currentStep = steps[index];
  const currentStatus = currentStep ? statusOf(currentStep, index) : 'upcoming';
  const ratio = count ? Math.min(value + 1, count) / count : 0;
  const short = currentStep && (
    <div
      data-slot="stepper-compact"
      data-status={currentStatus}
      // Ro'yxat chizilmaganda (compact={true}) nom shu blokka o'tadi
      {...(!showFull && {
        role: 'group',
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
      })}
      className={cn('flex flex-col gap-2', compact === 'auto' && 'sm:hidden')}
    >
      <p className="m-0 flex min-w-0 items-baseline gap-1.5 text-sm">
        <span className="shrink-0 text-text-muted tabular-nums">
          <span aria-hidden="true">
            {index + 1} / {count} ·
          </span>
          <span className="sr-only">{labels.step(index + 1, count)}:</span>
        </span>
        <span
          className={cn(
            'truncate font-semibold',
            currentStatus === 'error' ? 'text-danger' : 'text-text',
          )}
        >
          {currentStep.title}
          {currentStatus === 'error' && <span className="sr-only">, {labels.error}</span>}
        </span>
      </p>
      <span
        aria-hidden="true"
        className="block h-1.5 overflow-hidden rounded-full bg-surface-muted"
      >
        <span
          className={cn(
            'block size-full origin-left rounded-full transition-transform duration-slow ease-out motion-reduce:transition-none',
            currentStatus === 'error' ? 'bg-danger' : 'bg-primary',
          )}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </span>
    </div>
  );

  return (
    <div
      data-slot="stepper"
      data-orientation={orientation}
      data-size={size}
      className={cn('min-w-0 font-sans', className)}
      {...props}
    >
      {showFull && full}
      {showCompact && short}
    </div>
  );
}
