import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  useController,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type UseControllerProps,
} from 'react-hook-form';
import { Field, useFieldControl, type FieldProps } from '../components/field';
import {
  resolveFormAdapter,
  type FormAdapterName,
  type FormFieldAdapter,
  type FormFieldBinding,
} from './adapters';

export interface UseFormFieldResult<TValue = unknown> {
  /** Maydon nomi (`name`) */
  name: string;
  value: TValue;
  onValueChange: (value: TValue) => void;
  /** Maydon "tegilgan" deb belgilanadi (`mode: 'onBlur' | 'onTouched'` uchun) */
  onBlur: () => void;
  invalid: boolean;
  /** Xato matni (`fieldState.error.message`) */
  error: string | undefined;
  /** Boshqaruv elementi id'si — `Field` label'i shunga ulangan */
  id: string;
  disabled: boolean;
}

export interface FormFieldRenderProps<TValue = unknown> extends UseFormFieldResult<TValue> {
  /** Native elementga yoyiladigan `id` / `aria-describedby` / `aria-invalid` / `aria-required` */
  controlProps: ReturnType<typeof useFieldControl>['controlProps'];
}

const FormFieldContext = createContext<UseFormFieldResult | null>(null);

/**
 * `FormField` ichidagi maxsus komponentni forma maydoniga ulaydi.
 * @example
 * function Stars() {
 *   const { value, onValueChange, invalid } = useFormField<number>();
 *   ...
 * }
 */
export function useFormField<TValue = unknown>(): UseFormFieldResult<TValue> {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error('useFormField() faqat <FormField> ichida ishlaydi');
  return ctx as UseFormFieldResult<TValue>;
}

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> extends Omit<FieldProps, 'children' | 'error'> {
  name: TName;
  /** Berilmasa — eng yaqin `<Form>` (FormProvider) dan olinadi */
  control?: UseControllerProps<TFieldValues, TName, TTransformedValues>['control'];
  rules?: UseControllerProps<TFieldValues, TName>['rules'];
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  shouldUnregister?: boolean;
  /**
   * Bolaga qiymat qanday uzatiladi. Standart — avtomatik: kutubxona komponentlari jadval
   * bo'yicha, native elementlar (`<input>`, `<select>`) — `onChange`, boshqa komponentlar —
   * `value` + `onValueChange`. Nom (`'native' | 'value' | 'checked' | 'none'`) yoki
   * `createFormAdapter(...)` natijasi.
   */
  adapter?: FormFieldAdapter | FormAdapterName;
  /** Bitta boshqaruv elementi — unga `value` va o'zgarish callback'i avtomatik uzatiladi */
  children?: ReactElement;
  /** Zaxira yo'l: elementni o'zingiz chizasiz (`children` o'rniga) */
  render?: (field: FormFieldRenderProps<FieldPathValue<TFieldValues, TName>>) => ReactNode;
}

/** Xato obyektidan birinchi matn (massiv elementlari xatosi ham) */
function firstMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const { message } = error as { message?: unknown };
  if (typeof message === 'string' && message) return message;
  for (const value of Object.values(error)) {
    if (value && typeof value === 'object' && !(value instanceof Element)) {
      const nested = firstMessage(value);
      if (nested) return nested;
    }
  }
  return undefined;
}

/** Konteyner ichidagi asosiy boshqaruv elementini fokuslaydi */
function focusControl(container: HTMLElement, id: string) {
  const own = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (own && container.contains(own) && own.tabIndex >= 0) {
    own.focus();
    return;
  }
  const candidates = container.querySelectorAll<HTMLElement>(
    'input:not([type="hidden"]), textarea, select, button, [tabindex], [contenteditable="true"]',
  );
  for (const el of candidates) {
    if (el.tabIndex < 0 || (el as HTMLInputElement).disabled) continue;
    if (el.closest('[hidden], [aria-hidden="true"], [inert]')) continue;
    el.focus();
    return;
  }
}

/** Ikki handler'ni birlashtiradi: avval bolaniki, keyin formaniki */
function mergeHandlers(own: Record<string, unknown>, injected: Record<string, unknown>) {
  const merged: Record<string, unknown> = { ...injected };
  for (const [key, fn] of Object.entries(injected)) {
    const ownFn = own[key];
    if (/^on[A-Z]/.test(key) && typeof fn === 'function' && typeof ownFn === 'function') {
      merged[key] = (...args: unknown[]) => {
        (ownFn as (...a: unknown[]) => unknown)(...args);
        return (fn as (...a: unknown[]) => unknown)(...args);
      };
    }
  }
  return merged;
}

interface FormControlProps {
  binding: FormFieldBinding;
  onBlur: () => void;
  registerRef: (instance: { focus: () => void }) => void;
  invalid: boolean;
  error: string | undefined;
  adapter?: FormFieldAdapter | FormAdapterName;
  child?: ReactElement;
  render?: (field: FormFieldRenderProps<unknown>) => ReactNode;
}

