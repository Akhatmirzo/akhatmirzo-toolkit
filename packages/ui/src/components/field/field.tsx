import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';

interface FieldContextValue {
  controlId: string;
  labelId?: string;
  descriptionId?: string;
  errorId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  setCustomId: (id: string | undefined) => void;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldControlOptions {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
}

export interface FieldControlResult {
  id: string;
  /** Field label'ining id'si — `htmlFor` ishlamaydigan boshqaruvlar (radiogroup) uchun `aria-labelledby` */
  labelId?: string;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  /** Boshqaruv elementiga to'g'ridan-to'g'ri yoyiladigan atributlar */
  controlProps: {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: true;
    'aria-required'?: true;
  };
}

/**
 * Boshqaruv elementini (Input, Textarea, ...) o'rab turgan Field bilan bog'laydi:
 * id, aria-describedby, aria-invalid, aria-required. Field tashqarisida ham ishlaydi.
 */
export function useFieldControl(options: FieldControlOptions = {}): FieldControlResult {
  const field = useContext(FieldContext);
  const fallbackId = useId();
  const ownId = options.id;
  const setCustomId = field?.setCustomId;

  // Bolaga o'z id'si berilgan bo'lsa — label shunga ulanadi
  useLayoutEffect(() => {
    if (!setCustomId || !ownId) return;
    setCustomId(ownId);
    return () => setCustomId(undefined);
  }, [setCustomId, ownId]);

  const id = ownId ?? field?.controlId ?? fallbackId;
  const ariaInvalid = options['aria-invalid'];
  const invalid =
    Boolean(options.invalid) ||
    ariaInvalid === true ||
    ariaInvalid === 'true' ||
    Boolean(field?.invalid);
  const required = Boolean(options.required) || Boolean(field?.required);
  const disabled = Boolean(options.disabled) || Boolean(field?.disabled);

  const describedBy =
    [field?.descriptionId, field?.errorId, options['aria-describedby']].filter(Boolean).join(' ') ||
    undefined;

  return {
    id,
    labelId: field?.labelId,
    invalid,
    required,
    disabled,
    controlProps: {
      id,
      'aria-describedby': describedBy,
      'aria-invalid': invalid ? true : undefined,
      'aria-required': required ? true : undefined,
    },
  };
}

export interface FieldProps extends Omit<ComponentProps<'div'>, 'children'> {
  label?: ReactNode;
  /** Label ostidagi yordamchi matn */
  description?: ReactNode;
  /** Bo'lsa — boshqaruv elementi `invalid` bo'ladi */
  error?: ReactNode;
  /** Label yonida `*`, bolaga `aria-required` */
  required?: boolean;
  /** Bolani ham o'chiradi */
  disabled?: boolean;
  orientation?: 'vertical' | 'horizontal';
  children: ReactNode;
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3.5 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function Field({
  label,
  description,
  error,
  required = false,
  disabled = false,
  orientation = 'vertical',
  className,
  children,
  ...props
}: FieldProps) {
  const baseId = useId();
  const [customId, setCustomId] = useState<string | undefined>();
  const hasDescription = description != null && description !== false;
  const hasError = error != null && error !== false && error !== '';

  const controlId = customId ?? `${baseId}-control`;
  const labelId = label != null ? `${baseId}-label` : undefined;
  const descriptionId = hasDescription ? `${baseId}-description` : undefined;
  const errorId = hasError ? `${baseId}-error` : undefined;

  const ctx = useMemo<FieldContextValue>(
    () => ({
      controlId,
      labelId,
      descriptionId,
      errorId,
      invalid: hasError,
      required,
      disabled,
      setCustomId,
    }),
    [controlId, labelId, descriptionId, errorId, hasError, required, disabled],
  );

  const horizontal = orientation === 'horizontal';

  const head = (label != null || hasDescription) && (
    <div className={cn('flex flex-col gap-1', horizontal && 'w-40 shrink-0 pt-2.5')}>
      {label != null && (
        <label
          id={labelId}
          htmlFor={controlId}
          className={cn(
            'text-sm font-medium text-text',
            disabled && 'cursor-not-allowed text-text-faint',
          )}
        >
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>
      )}
      {hasDescription && (
        <p id={descriptionId} className="text-xs text-text-muted">
          {description}
        </p>
      )}
    </div>
  );

  return (
    <FieldContext.Provider value={ctx}>
      <div
        data-slot="field"
        data-orientation={orientation}
        data-invalid={hasError ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        className={cn(
          'flex bg-transparent font-sans text-text',
          horizontal ? 'flex-row items-start gap-4' : 'flex-col gap-1.5',
          className,
        )}
        {...props}
      >
        {head}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {children}
          {/* Live region doim DOM'da — birinchi xato ham o'qiladi; -mt bo'sh holatdagi gap'ni yopadi */}
          <div data-slot="field-error" aria-live="polite" className="-mt-1.5">
            {hasError && (
              <p
                id={errorId}
                className="mt-1.5 flex items-center gap-1 text-xs text-danger-soft-foreground"
              >
                <AlertIcon />
                <span>{error}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </FieldContext.Provider>
  );
}
