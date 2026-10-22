import { z } from 'zod';
import { formatNumber } from '../format/number';
import { isValidCarPlate } from '../identifiers/car-plate';
import {
  isValidBankAccount,
  isValidInn,
  isValidMfo,
  isValidPassport,
} from '../identifiers/documents';
import { isValidPinfl, type PinflOptions } from '../identifiers/pinfl';
import { UZ_REGIONS, type UzRegionId } from '../identifiers/regions';
import { compact } from '../identifiers/shared';
import { isValidCardNumber } from '../validate/card';
import { isValidEmail } from '../validate/email';
import { passwordStrength, type PasswordScore } from '../validate/password';
import { parsePhone } from '../validate/phone';

/** Bo'sh qiymat va noto'g'ri qiymat uchun xato matnlari */
export interface ZUzMessages {
  /** Maydon bo'sh (`''`, `null`, `undefined`) */
  required: string;
  /** Format yoki tekshiruv o'tmadi */
  invalid: string;
}

export interface ZUzOptions<M = ZUzMessages> {
  /** Standart o'zbekcha xato matnlarini almashtirish */
  messages?: Partial<M>;
}

export interface ZUzPinflOptions extends ZUzOptions, PinflOptions {}

export interface ZUzPasswordMessages {
  required: string;
  /** Parol `minScore` dan zaif */
  weak: string;
}

export interface ZUzPasswordOptions extends ZUzOptions<ZUzPasswordMessages> {
  /** `passwordStrength(...).score` ning eng kichik qiymati (0–4). Default `2` */
  minScore?: PasswordScore;
}

export interface ZUzMoneyMessages extends ZUzMessages {
  /** `min` dan kichik. Funksiya bo'lsa — chegara bilan chaqiriladi */
  min: string | ((min: number) => string);
  /** `max` dan katta */
  max: string | ((max: number) => string);
}

export interface ZUzMoneyOptions extends ZUzOptions<ZUzMoneyMessages> {
  min?: number;
  max?: number;
}

const DEFAULTS = {
  phone: { required: 'Telefon raqamini kiriting', invalid: "Telefon raqami noto'g'ri" },
  pinfl: { required: 'JShShIRni kiriting', invalid: "JShShIR noto'g'ri" },
  inn: { required: 'STIRni kiriting', invalid: "STIR noto'g'ri" },
  passport: {
    required: 'Pasport seriya va raqamini kiriting',
    invalid: "Pasport seriya-raqami noto'g'ri",
  },
  carPlate: { required: 'Avtomobil raqamini kiriting', invalid: "Avtomobil raqami noto'g'ri" },
  bankAccount: {
    required: 'Hisob raqamini kiriting',
    invalid: "Hisob raqami 20 ta raqamdan iborat bo'lishi kerak",
  },
  mfo: { required: 'MFOni kiriting', invalid: "MFO 5 ta raqamdan iborat bo'lishi kerak" },
  card: { required: 'Karta raqamini kiriting', invalid: "Karta raqami noto'g'ri" },
  email: { required: 'Email manzilini kiriting', invalid: "Email manzili noto'g'ri" },
  region: { required: 'Hududni tanlang', invalid: "Hudud noto'g'ri" },
} satisfies Record<string, ZUzMessages>;

const PASSWORD_DEFAULTS: ZUzPasswordMessages = {
  required: 'Parolni kiriting',
  weak: 'Parol juda oddiy — katta va kichik harf, raqam va belgilarni aralashtiring',
};

const MONEY_DEFAULTS: ZUzMoneyMessages = {
  required: 'Summani kiriting',
  invalid: "Summa noto'g'ri",
  min: (min) => `Eng kam summa — ${formatNumber(min)} so'm`,
  max: (max) => `Eng ko'p summa — ${formatNumber(max)} so'm`,
};

/**
 * Satr maydoni uchun umumiy sxema: bo'sh → `required`, `check` o'tmasa → `invalid`,
 * so'ng `clean` bilan tozalangan qiymat qaytariladi.
 */
