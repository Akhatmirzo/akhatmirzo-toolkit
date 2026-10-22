import { compact, group } from './shared';

/**
 * STIR (INN) to'g'rimi: 9 raqam, `0` bilan boshlanmaydi. Bo'shliq va chiziqchalar
 * e'tiborsiz qoldiriladi. Faqat format tekshiriladi.
 * @example isValidInn('123 456 789') // true
 * @example isValidInn('012345678') // false
 */
export function isValidInn(input: string | number | null | undefined): boolean {
  return /^[1-9]\d{8}$/.test(compact(input));
}

/**
 * STIR (INN) ni `000 000 000` ko'rinishida formatlaydi (bosqichma-bosqich, faqat raqamlar).
 * @example formatInn('123456789') // '123 456 789'
 * @example formatInn('1234') // '123 4'
 */
export function formatInn(input: string | number | null | undefined): string {
  return group(compact(input).replace(/\D/g, '').slice(0, 9), [3, 3, 3]);
}

/** Pasport / ID karta: katta harf, bo'shliq va chiziqchalarsiz. */
function normalizePassport(input: string | null | undefined): string {
  return compact(input).toUpperCase();
}

/**
 * Pasport yoki ID karta seriya-raqami to'g'rimi: 2 lotin harf + 7 raqam (`AA1234567`).
 * Kichik harf, bo'shliq va chiziqcha qabul qilinadi (`aa 123-45-67`).
 * @example isValidPassport('AA1234567') // true
 * @example isValidPassport('ad 1234567') // true
 * @example isValidPassport('АА1234567') // false — kirill harflar
 */
export function isValidPassport(input: string | null | undefined): boolean {
  return /^[A-Z]{2}\d{7}$/.test(normalizePassport(input));
}

/**
 * Pasport seriya-raqamini `AA 1234567` ko'rinishida formatlaydi: harflar katta, seriya va
 * raqam orasida bo'shliq (bosqichma-bosqich). Tuzilishga mos kelmaydigan qism tashlanadi.
 * @example formatPassport('aa1234567') // 'AA 1234567'
 * @example formatPassport('ad 12') // 'AD 12'
 */
export function formatPassport(input: string | null | undefined): string {
  const m = /^([A-Z]{0,2})(\d{0,7})/.exec(normalizePassport(input))!;
  const [, series = '', number = ''] = m;
  return number ? `${series} ${number}`.trim() : series;
}

/**
 * Bank hisob raqami to'g'rimi: aynan 20 raqam (bo'shliq va chiziqcha mumkin). Faqat format.
 * @example isValidBankAccount('2020 8000 9000 1234 5001') // true
 */
export function isValidBankAccount(input: string | null | undefined): boolean {
  return /^\d{20}$/.test(compact(input));
}

/**
 * Bank hisob raqamini 4 tadan guruhlaydi (bosqichma-bosqich, ko'pi bilan 20 raqam).
 * @example formatBankAccount('20208000900012345001') // '2020 8000 9000 1234 5001'
 */
export function formatBankAccount(input: string | null | undefined): string {
  return group(compact(input).replace(/\D/g, '').slice(0, 20), [4, 4, 4, 4, 4]);
}

/**
 * MFO (bank filiali kodi) to'g'rimi: aynan 5 raqam. Boshidagi `0` lar muhim, shuning uchun
 * faqat satr qabul qilinadi.
 * @example isValidMfo('00014') // true
 * @example isValidMfo('1234') // false
 */
export function isValidMfo(input: string | null | undefined): boolean {
  return /^\d{5}$/.test(compact(input));
}
