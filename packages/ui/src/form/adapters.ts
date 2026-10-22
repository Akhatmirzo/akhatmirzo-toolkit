import type { ChangeEvent, ElementType } from 'react';
import { Checkbox } from '../components/checkbox';
import { ColorPicker } from '../components/color-picker';
import { Combobox } from '../components/combobox';
import { DatePicker, DateRangePicker } from '../components/date-picker';
import {
  BankAccountInput,
  CarPlateInput,
  InnInput,
  PassportInput,
  PinflInput,
} from '../components/document-inputs';
import { FileUpload } from '../components/file-upload';
import { Input } from '../components/input';
import { CardInput, MaskedInput, MoneyInput, PhoneInput } from '../components/masked-input';
import { OtpInput } from '../components/otp-input';
import { RadioGroup } from '../components/radio-group';
import { Rating } from '../components/rating';
import { RegionSelect } from '../components/region-select';
import { SegmentedControl } from '../components/segmented-control';
import { Select } from '../components/select';
import { Slider } from '../components/slider';
import { Switch } from '../components/switch';
import { TagInput } from '../components/tag-input';
import { Textarea } from '../components/textarea';

/** Forma maydonining bolaga uzatiladigan holati */
export interface FormFieldBinding {
  name: string;
  /** Formadagi joriy qiymat */
  value: unknown;
  /** Formadagi qiymatni yangilaydi */
  onValueChange: (value: unknown) => void;
  disabled: boolean;
}

/**
 * Adapter — forma qiymatini bola komponentning prop'lariga aylantiradi.
 * `childProps` — bolaning o'z prop'lari (masalan Combobox'da `multiple`).
 * Qaytgan `on*` funksiyalar bolaning o'z handler'lari bilan birlashtiriladi (avval bolaniki).
 */
export interface FormFieldAdapter {
  (binding: FormFieldBinding, childProps: Record<string, unknown>): Record<string, unknown>;
  /**
   * Komponent boshqarilmaydi (`value` prop'i yo'q, masalan FileUpload): forma qiymati tashqaridan
   * o'zgarsa (`reset`, `setValue`) komponent qayta yaratiladi.
   */
  uncontrolled?: boolean;
}

export interface CreateFormAdapterOptions {
  /** Qiymat prop'i. Default `'value'`; `null` — qiymat uzatilmaydi (boshqarilmaydigan komponent) */
  valueProp?: string | null;
  /** O'zgarish callback'i. Default `'onValueChange'` */
  changeProp?: string;
  /** Forma qiymati `null` / `undefined` bo'lganda bolaga beriladigan bo'sh qiymat */
  empty?: unknown | ((childProps: Record<string, unknown>) => unknown);
  /** Callback argumentlaridan forma qiymatini oladi. Default — birinchi argument */
  getValue?: (...args: never[]) => unknown;
  /** Forma qiymatini bola prop'iga aylantiradi (bo'sh qiymat almashtirilgandan keyin) */
  toProp?: (value: unknown) => unknown;
  /** `name` ni ham uzatish (native forma yuborish uchun). Default `false` */
  name?: boolean;
  /** `disabled` ni uzatish. Default `false` — kutubxona komponentlari uni `Field` dan oladi */
  disabled?: boolean;
}

/**
 * O'z komponentingiz uchun adapter yasaydi.
 * @example
 * const adapter = createFormAdapter({ valueProp: 'selected', changeProp: 'onSelect', empty: [] });
 * <FormField name="ids" adapter={adapter}><MyPicker /></FormField>
 */
export function createFormAdapter(options: CreateFormAdapterOptions = {}): FormFieldAdapter {
  const {
    valueProp = 'value',
    changeProp = 'onValueChange',
    empty,
    getValue,
    toProp,
    name = false,
    disabled = false,
  } = options;
  const adapter: FormFieldAdapter = (binding, childProps) => {
    const props: Record<string, unknown> = {
      [changeProp]: (...args: unknown[]) =>
        binding.onValueChange(
          getValue ? (getValue as (...a: unknown[]) => unknown)(...args) : args[0],
        ),
    };
    if (valueProp !== null) {
      let value = binding.value;
      if (value == null && empty !== undefined) {
        value =
          typeof empty === 'function'
            ? (empty as (p: typeof childProps) => unknown)(childProps)
            : empty;
      }
      props[valueProp] = toProp ? toProp(value) : value;
    }
    if (name) props.name = binding.name;
    if (disabled && binding.disabled) props.disabled = true;
    return props;
  };
  adapter.uncontrolled = valueProp === null;
  return adapter;
}