/** `Field` ichida: id'ni oladi, bolaga prop'larni uzatadi, fokus va blur'ni boshqaradi */
function FormControl({
  binding,
  onBlur,
  registerRef,
  invalid,
  error,
  adapter: adapterProp,
  child,
  render,
}: FormControlProps) {
  const { id, controlProps } = useFieldControl();
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const element = !render && isValidElement<Record<string, unknown>>(child) ? child : null;
  const adapter = element
    ? resolveFormAdapter(element.type as ElementType, element.props, adapterProp)
    : null;

  // Boshqarilmaydigan bola (FileUpload): oxirgi o'zi bergan qiymatdan farqli qiymat kelsa
  // (reset / setValue) — `key` bilan qayta yaratiladi
  const [sync, setSync] = useState({ value: binding.value, key: 0 });
  if (adapter?.uncontrolled && !sameValue(sync.value, binding.value)) {
    setSync({ value: binding.value, key: sync.key + 1 });
  }

  const { value, name, disabled } = binding;
  const onValueChange = binding.onValueChange;
  const ctx: UseFormFieldResult = {
    name,
    value,
    onValueChange,
    onBlur,
    invalid,
    error,
    id,
    disabled,
  };

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) registerRef({ focus: () => focusControl(node, id) });
    },
    [registerRef, id],
  );

  let content: ReactNode;
  if (render) {
    content = render({ ...ctx, controlProps } as FormFieldRenderProps<unknown>);
  } else if (element && adapter) {
    const childProps = element.props;
    const injected = adapter(
      adapter.uncontrolled
        ? {
            ...binding,
            onValueChange: (next) => {
              setSync((s) => ({ ...s, value: next }));
              onValueChange(next);
            },
          }
        : binding,
      childProps,
    );
    const extra =
      typeof element.type === 'string' ? { ...controlProps, ...pick(childProps, 'id') } : {};
    content = cloneElement(element, {
      ...extra,
      ...mergeHandlers(childProps, injected),
      ...(adapter.uncontrolled ? { key: sync.key } : null),
    });
  } else {
    content = child ?? null;
  }

  return (
    <FormFieldContext.Provider value={ctx}>
      <div
        ref={containerRef}
        data-slot="form-control"
        className="contents"
        onFocus={() => clearTimeout(blurTimer.current)}
        onBlur={(e: FocusEvent<HTMLDivElement>) => {
          if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
          // Fokus portal'ga (Select ro'yxati, Popover) o'tsa React onFocus shu yerga yetadi va
          // taymerni bekor qiladi — maydon faqat haqiqatan tark etilganda "tegilgan" bo'ladi
          clearTimeout(blurTimer.current);
          blurTimer.current = setTimeout(onBlur, 0);
        }}
      >
        {content}
      </div>
    </FormFieldContext.Provider>
  );
}

/**
 * Tuzilmaviy tenglik: react-hook-form qiymatni nusxalab saqlaydi (oddiy obyekt va massivlar),
 * shuning uchun o'zimiz bergan qiymat ham boshqa havola bo'lib qaytadi. `File`, `Date` va
 * boshqa sinf nusxalari havola bo'yicha solishtiriladi.
 */
function sameValue(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => sameValue(item, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((key) => sameValue(a[key], b[key]));
  }
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function pick(props: Record<string, unknown>, key: string): Record<string, unknown> {
  return props[key] !== undefined ? { [key]: props[key] } : {};
}

/**
 * `Controller` + `Field`: label, izoh va xato matni avtomatik; bolaga qiymat va o'zgarish
 * callback'i uzatiladi (native `onChange` ham, `onValueChange` ham). Xato bo'lsa
 * `setFocus` / submit asosiy boshqaruv elementini fokuslaydi.
 * @example
 * <FormField name="phone" label="Telefon" description="SMS kod yuboriladi">
 *   <PhoneInput />
 * </FormField>
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  adapter,
  children,
  render,
  disabled: disabledProp,
  ...fieldProps
}: FormFieldProps<TFieldValues, TName, TTransformedValues>) {
  const { field, fieldState } = useController<TFieldValues, TName, TTransformedValues>({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  });
  const error = fieldState.invalid ? firstMessage(fieldState.error) : undefined;
  const disabled = Boolean(disabledProp) || Boolean(field.disabled);

  const binding: FormFieldBinding = {
    name: field.name,
    value: field.value,
    onValueChange: field.onChange,
    disabled,
  };

  return (
    <Field
      {...fieldProps}
      disabled={disabled}
      error={error ?? (fieldState.invalid ? true : undefined)}
    >
      <FormControl
        binding={binding}
        onBlur={field.onBlur}
        registerRef={field.ref}
        invalid={fieldState.invalid}
        error={error}
        adapter={adapter}
        child={children}
        render={render as FormControlProps['render']}
      />
    </Field>
  );
}
