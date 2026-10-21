import {
  detectCardBrand,
  isValidCardNumber,
  parsePhone,
  type CardBrand,
  type UzOperatorCode,
} from '@akhatmirzo/core';
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '../../lib/cn';
import { assignRef } from '../../lib/refs';
import { Input, type InputProps } from '../input';
import {
  applyInput,
  cardSpec,
  createMoneySpec,
  createPatternSpec,
  deleteBackward,
  deleteForward,
  moneyToRaw,
  patternSlotCount,
  phoneSpec,
  rawToMoney,
  type MaskSpec,
} from './mask-engine';

type BaseInputProps = Omit<InputProps, 'value' | 'defaultValue' | 'type'>;

/* ---------- Ichki: niqobli boshqaruv ---------- */

interface MaskedControlProps extends BaseInputProps {
  spec: MaskSpec;
  raw: string;
  onRawChange: (raw: string) => void;
}

/** Niqobli `<Input>`: formatlaydi, kursorni toza belgilar soni bo'yicha joyida saqlaydi */
function MaskedControl({
  spec,
  raw,
  onRawChange,
  ref,
  name,
  onChange,
  onKeyDown,
  ...props
}: MaskedControlProps) {
  const display = useMemo(() => spec.format(raw), [spec, raw]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaret = useRef<number | null>(null);
  // Qiymat o'zgarmasa ham (rad etilgan belgi) kursor tiklanishi uchun qayta chizamiz
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useLayoutEffect(() => {
    const el = inputRef.current;
    const caret = pendingCaret.current;
    if (!el || caret === null) return;
    pendingCaret.current = null;
    if (el.ownerDocument.activeElement === el) el.setSelectionRange(caret, caret);
  });

  const commit = (next: string, caret: number) => {
    pendingCaret.current = caret;
    if (next !== raw) onRawChange(next);
    rerender();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const res = applyInput(spec, raw, el.value, el.selectionEnd ?? el.value.length);
    commit(res.raw, res.caret);
    onChange?.(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;
    const el = e.currentTarget;
    if (el.readOnly || el.selectionStart === null || el.selectionStart !== el.selectionEnd) return;
    const res =
      e.key === 'Backspace'
        ? deleteBackward(spec, raw, el.selectionStart)
        : deleteForward(spec, raw, el.selectionStart);
    if (!res) return;
    e.preventDefault();
    commit(res.raw, res.caret);
  };

  return (
    <>
      <Input
        ref={setRefs}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={display.text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {name && <input type="hidden" name={name} value={raw} disabled={props.disabled} />}
    </>
  );
}

/** Toza qiymatni boshqariladigan/boshqarilmaydigan holatda saqlaydi */
function useRawValue<V>(options: {
  value: V | undefined;
  defaultValue: V | undefined;
  toRaw: (value: V | undefined) => string;
  fromRaw: (raw: string) => V;
  onValueChange?: (value: V, raw: string) => void;
}): [string, (raw: string) => void] {
  const { value, defaultValue, toRaw, fromRaw, onValueChange } = options;
  const controlled = value !== undefined;
  const [inner, setInner] = useState(() => toRaw(controlled ? value : defaultValue));
  let raw = inner;
  // Tashqi qiymat ichkidan farq qilsa — tashqisi ustun ("12." va 12 bir xil hisoblanadi)
  if (controlled) {
    const target = toRaw(value);
    if (!Object.is(fromRaw(inner), fromRaw(target))) raw = target;
  }
  const setRaw = (next: string) => {
    setInner(next);
    const nextValue = fromRaw(next);
    if (!Object.is(nextValue, fromRaw(raw))) onValueChange?.(nextValue, next);
  };
  return [raw, setRaw];
}

const identity = (s: string) => s;
const toText = (v: string | undefined) => v ?? '';

/* ---------- MaskedInput ---------- */

export interface MaskedInputDetails {
  /** Ko'rinishdagi matn */
  formatted: string;
  /** Barcha o'rinlar to'ldirilganmi */
  complete: boolean;
}

export interface MaskedInputProps extends BaseInputProps {
  /** `9` — raqam, `A` — harf, `*` — istalgan belgi; qolgani — doimiy belgi. Masalan `"AA 9999999"` */
  mask: string;
  /** Toza qiymat (doimiy belgilarsiz): `"AB1234567"` */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: MaskedInputDetails) => void;
  /** Harflarni katta harfga o'tkazish */
  uppercase?: boolean;
}

/**
 * Umumiy niqobli maydon. Ichki qiymat — toza, ko'rinish — formatlangan.
 * @example <MaskedInput mask="AA 9999999" uppercase placeholder="AB 1234567" />
 */
export function MaskedInput({
  mask,
  uppercase = false,
  value,
  defaultValue,
  onValueChange,
  ...props
}: MaskedInputProps) {
  const spec = useMemo(() => createPatternSpec(mask, uppercase), [mask, uppercase]);
  const slots = useMemo(() => patternSlotCount(mask), [mask]);
  const toRaw = (v: string | undefined) => spec.conform(v ?? '', '');
  const [raw, setRaw] = useRawValue({
    value,
    defaultValue,
    toRaw,
    fromRaw: identity,
    onValueChange: (v) =>
      onValueChange?.(v, { formatted: spec.format(v).text, complete: v.length === slots }),
  });
  return <MaskedControl data-mask={mask} spec={spec} raw={raw} onRawChange={setRaw} {...props} />;
}

/* ---------- PhoneInput ---------- */

export interface PhoneInputDetails {
  /** To'liq (9 raqam) va operator kodi to'g'ri */
  valid: boolean;
  /** Operator kodi (33, 90, 99 ...) yoki noma'lum bo'lsa `null` */
  operator: UzOperatorCode | null;
  /** 9 raqam kiritilgan */
  complete: boolean;
}

export interface PhoneInputProps extends Omit<BaseInputProps, 'prefix'> {
  /** Toza qiymat — 9 raqam, `+998` siz: `"901234567"` */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: PhoneInputDetails) => void;
  /** Operator kodi noto'g'ri bo'lsa avtomatik `invalid`. Default `true` */
  validateOperator?: boolean;
}

/** Telefon raqami tafsilotlari (`parsePhone` ustida) */
export function getPhoneDetails(value: string): PhoneInputDetails {
  const parsed = parsePhone(value);
  return { valid: parsed.valid, operator: parsed.operator, complete: parsed.digits.length === 9 };
}

/**
 * O'zbekiston telefon raqami: `+998` o'chirilmaydigan prefiks, ko'rinish "(90) 123-45-67".
 * @example <PhoneInput value={phone} onValueChange={setPhone} />
 */
export function PhoneInput({
  value,
  defaultValue,
  onValueChange,
  validateOperator = true,
  invalid,
  placeholder = '(90) 123-45-67',
  ...props
}: PhoneInputProps) {
  const [raw, setRaw] = useRawValue({
    value,
    defaultValue,
    toRaw: (v) => phoneSpec.conform(parsePhone(toText(v)).digits, ''),
    fromRaw: identity,
    onValueChange: (v) => onValueChange?.(v, getPhoneDetails(v)),
  });
  const badOperator = validateOperator && raw.length >= 2 && !parsePhone(raw).operator;
  return (
    <MaskedControl
      spec={phoneSpec}
      raw={raw}
      onRawChange={setRaw}
      prefix="+998"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder={placeholder}
      invalid={invalid || badOperator}
      inputClassName="tabular-nums"
      {...props}
    />
  );
}

/* ---------- MoneyInput ---------- */

export interface MoneyInputProps extends Omit<BaseInputProps, 'min' | 'max' | 'onBlur'> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  /** Valyuta (o'ngda). Default `"so'm"`; `null` — ko'rsatilmaydi */
  currency?: ReactNode;
  /** Kasr raqamlari soni. Default `0` */
  decimals?: number;
  /** Kichik qiymat maydondan chiqqanda `min` ga tenglashtiriladi */
  min?: number;
  /** Undan katta qiymat yozib bo'lmaydi */
  max?: number;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

/**
 * Pul summasi: minglik ajratuvchi — bo'sh joy, o'ngda valyuta.
 * @example <MoneyInput value={sum} onValueChange={setSum} />
 */
export function MoneyInput({
  value,
  defaultValue,
  onValueChange,
  currency = "so'm",
  decimals = 0,
  min,
  max,
  onBlur,
  placeholder = '0',
  inputClassName,
  ...props
}: MoneyInputProps) {
  const spec = useMemo(() => createMoneySpec(decimals, max), [decimals, max]);
  const [raw, setRaw] = useRawValue<number | null>({
    value,
    defaultValue,
    toRaw: (v) => moneyToRaw(v, decimals),
    fromRaw: rawToMoney,
    onValueChange: (v) => onValueChange?.(v),
  });

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    let next = raw.endsWith('.') ? raw.slice(0, -1) : raw;
    const n = rawToMoney(next);
    if (n !== null && min !== undefined && n < min) next = moneyToRaw(min, decimals);
    if (next !== raw) setRaw(next);
    onBlur?.(e);
  };

  return (
    <MaskedControl
      spec={spec}
      raw={raw}
      onRawChange={setRaw}
      inputMode={decimals > 0 ? 'decimal' : 'numeric'}
      placeholder={placeholder}
      rightIcon={currency ?? undefined}
      inputClassName={cn('tabular-nums', inputClassName)}
      onBlur={handleBlur}
      {...props}
    />
  );
}

