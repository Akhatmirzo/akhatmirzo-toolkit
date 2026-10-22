import { regionByPlateCode, type UzRegion } from './regions';
import { compact, group } from './shared';

/** `personal` — jismoniy shaxs (`01 A 123 BC`), `legal` — yuridik shaxs (`01 123 ABC`). */
export type CarPlateType = 'personal' | 'legal';

export interface CarPlateInfo {
  /** Hudud (`UZ_REGIONS` dan) */
  region: UzRegion;
  /** Raqamdagi hudud kodi, masalan `'01'` */
  regionCode: string;
  type: CarPlateType;
}

const PERSONAL_RE = /^(\d{2})[A-Z]\d{3}[A-Z]{2}$/;
const LEGAL_RE = /^(\d{2})\d{3}[A-Z]{3}$/;

function normalizePlate(input: string | null | undefined): string {
  return compact(input).toUpperCase();
}

/**
 * Avtomobil davlat raqamini tahlil qiladi. Bo'shliq, chiziqcha va kichik harflar qabul qilinadi;
 * harflar faqat lotin. Hudud kodi `UZ_REGIONS` da bo'lmasa yoki format mos kelmasa — `null`.
 * @example parseCarPlate('01 A 123 BC') // { region: { id: 'tashkent-city', … }, regionCode: '01', type: 'personal' }
 * @example parseCarPlate('30 123 abc')?.type // 'legal'
 * @example parseCarPlate('02 A 123 BC') // null — 02 kodi ro'yxatda yo'q
 */
export function parseCarPlate(input: string | null | undefined): CarPlateInfo | null {
  const s = normalizePlate(input);
  const personal = PERSONAL_RE.exec(s);
  const legal = personal ? null : LEGAL_RE.exec(s);
  const match = personal ?? legal;
  if (!match) return null;
  const regionCode = match[1]!;
  const region = regionByPlateCode(regionCode);
  if (!region) return null;
  return { region, regionCode, type: personal ? 'personal' : 'legal' };
}

/**
 * Avtomobil raqami to'g'rimi: jismoniy `01 A 123 BC` yoki yuridik `01 123 ABC` formati va
 * hudud kodi ro'yxatda.
 * @example isValidCarPlate('01A123BC') // true
 * @example isValidCarPlate('01 1234 AB') // false
 */
export function isValidCarPlate(input: string | null | undefined): boolean {
  return parseCarPlate(input) !== null;
}

/**
 * Avtomobil raqamini ko'rsatish uchun formatlaydi: `01 A 123 BC` yoki `01 123 ABC`. Tur 3-belgidan
 * aniqlanadi (harf — jismoniy, raqam — yuridik), shuning uchun yozish paytida ham ishlaydi.
 * Harflar katta qilinadi, bo'shliq va chiziqchalar qayta qo'yiladi; hudud kodi tekshirilmaydi.
 * @example formatCarPlate('01a123bc') // '01 A 123 BC'
 * @example formatCarPlate('01123abc') // '01 123 ABC'
 * @example formatCarPlate('01A1') // '01 A 1'
 */
export function formatCarPlate(input: string | null | undefined): string {
  const s = normalizePlate(input).slice(0, 8);
  const personal = /^\d{2}[A-Z]/.test(s);
  return group(s, personal ? [2, 1, 3, 2] : [2, 3, 3]);
}
