import { useControllableState } from '@akhatmirzo/hooks';
import { cva } from 'class-variance-authority';
import { useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { mergeRefs } from '../../lib/refs';
import { useFieldControl } from '../field/field';

export type RatingSize = 'sm' | 'md' | 'lg';
export type RatingColor = 'warning' | 'primary' | 'danger';

export interface RatingLabels {
  /** Qiymat matni: radio nomi va `readOnly` dagi `aria-label`. Default `"4.5 / 5"` */
  value?: (value: number, max: number) => string;
  /** Guruh nomi (Field va `aria-label` bo'lmasa) */
  group?: string;
}

const defaultLabels: Required<RatingLabels> = {
  value: (value, max) => `${value} / ${max}`,
  group: 'Baho',
};

export interface RatingProps extends Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'children' | 'color'
> {
  value?: number;
  /** Boshlang'ich qiymat. Default `0` */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Yulduzlar soni. Default `5` */
  max?: number;
  /** Yarim yulduz (0.5 qadam) */
  allowHalf?: boolean;
  /** Tanlangan qiymatni qayta bosish `0` qiladi. Default `true` */
  allowClear?: boolean;
  /** Faqat ko'rsatish: `role="img"` va `aria-label="4.5 / 5"` */
  readOnly?: boolean;
  disabled?: boolean;
  /** Yulduz o'lchami 16 / 20 / 28px */
  size?: RatingSize;
  /** Ichki yulduz o'rniga ikonka (`<Heart />`) */
  icon?: ReactNode;
  /** To'lgan yulduz rangi. Default `warning` */
  color?: RatingColor;
  labels?: RatingLabels;
}

const rootVariants = cva(
  'inline-flex items-center font-sans data-disabled:cursor-not-allowed data-disabled:opacity-50',
  {
    variants: {
      size: { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1.5' },
    },
    defaultVariants: { size: 'md' },
  },
);

const starSize: Record<RatingSize, string> = {
  sm: 'size-4 [&_svg]:size-4',
  md: 'size-5 [&_svg]:size-5',
  lg: 'size-7 [&_svg]:size-7',
};

const fillColor: Record<RatingColor, string> = {
  warning: 'text-warning',
  primary: 'text-primary',
  danger: 'text-danger',
};

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
    </svg>
  );
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Raqamni qadamga yaxlitlaydi (0.5 qadamda 3.7 → 3.5) */
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/**
 * Yulduzli baho. Interaktiv holatda — `radiogroup` (strelkalar, Home/End, hover'da oldindan
 * ko'rish); `readOnly` — rasm (`role="img"`, `aria-label="4.5 / 5"`), kasr qiymatlar ham
 * aniq chiziladi. `Field` ichida label avtomatik ulanadi.
 * @example
 * <Rating defaultValue={4} />
 * <Rating value={v} onValueChange={setV} allowHalf size="lg" />
 * <Rating value={4.5} readOnly />
 */
export function Rating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  allowHalf = false,
  allowClear = true,
  readOnly = false,
  disabled: disabledProp,
  size = 'md',
  icon,
  color = 'warning',
  labels,
  id,
  className,
  ref,
  onKeyDown,
  onPointerLeave,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: RatingProps) {
  const field = useFieldControl({
    id,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
  });
  const { disabled } = field;
  const text = { ...defaultLabels, ...labels };
  const step = allowHalf ? 0.5 : 1;

  const [rawValue, setValue] = useControllableState<number>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const value = clamp(rawValue, 0, max);
  const [hover, setHover] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const interactive = !readOnly && !disabled;
  const shown = interactive && hover !== null ? hover : value;
  const glyph = icon ?? <StarIcon />;

  const stars = Array.from({ length: max }, (_, i) => {
    const fill = clamp(shown - i, 0, 1);
    return (
      <span
        key={i}
        aria-hidden="true"
        data-slot="rating-star"
        data-state={fill >= 1 ? 'full' : fill > 0 ? 'partial' : 'empty'}
        className={cn('relative inline-flex shrink-0', starSize[size])}
      >
        <span className="flex text-text-muted">{glyph}</span>
        {fill > 0 && (
          <span
            className={cn('absolute inset-0 flex', fillColor[color])}
            style={fill < 1 ? { clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` } : undefined}
          >
            {glyph}
          </span>
        )}
      </span>
    );
  });

  if (readOnly) {
    return (
      <div
        ref={ref}
        id={id}
        role="img"
        aria-label={ariaLabel ?? text.value(value, max)}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={field.controlProps['aria-describedby']}
        data-slot="rating"
        data-size={size}
        data-readonly=""
        data-disabled={disabled ? '' : undefined}
        className={cn(rootVariants({ size }), className)}
        {...props}
      >
        {stars}
      </div>
    );
  }

  // Har bir yulduzda 1 (yoki allowHalf bo'lsa 2) ta radio: chap yarmi — x.5, o'ng — x
  const checked = value > 0 ? clamp(roundTo(value, step), step, max) : 0;
  const tabbable = checked || step;

  const focusRadio = (v: number) => {
    rootRef.current?.querySelector<HTMLElement>(`[data-rating-value="${v}"]`)?.focus();
  };

  const choose = (v: number) => {
    if (!interactive) return;
    setValue(allowClear && v === checked ? 0 : v);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !interactive) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    let next: number;
    switch (e.key) {
      case 'ArrowUp':
        next = checked + step;
        break;
      case 'ArrowDown':
        next = checked - step;
        break;
      case 'ArrowRight':
        next = rtl ? checked - step : checked + step;
        break;
      case 'ArrowLeft':
        next = rtl ? checked + step : checked - step;
        break;
      case 'Home':
        next = step;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    // Baho yo'q holatda kamaytirish hech narsa tanlamaydi
    if (next <= 0 && checked === 0) return;
    next = clamp(next, step, max);
    setHover(null);
    setValue(next);
    focusRadio(next);
  };

  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : field.labelId);

  return (
    <div
      ref={mergeRefs(rootRef, ref)}
      id={field.id}
      role="radiogroup"
      aria-label={labelledBy ? undefined : (ariaLabel ?? text.group)}
      aria-labelledby={labelledBy}
      aria-describedby={field.controlProps['aria-describedby']}
      aria-disabled={disabled || undefined}
      data-slot="rating"
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      data-hover={hover !== null ? '' : undefined}
      className={cn(rootVariants({ size }), className)}
      onKeyDown={handleKeyDown}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        setHover(null);
      }}
      {...props}
    >
      {stars.map((star, i) => {
        const whole = i + 1;
        const values = allowHalf ? [whole - 0.5, whole] : [whole];
        return (
          // Fokus halqasi butun yulduz atrofida (yarim radio fokusda bo'lsa ham)
          <span
            key={i}
            className="relative inline-flex shrink-0 rounded-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
          >
            {star}
            {values.map((v, j) => {
              const isChecked = v === checked;
              const half = values.length === 2;
              return (
                <span
                  key={v}
                  role="radio"
                  aria-checked={isChecked}
                  aria-label={text.value(v, max)}
                  aria-disabled={disabled || undefined}
                  tabIndex={!disabled && v === tabbable ? 0 : -1}
                  data-rating-value={v}
                  data-state={isChecked ? 'checked' : 'unchecked'}
                  className={cn(
                    'absolute inset-y-0 rounded-sm outline-none',
                    half ? (j === 0 ? 'left-0 w-1/2' : 'right-0 w-1/2') : 'inset-x-0',
                    interactive ? 'cursor-pointer' : 'cursor-not-allowed',
                  )}
                  onClick={() => choose(v)}
                  onPointerEnter={() => interactive && setHover(v)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      choose(v);
                    }
                  }}
                />
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