/* ---------- CardInput ---------- */

export interface CardInputDetails {
  brand: CardBrand | null;
  /** 16 raqam kiritilgan */
  complete: boolean;
  /** 16 raqam va Luhn tekshiruvi o'tdi */
  valid: boolean;
}

export interface CardInputProps extends BaseInputProps {
  /** Toza qiymat — 16 raqam: `"8600123412341234"` */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, details: CardInputDetails) => void;
  /** To'liq kiritilganda Luhn xato bo'lsa avtomatik `invalid`. Default `true` */
  validateLuhn?: boolean;
  /** Brend belgisini o'zingiz chizish (masalan rasmiy logo) */
  renderBrand?: (brand: CardBrand) => ReactNode;
}

const BRAND_LABELS: Record<CardBrand, string> = {
  uzcard: 'UZCARD',
  humo: 'HUMO',
  visa: 'VISA',
  mastercard: 'MC',
};

/** Karta tafsilotlari (`detectCardBrand`, `isValidCardNumber` ustida) */
export function getCardDetails(value: string): CardInputDetails {
  return {
    brand: detectCardBrand(value),
    complete: value.length === 16,
    valid: isValidCardNumber(value),
  };
}

/**
 * Brend belgisi — rasmiy logolar o'rniga neytral matnli belgi (faqat semantik tokenlar,
 * dark mode'da ham o'qiladi). Rasmiy logo kerak bo'lsa — `renderBrand`.
 */
