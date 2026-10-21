import {
  createContext,
  use,
  useId,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useFieldControl } from '../field/field';

type RadioSize = 'sm' | 'md';
type RadioVariant = 'default' | 'card';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  select: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  size: RadioSize;
  variant: RadioVariant;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'dir'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  /** `card` — har bir variant katta bosiladigan karta */
  variant?: RadioVariant;
  size?: RadioSize;
  /** Native radio'lar uchun umumiy `name` (berilmasa avtomatik) */
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** Xato holati: guruh va radio'larga `aria-invalid`, ildizga `data-invalid` */
  invalid?: boolean;
}

/** Native radio guruhi: ↑↓ / ←→ bilan yurish va Tab bilan kirish-chiqish brauzerniki. */
export function RadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  variant = 'default',
  size = 'md',
  name: nameProp,
  disabled: disabledProp,
  required: requiredProp,
  invalid: invalidProp,
  id: idProp,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: RadioGroupProps) {
  // Field ichida: izoh/xato, invalid, required, disabled guruhga o'tadi
  const field = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, required, disabled } = field;
  const autoName = useId();
  const [inner, setInner] = useState(defaultValue);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : inner;

  const select = (next: string) => {
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };

  return (
    <RadioGroupContext
      value={{
        name: nameProp ?? autoName,
        value,
        select,
        disabled,
        required,
        invalid,
        size,
        variant,
      }}
    >
      <div
        id={field.id}
        role="radiogroup"
        aria-orientation={orientation}
        aria-required={required || undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={field.controlProps['aria-describedby']}
        // div label bilan bog'lanmaydi (htmlFor ishlamaydi) — nom Field label'idan olinadi
        aria-labelledby={ariaLabelledBy ?? (props['aria-label'] ? undefined : field.labelId)}
        data-invalid={invalid ? '' : undefined}
        data-orientation={orientation}
        data-variant={variant}
        data-size={size}
        data-disabled={disabled ? '' : undefined}
        className={cn(
          'flex font-sans',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          variant === 'card' ? 'gap-3' : orientation === 'vertical' ? 'gap-3' : 'gap-x-6 gap-y-3',
          variant === 'card' && orientation === 'horizontal' && '*:min-w-48 *:flex-1',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext>
  );
}

export interface RadioProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'value' | 'checked' | 'defaultChecked'
> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  /** Ildiz `<label>` elementi uchun klass */
  className?: string;
}

const circleSize = { sm: 'size-4', md: 'size-5' } as const;
const dotSize = { sm: 'size-1.5', md: 'size-2' } as const;

/** `RadioGroup` ichida ishlatiladi. `ref` va qolgan atributlar input'ga, `className` — `<label>` ga. */
export function Radio({
  value,
  label,
  description,
  disabled: disabledProp,
  className,
  onChange,
  id: idProp,
  ...props
}: RadioProps) {
  const ctx = use(RadioGroupContext);
  if (!ctx) throw new Error('Radio faqat RadioGroup ichida ishlatiladi');

  const autoId = useId();
  const id = idProp ?? autoId;
  const labelId = `${id}-label`;
  const descId = `${id}-description`;
  const disabled = ctx.disabled || disabledProp;
  const checked = ctx.value === value;
  const state = checked ? 'checked' : 'unchecked';
  const card = ctx.variant === 'card';
  const size = ctx.size;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (e.target.checked) ctx.select(value);
  };

  return (
    <label
      htmlFor={id}
      data-state={state}
      data-disabled={disabled ? '' : undefined}
      className={cn(
        'group flex items-start gap-2 font-sans text-sm text-text select-none',
        card &&
          'gap-3 rounded-lg border border-border bg-surface p-4 shadow-xs transition-[border-color,box-shadow,background-color] duration-base ease-out',
        card &&
          'data-[state=checked]:border-primary data-[state=checked]:ring-1 data-[state=checked]:ring-primary',
        card &&
          'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring',
        card && !disabled && 'hover:border-border-strong',
        !card && 'inline-flex',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={ctx.required}
        onChange={handleChange}
        aria-invalid={ctx.invalid || undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        data-state={state}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-full border-[1.5px] border-border-strong bg-surface transition-colors duration-base ease-out',
          circleSize[size],
          size === 'sm' && 'mt-0.5',
          !card && "after:absolute after:content-['']",
          !card && (size === 'sm' ? 'after:-inset-3' : 'after:-inset-2.5'),
          'data-[state=checked]:border-primary',
          !disabled && 'group-hover:data-[state=unchecked]:border-text-faint',
          'peer-aria-invalid:border-danger',
          !card &&
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
        )}
      >
        <span
          data-state={state}
          className={cn(
            'rounded-full bg-primary scale-0 transition-[scale] duration-base ease-spring data-[state=checked]:scale-100',
            dotSize[size],
          )}
        />
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
          {label && (
            <span id={labelId} className={cn('text-text', card && 'font-medium')}>
              {label}
            </span>
          )}
          {description && (
            <span
              id={descId}
              className={cn('text-text-muted', size === 'sm' ? 'text-xs' : 'text-sm')}
            >
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
