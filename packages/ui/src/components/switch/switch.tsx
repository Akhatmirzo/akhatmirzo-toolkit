import { useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { useFieldControl } from '../field/field';

export interface SwitchProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'checked' | 'defaultChecked' | 'role'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: 'sm' | 'md';
  /** Xato holati: input'ga `aria-invalid`, ildizga `data-invalid` */
  invalid?: boolean;
  /** Ildiz `<label>` elementi uchun klass */
  className?: string;
}

const track = {
  sm: 'h-[18px] w-8 after:-inset-x-1 after:-inset-y-[11px]',
  md: 'h-6 w-10 after:-inset-2',
} as const;
const thumb = {
  sm: 'size-3.5 data-[state=checked]:translate-x-3.5',
  md: 'size-5 data-[state=checked]:translate-x-4',
} as const;

/**
 * Darhol ta'sir qiladigan sozlamalar uchun. Native `<input type="checkbox" role="switch">`
 * ustida: `ref` va qolgan atributlar input'ga, `className` ildiz `<label>` ga.
 */
export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  label,
  description,
  size = 'md',
  disabled: disabledProp,
  required: requiredProp,
  invalid: invalidProp,
  className,
  id: idProp,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: SwitchProps) {
  const field = useFieldControl({
    id: idProp,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { id, invalid, required, disabled } = field;
  const labelId = `${id}-label`;
  const descId = `${id}-description`;
  // Label ham, aria-label ham bo'lmasa, izoh o'rab turgan <label> orqali nomga aylanadi —
  // uni yana aria-describedby ga qo'shmaymiz (ikki marta o'qilmasin)
  const hasName =
    Boolean(label) || Boolean(props['aria-label']) || Boolean(props['aria-labelledby']);
  // O'z izohi + Field'dan kelgan izoh/xato id'lari
  const describedBy =
    [description && hasName ? descId : undefined, field.controlProps['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  const [inner, setInner] = useState(defaultChecked);
  const controlled = checkedProp !== undefined;
  const checked = controlled ? checkedProp : inner;
  const state = checked ? 'checked' : 'unchecked';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const next = e.target.checked;
    if (!controlled) setInner(next);
    onCheckedChange?.(next);
  };

  return (
    <label
      htmlFor={id}
      data-state={state}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      data-invalid={invalid ? '' : undefined}
      className={cn(
        'group inline-flex items-start gap-2.5 font-sans text-sm text-text select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={handleChange}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={field.controlProps['aria-invalid']}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        data-state={state}
        className={cn(
          'relative inline-flex shrink-0 items-center rounded-full bg-border-strong p-0.5 transition-colors duration-base ease-out',
          "after:absolute after:content-['']",
          track[size],
          size === 'sm' && 'mt-px',
          'data-[state=checked]:bg-primary',
          !disabled && 'group-hover:data-[state=checked]:bg-primary-hover',
          'peer-aria-invalid:ring-2 peer-aria-invalid:ring-danger-ring',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
        )}
      >
        <span
          data-state={state}
          className={cn(
            'block rounded-full bg-primary-foreground shadow-sm transition-transform duration-base ease-spring',
            thumb[size],
          )}
        />
      </span>
      {(label || description) && (
        <span className={cn('flex flex-col gap-0.5', size === 'md' && 'pt-0.5')}>
          {label && (
            <span id={labelId} className="text-text">
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
