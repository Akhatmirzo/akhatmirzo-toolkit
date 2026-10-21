import { cva } from 'class-variance-authority';
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { useFieldControl } from '../field/field';
import { assignRef } from '../../lib/refs';
import { controlContainerBase, controlElementBase } from './control-styles';

const containerVariants = cva(
  [controlContainerBase, 'cursor-text items-center gap-2 [&_svg]:shrink-0'],
  {
    variants: {
      size: {
        sm: 'h-8 px-2.5 text-sm [&_svg]:size-4',
        md: 'h-10 px-3 text-sm [&_svg]:size-[18px]',
        lg: 'h-12 px-4 text-base [&_svg]:size-5',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const actionVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-text-muted',
    'transition-colors duration-fast ease-out hover:bg-surface-muted hover:text-text focus-ring',
  ],
  {
    variants: {
      size: {
        sm: '-mr-1 size-6',
        md: '-mr-1.5 size-7',
        lg: '-mr-2 size-8',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

type InputSize = 'sm' | 'md' | 'lg';

export interface InputLabels {
  clear?: string;
  showPassword?: string;
  hidePassword?: string;
}

const defaultLabels: Required<InputLabels> = {
  clear: 'Tozalash',
  showPassword: "Parolni ko'rsatish",
  hidePassword: 'Parolni yashirish',
};

export interface InputProps extends Omit<ComponentProps<'input'>, 'size' | 'prefix'> {
  size?: InputSize;
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Chap tomondagi matn, ajratuvchi chiziq bilan (masalan "+998") */
  prefix?: ReactNode;
  /** O'ng tomondagi matn, ajratuvchi chiziq bilan (masalan "so'm") */
  suffix?: ReactNode;
  /** Qiymat bo'lsa ✕ tugmasi; `Esc` ham tozalaydi */
  clearable?: boolean;
  onClear?: () => void;
  /** Ichki tugmalar matnlari */
  labels?: InputLabels;
  /** Ichki `<input>` klassi (`className` — konteynerga) */
  inputClassName?: string;
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="m3 3 18 18" />}
    </svg>
  );
}

/** Native setter orqali qiymatni o'zgartiradi — React `onChange` ham ishlaydi */
function setNativeValue(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export function Input({
  size = 'md',
  invalid: invalidProp,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  clearable = false,
  onClear,
  labels,
  className,
  inputClassName,
  type = 'text',
  id,
  disabled: disabledProp,
  required: requiredProp,
  readOnly = false,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled } = field;
  const text = { ...defaultLabels, ...labels };

  const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  const controlled = value !== undefined;
  const [innerHasValue, setInnerHasValue] = useState(
    () => defaultValue != null && String(defaultValue).length > 0,
  );
  const hasValue = controlled ? value != null && String(value).length > 0 : innerHasValue;

  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const canClear = clearable && hasValue && !disabled && !readOnly;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInnerHasValue(e.target.value.length > 0);
    onChange?.(e);
  };

  const clear = () => {
    const el = inputRef.current;
    if (!el) return;
    setNativeValue(el, '');
    onClear?.();
    el.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Escape' && canClear) {
      e.preventDefault();
      e.stopPropagation();
      clear();
    }
  };

  // Konteynerning bo'sh joyiga bosilganda fokus input'ga o'tadi
  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (disabled || target === inputRef.current || target.closest('button')) return;
    e.preventDefault();
    inputRef.current?.focus();
  };

  const separator = 'shrink-0 select-none text-text-muted';

  return (
    <div
      data-slot="input"
      data-size={size}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      className={cn(containerVariants({ size }), className)}
      onMouseDown={handleContainerMouseDown}
    >
      {leftIcon && (
        <span aria-hidden="true" className="flex shrink-0 text-text-muted">
          {leftIcon}
        </span>
      )}
      {prefix != null && (
        <span className={cn(separator, 'border-r border-border pr-2')}>{prefix}</span>
      )}
      <input
        ref={setRefs}
        type={isPassword && showPassword ? 'text' : type}
        disabled={disabled}
        required={requiredProp}
        readOnly={readOnly}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(controlElementBase, 'h-full', inputClassName)}
        {...field.controlProps}
        {...props}
      />
      {canClear && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={text.clear}
          className={actionVariants({ size })}
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
        >
          <XIcon />
        </button>
      )}
      {isPassword && (
        <button
          type="button"
          aria-label={showPassword ? text.hidePassword : text.showPassword}
          disabled={disabled}
          className={cn(actionVariants({ size }), 'disabled:cursor-not-allowed')}
          onClick={() => setShowPassword((s) => !s)}
        >
          <EyeIcon off={showPassword} />
        </button>
      )}
      {suffix != null && (
        <span className={cn(separator, 'border-l border-border pl-2')}>{suffix}</span>
      )}
      {rightIcon && (
        <span aria-hidden="true" className="flex shrink-0 text-text-muted">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