const eventValue = (e: ChangeEvent<HTMLInputElement>) => e.target.value;
const eventChecked = (e: ChangeEvent<HTMLInputElement>) => e.target.checked;

/** Tayyor adapterlar — `FormField adapter="..."` bilan nomi orqali tanlanadi */
export const formAdapters = {
  /** Native `onChange(event)` + `value` (Input, Textarea, `<input>`, `<select>`) */
  native: createFormAdapter({
    changeProp: 'onChange',
    getValue: eventValue,
    empty: '',
    name: true,
    disabled: true,
  }),
  /** Native checkbox: `checked` + `onChange(event)` */
  nativeChecked: createFormAdapter({
    valueProp: 'checked',
    changeProp: 'onChange',
    getValue: eventChecked,
    empty: false,
    name: true,
    disabled: true,
  }),
  /** Kutubxona konvensiyasi: `value` + `onValueChange(value)` */
  value: createFormAdapter(),
  /** `checked` + `onCheckedChange(checked)` (Checkbox, Switch) */
  checked: createFormAdapter({ valueProp: 'checked', changeProp: 'onCheckedChange', empty: false }),
  /** Hech narsa uzatilmaydi — bola `useFormField()` bilan o'zi ulanadi */
  none: Object.assign((() => ({})) as FormFieldAdapter, { uncontrolled: false }),
} satisfies Record<string, FormFieldAdapter>;

export type FormAdapterName = keyof typeof formAdapters;

const stringValue = createFormAdapter({ empty: '' });
const stringValueWithName = createFormAdapter({ empty: '', name: true });

/** Kutubxona komponentlari uchun moslik jadvali (komponent → adapter) */
export const builtinFormAdapters: ReadonlyMap<ElementType, FormFieldAdapter> = new Map<
  ElementType,
  FormFieldAdapter
>([
  [Input, formAdapters.native],
  [Textarea, formAdapters.native],
  [Checkbox, formAdapters.checked],
  [Switch, formAdapters.checked],
  [RadioGroup, stringValueWithName],
  [Select, stringValueWithName],
  [RegionSelect, stringValueWithName],
  [SegmentedControl, stringValue],
  [
    Slider,
    createFormAdapter({
      empty: (p: Record<string, unknown>) => [typeof p.min === 'number' ? p.min : 0],
    }),
  ],
  [Rating, createFormAdapter({ empty: 0 })],
  [
    Combobox,
    createFormAdapter({ empty: (p: Record<string, unknown>) => (p.multiple ? [] : null) }),
  ],
  [DatePicker, createFormAdapter({ empty: null })],
  [DateRangePicker, createFormAdapter({ empty: null })],
  [MaskedInput, stringValue],
  [PhoneInput, stringValue],
  [CardInput, stringValue],
  // MoneyInput qiymati — son; bo'sh satr ham `null` deb olinadi
  [MoneyInput, createFormAdapter({ empty: null, toProp: (v) => (v === '' ? null : v) })],
  [PinflInput, stringValue],
  [PassportInput, stringValue],
  [InnInput, stringValue],
  [BankAccountInput, stringValue],
  [CarPlateInput, stringValue],
  [OtpInput, stringValue],
  [TagInput, createFormAdapter({ empty: [] })],
  [ColorPicker, stringValue],
  [FileUpload, createFormAdapter({ valueProp: null, changeProp: 'onFilesChange' })],
]);

/** Bola uchun adapter: aniq berilgan → jadvaldagi → native element → `value` konvensiyasi */
export function resolveFormAdapter(
  type: ElementType,
  childProps: Record<string, unknown>,
  adapter?: FormFieldAdapter | FormAdapterName,
): FormFieldAdapter {
  if (typeof adapter === 'function') return adapter;
  if (adapter) return formAdapters[adapter];
  const builtin = builtinFormAdapters.get(type);
  if (builtin) return builtin;
  if (typeof type === 'string') {
    const inputType = childProps.type;
    return type === 'input' && inputType === 'checkbox'
      ? formAdapters.nativeChecked
      : formAdapters.native;
  }
  return formAdapters.value;
}
