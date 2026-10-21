import { cva } from 'class-variance-authority';
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from 'react';
import { cn } from '../../lib/cn';
import { useFieldControl } from '../field/field';
import { assignRef } from '../../lib/refs';
import { controlContainerBase, controlElementBase } from '../input/control-styles';

const containerVariants = cva([controlContainerBase, 'flex-col'], {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

const elementPadding = {
  sm: 'px-2.5 py-1.5',
  md: 'px-3 py-2',
  lg: 'px-4 py-2.5',
} as const;

const countPadding = {
  sm: 'px-2.5 pb-1.5',
  md: 'px-3 pb-2',
  lg: 'px-4 pb-2.5',
} as const;

type TextareaSize = keyof typeof elementPadding;

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'rows'> {
  size?: TextareaSize;
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  /** Matnga qarab balandligi o'sadi (`minRows` .. `maxRows`) */
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  /** Belgilar soni; `maxLength` bilan "120 / 500" */
  showCount?: boolean;
  /** Ichki `<textarea>` klassi (`className` — konteynerga) */
  textareaClassName?: string;
}

/** Balandlikni `minRows`..`maxRows` oralig'ida matnga moslaydi */
function resize(el: HTMLTextAreaElement, minRows: number, maxRows?: number) {
  const style = window.getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4 || 20;
  const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
  const min = minRows * lineHeight + padding;
  const max = maxRows ? maxRows * lineHeight + padding : Infinity;

  el.style.height = 'auto';
  const next = Math.min(Math.max(el.scrollHeight, min), max);
  el.style.height = `${next}px`;
  el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
}

export function Textarea({
  size = 'md',
  invalid: invalidProp,
  autoResize = false,
  minRows = 3,
  maxRows,
  showCount = false,
  className,
  textareaClassName,
  id,
  disabled: disabledProp,
  required: requiredProp,
  readOnly = false,
  value,
  defaultValue,
  maxLength,
  onChange,
  ref,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) {
  const countId = useId();
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby':
      [ariaDescribedBy, showCount && countId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': ariaInvalid,
  });
  const { invalid, disabled } = field;

  const elRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      elRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  const controlled = value !== undefined;
  const [innerLength, setInnerLength] = useState(() =>
    defaultValue != null ? String(defaultValue).length : 0,
  );
  const length = controlled ? (value != null ? String(value).length : 0) : innerLength;

  useLayoutEffect(() => {
    if (autoResize && elRef.current) resize(elRef.current, minRows, maxRows);
  }, [autoResize, minRows, maxRows, value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!controlled) setInnerLength(e.target.value.length);
    if (autoResize) resize(e.target, minRows, maxRows);
    onChange?.(e);
  };

  return (
    <div
      data-slot="textarea"
      data-size={size}
      data-invalid={invalid ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-readonly={readOnly ? '' : undefined}
      className={cn(containerVariants({ size }), className)}
    >
      <textarea
        ref={setRefs}
        rows={minRows}
        disabled={disabled}
        required={requiredProp}
        readOnly={readOnly}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        onChange={handleChange}
        className={cn(
          controlElementBase,
          'block w-full rounded-[inherit]',
          elementPadding[size],
          autoResize ? 'resize-none overflow-hidden' : 'resize-y',
          textareaClassName,
        )}
        {...field.controlProps}
        {...props}
      />
      {showCount && (
        <div
          id={countId}
          data-slot="textarea-count"
          className={cn(
            'pointer-events-none text-right text-xs text-text-muted tabular-nums',
            countPadding[size],
            maxLength != null && length >= maxLength && 'text-danger-soft-foreground',
          )}
        >
          {maxLength != null ? `${length} / ${maxLength}` : length}
        </div>
      )}
    </div>
  );
}