function textField(
  defaults: ZUzMessages,
  options: ZUzOptions | undefined,
  check: (value: string) => boolean,
  clean: (value: string) => string,
) {
  const m = { ...defaults, ...options?.messages };
  return z
    .string({ error: (iss) => (iss.input == null ? m.required : m.invalid) })
    .refine((v) => v.trim() !== '', { error: m.required, abort: true })
    .refine(check, { error: m.invalid })
    .transform(clean);
}

/**
 * O'zbekiston mobil raqami (`isValidPhone`). Natija — tozalangan `"998901234567"`.
 * @example zUz.phone().parse('+998 90 123-45-67') // '998901234567'
 */
function phone(options?: ZUzOptions) {
  return textField(
    DEFAULTS.phone,
    options,
    (v) => parsePhone(v).valid,
    (v) => `998${parsePhone(v).digits}`,
  );
}

/**
 * JShShIR / PINFL (`isValidPinfl`). Natija — 14 raqam, bo'shliqsiz.
 * @example zUz.pinfl().parse('31503 90123 4567') // '31503901234567'
 */
function pinfl(options?: ZUzPinflOptions) {
  return textField(
    DEFAULTS.pinfl,
    options,
    (v) => isValidPinfl(v, { checksum: options?.checksum }),
    compact,
  );
}

/**
 * STIR / INN (`isValidInn`). Natija — 9 raqam.
 * @example zUz.inn().parse('123 456 789') // '123456789'
 */
function inn(options?: ZUzOptions) {
  return textField(DEFAULTS.inn, options, isValidInn, compact);
}

/**
 * Pasport / ID karta (`isValidPassport`). Natija — `"AA1234567"`.
 * @example zUz.passport().parse('aa 123-45-67') // 'AA1234567'
 */
function passport(options?: ZUzOptions) {
  return textField(DEFAULTS.passport, options, isValidPassport, (v) => compact(v).toUpperCase());
}

/**
 * Avtomobil davlat raqami (`isValidCarPlate`). Natija — `"01A123BC"`.
 * @example zUz.carPlate().parse('01 a 123 bc') // '01A123BC'
 */
function carPlate(options?: ZUzOptions) {
  return textField(DEFAULTS.carPlate, options, isValidCarPlate, (v) => compact(v).toUpperCase());
}

/**
 * Bank hisob raqami (`isValidBankAccount`). Natija — 20 raqam.
 * @example zUz.bankAccount().parse('2020 8000 9000 1234 5001') // '20208000900012345001'
 */
function bankAccount(options?: ZUzOptions) {
  return textField(DEFAULTS.bankAccount, options, isValidBankAccount, compact);
}

/**
 * MFO — bank filiali kodi (`isValidMfo`). Natija — 5 raqam (boshidagi `0` lar saqlanadi).
 * @example zUz.mfo().parse('00014') // '00014'
 */
function mfo(options?: ZUzOptions) {
  return textField(DEFAULTS.mfo, options, isValidMfo, compact);
}

/**
 * Bank kartasi: 16 raqam va Luhn (`isValidCardNumber`). Natija — 16 raqam.
 * @example zUz.card().parse('8600 1234 5678 9016') // '8600123456789016'
 */
function card(options?: ZUzOptions) {
  return textField(DEFAULTS.card, options, isValidCardNumber, (v) => v.replace(/\D/g, ''));
}

/**
 * Email (`isValidEmail`). Natija — chetdagi bo'shliqlarsiz.
 * @example zUz.email().parse(' sarvar@mail.uz ') // 'sarvar@mail.uz'
 */
function email(options?: ZUzOptions) {
  return textField(DEFAULTS.email, options, isValidEmail, (v) => v.trim());
}

/**
 * Parol kuchliligi (`passwordStrength`): `score >= minScore` (default 2 — "O'rtacha").
 * Qiymat o'zgartirilmaydi.
 * @example zUz.password({ minScore: 3 }).safeParse('parol').success // false
 */
function password(options?: ZUzPasswordOptions) {
  const m = { ...PASSWORD_DEFAULTS, ...options?.messages };
  const minScore = options?.minScore ?? 2;
  return z
    .string({ error: (iss) => (iss.input == null ? m.required : m.weak) })
    .refine((v) => v !== '', { error: m.required, abort: true })
    .refine((v) => passwordStrength(v).score >= minScore, { error: m.weak });
}

