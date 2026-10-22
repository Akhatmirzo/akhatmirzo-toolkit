import {
  isValidBankAccount,
  isValidInn,
  isValidPassport,
  parseCarPlate,
  parsePinfl,
  regionByPlateCode,
  type CarPlateType,
  type UzRegion,
} from '@akhatmirzo/core';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { MaskedControl, useRawValue, type BaseInputProps } from '../masked-input/masked-input';
import type { MaskSpec } from '../masked-input/mask-engine';
import {
  bankAccountSpec,
  carPlateSpec,
  innSpec,
  passportSpec,
  pinflSpec,
  plateKind,
} from './specs';

const toText = (v: string | undefined) => v ?? '';
const identity = (s: string) => s;

/** Toza qiymat (`spec.conform`) bilan ishlaydigan umumiy holat */
function useDocumentValue<D>(
  spec: MaskSpec,
  value: string | undefined,
  defaultValue: string | undefined,
  getDetails: (raw: string) => D,
  onValueChange: ((value: string, details: D) => void) | undefined,
  onChanged?: (raw: string, details: D) => void,
) {
  return useRawValue({
    value,
    defaultValue,
    toRaw: (v) => spec.conform(toText(v), ''),
    fromRaw: identity,
    onValueChange: (v) => {
      const details = getDetails(v);
      onValueChange?.(v, details);
      onChanged?.(v, details);
    },
  });
}

/** Barcha hujjat inputlarining umumiy tafsilotlari */
export interface DocumentInputDetails {
  /** Barcha o'rinlar to'ldirilgan */
  complete: boolean;
  /** To'liq va tekshiruvdan o'tgan (`isValidX`) */
  valid: boolean;
}

interface DocumentInputBaseProps extends BaseInputProps {
  /** Toza qiymat — bo'shliqsiz */
  value?: string;
  defaultValue?: string;
  /** To'liq kiritilganda tekshiruvdan o'tmasa avtomatik `invalid`. Default `true` */
  validate?: boolean;
}

/* ---------- PinflInput ---------- */

export interface PinflInputDetails extends DocumentInputDetails {
  /** Jinsi (to'g'ri JShShIR bo'lsa), aks holda `null` */
  gender: 'male' | 'female' | null;
  /** Tug'ilgan sana (to'g'ri JShShIR bo'lsa), aks holda `null` */
  birthDate: Date | null;
}

export interface PinflInputProps extends DocumentInputBaseProps {
  onValueChange?: (value: string, details: PinflInputDetails) => void;
  /** 14 raqam kiritilganda chaqiriladi: `{ valid, gender, birthDate, complete }` */
  onDetails?: (details: PinflInputDetails) => void;
  /** Nazorat raqamini ham tekshirish (`isValidPinfl` ning `checksum` opsiyasi). Default `false` */
  checksum?: boolean;
}

/** JShShIR tafsilotlari (`parsePinfl` ustida) */
export function getPinflDetails(value: string, options: { checksum?: boolean } = {}) {
  const info = parsePinfl(value, options);
  return {
    complete: value.length === 14,
    valid: info !== null,
    gender: info?.gender ?? null,
    birthDate: info?.birthDate ?? null,
  } satisfies PinflInputDetails;
}

/**
 * JShShIR (PINFL) — 14 raqam, ko'rinish `00000 00000 0000`. To'liq kiritilganda jinsi va
 * tug'ilgan sanasi `onDetails` orqali beriladi.
 * @example <PinflInput value={pinfl} onValueChange={setPinfl} onDetails={(d) => setGender(d.gender)} />
 */
export function PinflInput({
  value,
  defaultValue,
  onValueChange,
  onDetails,
  checksum = false,
  validate = true,
  invalid,
  placeholder = '00000 00000 0000',
  inputClassName,
  ...props
}: PinflInputProps) {
  const details = (raw: string) => getPinflDetails(raw, { checksum });
  const [raw, setRaw] = useDocumentValue(
    pinflSpec,
    value,
    defaultValue,
    details,
    onValueChange,
    (_, d) => {
      if (d.complete) onDetails?.(d);
    },
  );
  const { complete, valid } = details(raw);
  return (
    <MaskedControl
      spec={pinflSpec}
      raw={raw}
      onRawChange={setRaw}
      inputMode="numeric"
      placeholder={placeholder}
      invalid={invalid || (validate && complete && !valid)}
      inputClassName={cn('tabular-nums', inputClassName)}
      {...props}
    />
  );
}