export function CardBrandMark({ brand, className }: { brand: CardBrand; className?: string }) {
  return (
    <span
      data-brand={brand}
      className={cn(
        'inline-flex h-5 items-center rounded-sm border border-border bg-surface-muted px-1.5',
        'font-sans text-[10px] leading-none font-bold tracking-wide text-text-subtle',
        brand === 'visa' && 'italic',
        className,
      )}
    >
      {BRAND_LABELS[brand]}
    </span>
  );
}

function CardIcon() {
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
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18M7 15h.01M11 15h2" />
    </svg>
  );
}

/**
 * Bank karta raqami: 4 tadan guruh, o'ngda brend (Uzcard, Humo, Visa, Mastercard), Luhn.
 * @example <CardInput value={card} onValueChange={setCard} />
 */
export function CardInput({
  value,
  defaultValue,
  onValueChange,
  validateLuhn = true,
  renderBrand,
  invalid,
  leftIcon,
  placeholder = '0000 0000 0000 0000',
  inputClassName,
  ...props
}: CardInputProps) {
  const [raw, setRaw] = useRawValue({
    value,
    defaultValue,
    toRaw: (v) => cardSpec.conform(toText(v), ''),
    fromRaw: identity,
    onValueChange: (v) => onValueChange?.(v, getCardDetails(v)),
  });
  const { brand, complete, valid } = getCardDetails(raw);
  return (
    <MaskedControl
      spec={cardSpec}
      raw={raw}
      onRawChange={setRaw}
      inputMode="numeric"
      autoComplete="cc-number"
      placeholder={placeholder}
      leftIcon={leftIcon ?? <CardIcon />}
      rightIcon={brand ? (renderBrand?.(brand) ?? <CardBrandMark brand={brand} />) : undefined}
      invalid={invalid || (validateLuhn && complete && !valid)}
      inputClassName={cn('tabular-nums', inputClassName)}
      data-brand={brand ?? undefined}
      {...props}
    />
  );
}