/**
 * Pul summasini songa aylantiradi: son yoki `"1 250 000"`, `"1250000,50"`, `"1 250 000 so'm"`.
 * Bo'sh — `null`, tahlil qilib bo'lmasa — `NaN`.
 */
function toAmount(input: number | string | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === 'number') return input;
  let s = input
    .replace(/(so['ʻ‘’]?m|uzs|sum)\s*$/i, '')
    .replace(/\s/g, '')
    .replace(/^[−–]/, '-');
  if (s === '') return null;
  // Ajratgichlar: ikkalasi bo'lsa — oxirgisi kasr, qolganlari minglik ("1,250,000.50",
  // "1.250.000,50"); bittasi bir necha marta — minglik ("1,250,000"); bir marta — kasr ("1250,5")
  const ungroup = (int: string, group: string) => {
    const parts = int.split(group);
    return parts.every((p, i) => (i === 0 ? /^-?\d{1,3}$/.test(p) : /^\d{3}$/.test(p)))
      ? parts.join('')
      : 'x';
  };
  const comma = s.lastIndexOf(',');
  const dot = s.lastIndexOf('.');
  if (comma !== -1 && dot !== -1) {
    const at = Math.max(comma, dot);
    s = `${ungroup(s.slice(0, at), comma > dot ? '.' : ',')}.${s.slice(at + 1)}`;
  } else if (comma !== -1 || dot !== -1) {
    const sep = comma !== -1 ? ',' : '.';
    const parts = s.split(sep);
    s = parts.length > 2 ? ungroup(s, sep) : parts.join('.');
  }
  return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : Number.NaN;
}

function message<T>(m: string | ((value: T) => string), value: T): string {
  return typeof m === 'function' ? m(value) : m;
}

/**
 * Pul summasi: son yoki matn (`"1 250 000"`) → `number`. `min` / `max` chegaralari ixtiyoriy.
 * @example zUz.money({ min: 1000 }).parse('1 250 000') // 1250000
 */
function money(options?: ZUzMoneyOptions) {
  const m = { ...MONEY_DEFAULTS, ...options?.messages };
  const { min, max } = options ?? {};
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()], { error: m.invalid })
    .transform((input, ctx) => {
      const amount = toAmount(input);
      if (amount === null) {
        ctx.issues.push({ code: 'custom', message: m.required, input });
        return z.NEVER;
      }
      if (!Number.isFinite(amount)) {
        ctx.issues.push({ code: 'custom', message: m.invalid, input });
        return z.NEVER;
      }
      if (min !== undefined && amount < min) {
        ctx.issues.push({ code: 'custom', message: message(m.min, min), input });
        return z.NEVER;
      }
      if (max !== undefined && amount > max) {
        ctx.issues.push({ code: 'custom', message: message(m.max, max), input });
        return z.NEVER;
      }
      return amount;
    });
}

const REGION_IDS: ReadonlySet<string> = new Set(UZ_REGIONS.map((r) => r.id));

/**
 * Hudud `id` si (`UZ_REGIONS`). Kirish — satr (bo'sh forma qiymati `''` ham), natija — `UzRegionId`.
 * @example zUz.region().parse('samarkand') // 'samarkand'
 */
function region(options?: ZUzOptions) {
  const m = { ...DEFAULTS.region, ...options?.messages };
  return z
    .string({ error: (iss) => (iss.input == null ? m.required : m.invalid) })
    .refine((v) => v !== '', { error: m.required, abort: true })
    .refine((v) => REGION_IDS.has(v), { error: m.invalid })
    .transform((v) => v as UzRegionId);
}

/**
 * O'zbekiston uchun tayyor zod (v4) sxemalari. Hammasi `@akhatmirzo/core` dagi
 * `isValidX` / `parseX` funksiyalariga tayanadi, xato matnlari o'zbekcha.
 * @example
 * const schema = z.object({ phone: zUz.phone(), pinfl: zUz.pinfl() });
 */
export const zUz = {
  phone,
  pinfl,
  inn,
  passport,
  carPlate,
  bankAccount,
  mfo,
  card,
  email,
  password,
  money,
  region,
};