/* ---------- PassportInput ---------- */

export interface PassportInputProps extends DocumentInputBaseProps {
  onValueChange?: (value: string, details: DocumentInputDetails) => void;
}

/**
 * Pasport yoki ID karta seriya-raqami: `AA 1234567`. Harflar avtomatik katta, faqat lotin;
 * qiymat — `"AA1234567"`.
 * @example <PassportInput value={passport} onValueChange={setPassport} />
 */
export function PassportInput({
  value,
  defaultValue,
  onValueChange,
  validate = true,
  invalid,
  placeholder = 'AA 1234567',
  inputClassName,
  ...props
}: PassportInputProps) {
  const details = (raw: string): DocumentInputDetails => ({
    complete: raw.length === 9,
    valid: isValidPassport(raw),
  });
  const [raw, setRaw] = useDocumentValue(passportSpec, value, defaultValue, details, onValueChange);
  const { complete, valid } = details(raw);
  return (
    <MaskedControl
      spec={passportSpec}
      raw={raw}
      onRawChange={setRaw}
      autoCapitalize="characters"
      autoCorrect="off"
      spellCheck={false}
      placeholder={placeholder}
      invalid={invalid || (validate && complete && !valid)}
      inputClassName={cn('uppercase tabular-nums placeholder:normal-case', inputClassName)}
      {...props}
    />
  );
}

/* ---------- InnInput ---------- */

export interface InnInputProps extends DocumentInputBaseProps {
  onValueChange?: (value: string, details: DocumentInputDetails) => void;
}

/**
 * STIR (INN) — 9 raqam, ko'rinish `000 000 000`. `0` bilan boshlansa darhol `invalid`.
 * @example <InnInput value={inn} onValueChange={setInn} />
 */
export function InnInput({
  value,
  defaultValue,
  onValueChange,
  validate = true,
  invalid,
  placeholder = '000 000 000',
  inputClassName,
  ...props
}: InnInputProps) {
  const details = (raw: string): DocumentInputDetails => ({
    complete: raw.length === 9,
    valid: isValidInn(raw),
  });
  const [raw, setRaw] = useDocumentValue(innSpec, value, defaultValue, details, onValueChange);
  const { complete, valid } = details(raw);
  const bad = raw.startsWith('0') || (complete && !valid);
  return (
    <MaskedControl
      spec={innSpec}
      raw={raw}
      onRawChange={setRaw}
      inputMode="numeric"
      placeholder={placeholder}
      invalid={invalid || (validate && bad)}
      inputClassName={cn('tabular-nums', inputClassName)}
      {...props}
    />
  );
}

/* ---------- BankAccountInput ---------- */

export interface BankAccountInputProps extends DocumentInputBaseProps {
  onValueChange?: (value: string, details: DocumentInputDetails) => void;
}

/**
 * Bank hisob raqami — 20 raqam, ko'rinish `0000 0000 0000 0000 0000`.
 * @example <BankAccountInput value={account} onValueChange={setAccount} />
 */
export function BankAccountInput({
  value,
  defaultValue,
  onValueChange,
  validate = true,
  invalid,
  placeholder = '0000 0000 0000 0000 0000',
  inputClassName,
  ...props
}: BankAccountInputProps) {
  const details = (raw: string): DocumentInputDetails => ({
    complete: raw.length === 20,
    valid: isValidBankAccount(raw),
  });
  const [raw, setRaw] = useDocumentValue(
    bankAccountSpec,
    value,
    defaultValue,
    details,
    onValueChange,
  );
  const { complete, valid } = details(raw);
  return (
    <MaskedControl
      spec={bankAccountSpec}
      raw={raw}
      onRawChange={setRaw}
      inputMode="numeric"
      placeholder={placeholder}
      invalid={invalid || (validate && complete && !valid)}
      inputClassName={cn('tabular-nums', inputClassName)}
      {...props}
    />
  );
}

/* ---------- CarPlateInput ---------- */

