import * as SliderPrimitive from '@radix-ui/react-slider';
import { useControllableState } from '@akhatmirzo/hooks';
import { cva } from 'class-variance-authority';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useFieldControl } from '../field/field';

export type SliderSize = 'sm' | 'md';
export type SliderShowValue = 'never' | 'active' | 'always';

export interface SliderMark {
  value: number;
  /** Belgi ostidagi yozuv (berilmasa — faqat chiziqcha) */
  label?: ReactNode;
}

export interface SliderLabels {
  /** Tutqichning ekran o'quvchi uchun nomi. `index` — 0 dan, `count` — tutqichlar soni */
  thumb?: (index: number, count: number) => string;
}

type RootProps = ComponentProps<typeof SliderPrimitive.Root>;

export interface SliderProps extends Omit<
  RootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'onValueCommit' | 'inverted' | 'children'
> {
  /** Qiymat — doim massiv: bitta tutqich `[50]`, oraliq `[20, 80]` */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Sudrash tugaganda (yoki klaviatura bilan o'zgarganda) — API so'rovlari uchun */
  onValueCommit?: (value: number[]) => void;
  /** `md` — trek 6px, tutqich 20px; `sm` — 4px / 16px */
  size?: SliderSize;
  /** Tutqich ustidagi qiymat pufakchasi: `active` — hover / sudrash / fokusda */
  showValue?: SliderShowValue;
  /** Pufakcha va `aria-valuetext` uchun (`(v) => formatCurrency(v)`) */
  formatValue?: (value: number) => string;
  /** Trek ostidagi belgilar */
  marks?: SliderMark[];
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  labels?: SliderLabels;
}

const defaultThumbLabel = (index: number, count: number) => {
  if (count === 1) return 'Qiymat';
  if (count === 2) return index === 0 ? 'Minimal qiymat' : 'Maksimal qiymat';
  return `${index + 1}-qiymat, ${count} tadan`;
};

const rootVariants = cva(
  'relative flex touch-none items-center font-sans select-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
  {
    variants: {
      orientation: {
        horizontal: 'w-full',
        vertical: 'h-full min-h-40 flex-col justify-center',
      },
      size: { sm: '', md: '' },
    },
    compoundVariants: [
      { orientation: 'horizontal', size: 'sm', className: 'h-4' },
      { orientation: 'horizontal', size: 'md', className: 'h-5' },
      { orientation: 'vertical', size: 'sm', className: 'w-4' },
      { orientation: 'vertical', size: 'md', className: 'w-5' },
    ],
  },
);

const trackSize: Record<SliderSize, string> = {
  sm: 'data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1',
  md: 'data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5',
};

const thumbVariants = cva(
  [
    'group/thumb relative block cursor-grab rounded-full border-2 border-primary bg-surface shadow-sm outline-none',
    'transition-[box-shadow,border-color] duration-base ease-out active:cursor-grabbing',
    'not-data-disabled:hover:ring-6 not-data-disabled:hover:ring-primary/15',
    'focus-ring data-disabled:cursor-not-allowed',
    // Bosish maydoni ≥ 40px (ko'rinmas)
    "after:absolute after:-inset-3 after:rounded-full after:content-['']",
    'aria-invalid:border-danger aria-invalid:not-data-disabled:hover:ring-danger/15',
  ],
  {
    variants: {
      size: { sm: 'size-4', md: 'size-5' },
    },
    defaultVariants: { size: 'md' },
  },
);

const bubbleVisibility: Record<Exclude<SliderShowValue, 'never'>, string> = {
  always: 'opacity-100',
  active:
    'opacity-0 group-hover/thumb:opacity-100 group-focus/thumb:opacity-100 group-data-disabled/thumb:opacity-0',
};

/** Belgining joyi — Radix tutqichni chegaradan chiqarmaslik uchun surgan masofaga mos */
function markPosition(percent: number, thumbPx: number) {
  const offset = (thumbPx / 2) * (1 - percent / 50);
  return `calc(${percent}% + ${offset}px)`;
}

const thumbPxBySize: Record<SliderSize, number> = { sm: 16, md: 20 };

/**
 * Raqamli qiymat yoki oraliq tanlash (Radix Slider). Qiymat doim massiv: tutqichlar soni
 * massiv uzunligidan olinadi. `Field` ichida label va xato avtomatik ulanadi.
 * @example
 * <Slider defaultValue={[40]} />
 * <Slider value={price} onValueChange={setPrice} min={0} max={5_000_000} step={50_000}
 *         formatValue={(v) => formatCurrency(v)} />
 * <Field label="Ovoz balandligi"><Slider defaultValue={[70]} /></Field>
 */
export function Slider({
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  orientation = 'horizontal',
  size = 'md',
  showValue = 'active',
  formatValue = String,
  marks,
  disabled: disabledProp,
  invalid: invalidProp,
  labels,
  id: idProp,
  dir,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SliderProps) {
  const field = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled } = field;
  const baseId = useId();

  const [values, setValues] = useControllableState<number[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
  });

  const count = values.length;
  const thumbLabel = labels?.thumb ?? defaultThumbLabel;
  // Tashqi nom: aria-labelledby prop yoki Field label'i
  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : field.labelId);
  const horizontal = orientation === 'horizontal';
  const thumbPx = thumbPxBySize[size];
  const startEdge = horizontal ? (dir === 'rtl' ? 'right' : 'left') : 'bottom';
  const hasMarkLabels = Boolean(marks?.some((m) => m.label != null && m.label !== false));

  return (
    <SliderPrimitive.Root
      value={values}
      onValueChange={setValues}
      onValueCommit={onValueCommit}
      min={min}
      max={max}
      step={step}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      orientation={orientation}
      disabled={disabled}
      dir={dir}
      data-size={size}
      data-invalid={invalid ? '' : undefined}
      className={cn(
        rootVariants({ orientation, size }),
        marks && marks.length > 0 && horizontal && (hasMarkLabels ? 'mb-6' : 'mb-2'),
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'relative grow overflow-hidden rounded-full bg-surface-muted',
          trackSize[size],
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'absolute rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
            invalid && 'bg-danger',
          )}
        />
      </SliderPrimitive.Track>

      {marks && marks.length > 0 && (
        <div
          aria-hidden="true"
          data-slot="slider-marks"
          className={cn(
            'pointer-events-none absolute',
            horizontal
              ? cn('inset-x-0', size === 'sm' ? 'top-4' : 'top-5')
              : cn('inset-y-0', size === 'sm' ? 'left-4' : 'left-5'),
          )}
        >
          {marks.map((mark) => {
            const percent =
              max > min ? Math.min(100, Math.max(0, ((mark.value - min) / (max - min)) * 100)) : 0;
            return (
              <span
                key={mark.value}
                data-slot="slider-mark"
                className={cn(
                  'absolute flex items-center gap-1 text-xs whitespace-nowrap text-text-muted',
                  horizontal ? '-translate-x-1/2 flex-col' : 'translate-y-1/2 flex-row pl-1',
                  horizontal && dir === 'rtl' && 'translate-x-1/2',
                )}
                style={{ [startEdge]: markPosition(percent, thumbPx) }}
              >
                <span
                  className={cn('block bg-border-strong', horizontal ? 'h-1.5 w-px' : 'h-px w-1.5')}
                />
                {mark.label != null && mark.label !== false && (
                  <span className="leading-4">{mark.label}</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {values.map((v, index) => {
        const thumbId = index === 0 ? field.id : `${baseId}-thumb-${index}`;
        const ownLabel = thumbLabel(index, count);
        const text = formatValue(v);
        let name: { 'aria-label'?: string; 'aria-labelledby'?: string };
        if (labelledBy) {
          // Bitta tutqich — tashqi label'ning o'zi; oraliqda — "Narx, Minimal qiymat"
          name =
            count === 1
              ? { 'aria-labelledby': labelledBy }
              : { 'aria-labelledby': `${labelledBy} ${thumbId}`, 'aria-label': ownLabel };
        } else if (ariaLabel) {
          name = { 'aria-label': count === 1 ? ariaLabel : `${ariaLabel}, ${ownLabel}` };
        } else {
          name = { 'aria-label': ownLabel };
        }
        return (
          <SliderPrimitive.Thumb
            key={index}
            id={thumbId}
            {...name}
            aria-valuetext={text}
            aria-describedby={field.controlProps['aria-describedby']}
            aria-invalid={field.controlProps['aria-invalid']}
            data-slot="slider-thumb"
            className={thumbVariants({ size })}
          >
            {showValue !== 'never' && (
              <span
                aria-hidden="true"
                data-slot="slider-value"
                className={cn(
                  'pointer-events-none absolute z-10 rounded-md bg-text px-2 py-1 font-sans text-xs leading-none font-medium whitespace-nowrap text-background tabular-nums',
                  'transition-opacity duration-base ease-out motion-reduce:transition-none',
                  horizontal
                    ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
                    : 'top-1/2 right-full mr-2 -translate-y-1/2',
                  bubbleVisibility[showValue],
                )}
              >
                {text}
              </span>
            )}
          </SliderPrimitive.Thumb>
        );
      })}
    </SliderPrimitive.Root>
  );
}
