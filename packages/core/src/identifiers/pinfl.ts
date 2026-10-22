import { compact, group } from './shared';

export interface PinflOptions {
  /**
   * Nazorat raqamini (14-raqam) ham tekshirish. Standart: `false`.
   *
   * DIQQAT: algoritm (7-3-1 og'irliklar, mod 10) ochiq manbalardan olingan va haqiqiy namunalar
   * bilan **tasdiqlanmagan** — shuning uchun standart holatda o'chirilgan.
   */
  checksum?: boolean;
}

export interface PinflInfo {
  /** 3/5 — erkak, 4/6 — ayol */
  gender: 'male' | 'female';
  /** Tug'ilgan sana (mahalliy vaqt, 00:00) */
  birthDate: Date;
}

const WEIGHTS = [7, 3, 1];

/**
 * PINFL nazorat raqami: birinchi 13 raqam 7-3-1 og'irliklar bilan ko'paytirilib yig'iladi,
 * yig'indi mod 10 — 14-raqam.
 * TASDIQLANMAGAN: haqiqiy JShShIR namunalarida sinalmagan, faqat `checksum: true` bilan ishlaydi.
 */
function pinflChecksumOk(d: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) sum += Number(d[i]) * WEIGHTS[i % 3]!;
  return sum % 10 === Number(d[13]);
}

/**
 * JShShIR (PINFL) ni tahlil qiladi: jins va tug'ilgan sana. Bo'shliq va chiziqchalar
 * e'tiborsiz qoldiriladi. Format noto'g'ri yoki sana mavjud bo'lmasa — `null`.
 *
 * Tuzilishi: 1-raqam — jins va asr (3/4 — 1900-yillar, 5/6 — 2000-yillar; toq — erkak,
 * juft — ayol), 2–7-raqamlar — tug'ilgan sana `DDMMYY`.
 * @example parsePinfl('31503901234567') // { gender: 'male', birthDate: new Date(1990, 2, 15) }
 * @example parsePinfl('6 010120 1234567') // { gender: 'female', birthDate: new Date(2020, 0, 1) }
 * @example parsePinfl('33102901234567') // null — 31-fevral yo'q
 */
export function parsePinfl(
  input: string | number | null | undefined,
  options: PinflOptions = {},
): PinflInfo | null {
  const d = compact(input);
  if (!/^[3-6]\d{13}$/.test(d)) return null;
  const first = Number(d[0]);
  const day = Number(d.slice(1, 3));
  const month = Number(d.slice(3, 5));
  const year = (first <= 4 ? 1900 : 2000) + Number(d.slice(5, 7));
  const birthDate = new Date(year, month - 1, day);
  // `new Date(1990, 1, 31)` 3-martga o'tib ketadi — haqiqiy sanami, tekshiramiz
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getDate() !== day
  ) {
    return null;
  }
  if (options.checksum && !pinflChecksumOk(d)) return null;
  return { gender: first % 2 === 1 ? 'male' : 'female', birthDate };
}

/**
 * JShShIR (PINFL) to'g'rimi: 14 raqam, 1-raqam 3–6, 2–7-raqamlar haqiqiy sana (`DDMMYY`).
 * Nazorat raqami faqat `{ checksum: true }` bilan tekshiriladi.
 * @example isValidPinfl('31503901234567') // true
 * @example isValidPinfl('315039012345') // false — 12 raqam
 */
export function isValidPinfl(
  input: string | number | null | undefined,
  options: PinflOptions = {},
): boolean {
  return parsePinfl(input, options) !== null;
}

/**
 * JShShIR ni ko'rsatish uchun guruhlaydi: `00000 00000 0000` (bosqichma-bosqich, faqat raqamlar).
 * @example formatPinfl('31503901234567') // '31503 90123 4567'
 */
export function formatPinfl(input: string | number | null | undefined): string {
  return group(compact(input).replace(/\D/g, '').slice(0, 14), [5, 5, 4]);
}