export interface CarPlateInputDetails extends DocumentInputDetails {
  /** Hudud — kod (birinchi 2 raqam) `UZ_REGIONS` da bo'lsa, aks holda `null` */
  region: UzRegion | null;
  /** `personal` — `01 A 123 BC`, `legal` — `01 123 ABC`; 3-belgi kiritilguncha `null` */
  type: CarPlateType | null;
}

export interface CarPlateInputProps extends Omit<DocumentInputBaseProps, 'prefix' | 'leftIcon'> {
  onValueChange?: (value: string, details: CarPlateInputDetails) => void;
  /** Har o'zgarishda: `{ region, type, complete, valid }` — yozish paytida ham */
  onDetails?: (details: CarPlateInputDetails) => void;
}

/** Avtomobil raqami tafsilotlari (`parseCarPlate`, `regionByPlateCode` ustida) */
export function getCarPlateDetails(value: string): CarPlateInputDetails {
  const parsed = parseCarPlate(value);
  return {
    complete: value.length === 8,
    valid: parsed !== null,
    region: parsed?.region ?? (value.length >= 2 ? regionByPlateCode(value.slice(0, 2)) : null),
    type: parsed?.type ?? plateKind(value),
  };
}

const plateDivider = cva(
  'pointer-events-none absolute w-px bg-border-strong font-mono font-semibold',
  {
    variants: {
      // ichki chap chegara (1px) + padding + hudud kodidan keyingi 3ch (ikki bo'shliq o'rtasi)
      size: {
        sm: 'left-[calc(1px+0.625rem+3ch)] inset-y-1.5 text-sm',
        md: 'left-[calc(1px+0.75rem+3ch)] inset-y-2 text-sm',
        lg: 'left-[calc(1px+1rem+3ch)] inset-y-2.5 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

/** O'ngdagi bayroqqa o'xshash belgi (faqat tokenlar) va "UZ" */
function PlateMark() {
  return (
    <span data-slot="car-plate-mark" className="flex flex-col items-center gap-0.5">
      <span className="flex h-2.5 w-3.5 flex-col overflow-hidden rounded-[2px] border border-border">
        <span className="flex-1 bg-info" />
        <span className="flex-1 bg-surface" />
        <span className="flex-1 bg-success" />
      </span>
      <span className="font-sans text-[9px] leading-none font-bold text-text-muted">UZ</span>
    </span>
  );
}

/**
 * Avtomobil davlat raqami. Jismoniy (`01 A 123 BC`) yoki yuridik (`01 123 ABC`) format 3-belgidan
 * avtomatik aniqlanadi; chapda hudud kodi ajratuvchi chiziq bilan — haqiqiy raqamdagidek.
 * Hudud kodi ro'yxatda bo'lmasa — darhol `invalid`. Qiymat — `"01A123BC"`.
 * @example <CarPlateInput value={plate} onValueChange={setPlate} onDetails={(d) => setRegion(d.region)} />
 */
export function CarPlateInput({
  value,
  defaultValue,
  onValueChange,
  onDetails,
  validate = true,
  invalid,
  size = 'md',
  placeholder = '01  A 123 BC',
  inputClassName,
  rightIcon,
  ...props
}: CarPlateInputProps) {
  const [raw, setRaw] = useDocumentValue(
    carPlateSpec,
    value,
    defaultValue,
    getCarPlateDetails,
    onValueChange,
    (_, d) => onDetails?.(d),
  );
  const { complete, valid, region, type } = getCarPlateDetails(raw);
  const badRegion = raw.length >= 2 && !region;
  return (
    <div data-slot="car-plate-input" className="relative w-full min-w-0">
      <MaskedControl
        spec={carPlateSpec}
        raw={raw}
        onRawChange={setRaw}
        size={size}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        placeholder={placeholder}
        invalid={invalid || (validate && (badRegion || (complete && !valid)))}
        rightIcon={rightIcon ?? <PlateMark />}
        inputClassName={cn('font-mono font-semibold uppercase', inputClassName)}
        data-plate-type={type ?? undefined}
        data-region={region?.id}
        {...props}
      />
      <span aria-hidden="true" className={plateDivider({ size })} />
    </div>
  );
}
