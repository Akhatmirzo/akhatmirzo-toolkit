import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useFieldControl } from '../field/field';
import { assignRef } from '../../lib/refs';

export type CheckedState = boolean | 'indeterminate';

export interface CheckboxProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'size' | 'checked' | 'defaultChecked'
> {
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  /** `sm` — 16px, `md` — 20px */
  size?: 'sm' | 'md';
  /** Xato holati: input'ga `aria-invalid`, ildizga `data-invalid` */
  invalid?: boolean;
  /** Ildiz `<label>` elementi uchun klass */
  className?: string;
}

const boxSize = { sm: 'size-4 mt-0.5', md: 'size-5' } as const;
const iconSize = { sm: 'size-3', md: 'size-3.5' } as const;
const hitArea = { sm: 'after:-inset-3', md: 'after:-inset-2.5' } as const;

/**
 * Native `<input type="checkbox">` ustida. `ref` va qolgan atributlar input'ga,
 * `className` ildiz `<label>` ga beriladi.
 */
export function Checkbox({
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
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: CheckboxProps) {
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

  const [inner, setInner] = useState<CheckedState>(defaultChecked);
  const controlled = checkedProp !== undefined;
  const value = controlled ? checkedProp : inner;
  const state = value === 'indeterminate' ? 'indeterminate' : value ? 'checked' : 'unchecked';

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  // `indeterminate` faqat DOM xususiyati — har render'da sinxronlanadi
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = value === 'indeterminate';
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const next = e.target.checked;
    // Boshqariladigan rejimda ota yangilamasa, brauzer o'chirgan indeterminate qaytariladi
    if (controlled) e.target.indeterminate = checkedProp === 'indeterminate';
    else setInner(next);
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
        'group inline-flex items-start gap-2 font-sans text-sm text-text select-none',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className,
      )}
    >
      <input
        ref={setRefs}
        id={id}
        type="checkbox"
        checked={value === true}
        disabled={disabled}
        required={required}
        onChange={handleChange}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={describedBy}
        aria-invalid={field.controlProps['aria-invalid']}
        aria-checked={value === 'indeterminate' ? 'mixed' : undefined}
        className="peer sr-only"
        {...props}
      />
      <span
        aria-hidden="true"
        data-state={state}
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center rounded-sm border-[1.5px] border-border-strong bg-surface text-primary-foreground transition-colors duration-base ease-out',
          "after:absolute after:content-['']",
          boxSize[size],
          hitArea[size],
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
          !disabled &&
            'group-hover:data-[state=unchecked]:border-text-faint group-hover:data-[state=checked]:bg-primary-hover group-hover:data-[state=indeterminate]:bg-primary-hover',
          'peer-aria-invalid:border-danger',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
        )}
      >
        <svg viewBox="0 0 16 16" fill="none" className={cn('absolute', iconSize[size])}>
          <path
            d="M3.5 8.5l3 3 6-7"
            pathLength={1}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            data-state={state}
            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-base ease-out data-[state=checked]:[stroke-dashoffset:0]"
          />
        </svg>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          data-state={state}
          className={cn(
            'absolute scale-50 opacity-0 transition-[opacity,scale] duration-base ease-out data-[state=indeterminate]:scale-100 data-[state=indeterminate]:opacity-100',
            iconSize[size],
          )}
        >
          <path d="M4 8h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </span>
      {(label || description) && (
        <span className="flex flex-col gap-0.5">
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
