/** O'zbekiston mobil operator kodlari (+998 dan keyingi 2 raqam). */
export const UZ_OPERATOR_CODES = [
  '33',
  '50',
  '55',
  '77',
  '88',
  '90',
  '91',
  '93',
  '94',
  '95',
  '97',
  '98',
  '99',
] as const;

export type UzOperatorCode = (typeof UZ_OPERATOR_CODES)[number];

export interface ParsedPhone {
  /** Mahalliy raqamlar (+998 siz); to'g'ri raqamda aynan 9 ta */
  digits: string;
  /** Operator kodi (ma'lum bo'lsa), aks holda `null` */
  operator: UzOperatorCode | null;
  /** 9 raqam va ma'lum operator kodi */
  valid: boolean;
}

const CODES: ReadonlySet<string> = new Set(UZ_OPERATOR_CODES);

/**
 * Telefon raqamini tahlil qiladi. Bo'shliq, chiziqcha, qavslar e'tiborsiz qoldiriladi.
 * `998` prefiksi faqat `+` bilan yoki 9 tadan ko'p raqamda olib tashlanadi (`formatPhone` bilan bir xil).
 * @example parsePhone('+998 90 123-45-67') // { digits: '901234567', operator: '90', valid: true }
 */
export function parsePhone(input: string | number | null | undefined): ParsedPhone {
  const raw = input == null ? '' : String(input).trim();
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('998') && (raw.startsWith('+') || digits.length > 9)) {
    digits = digits.slice(3);
  }
  const code = digits.slice(0, 2);
  const operator = code.length === 2 && CODES.has(code) ? (code as UzOperatorCode) : null;
  return { digits, operator, valid: digits.length === 9 && operator !== null };
}

/**
 * Raqam to'g'ri O'zbekiston mobil raqamimi.
 * @example isValidPhone('901234567') // true
 */
export function isValidPhone(input: string | number | null | undefined): boolean {
  return parsePhone(input).valid;
}
