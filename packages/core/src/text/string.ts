import { UZ_APOSTROPHES, cyrToLat } from './translit';

const APOSTROPHES_RE = new RegExp(`[${UZ_APOSTROPHES}]`, 'g');

/**
 * URL uchun slug: o'zbekcha (kirill ham) → lotin, apostroflar olib tashlanadi, qolgani `-` bilan.
 * @example slugify("Farg'ona viloyati") // 'fargona-viloyati'
 * @example slugify('Тошкент шаҳри') // 'toshkent-shahri'
 * @example slugify('Ер юзи') // 'yer-yuzi'
 */
export function slugify(s: string | null | undefined): string {
  // normalizeUz emas: slug uchun so'z boshidagi `е` → `ye` (Ер → yer) to'g'ri
  return cyrToLat(s ?? '')
    .toLowerCase()
    .replace(APOSTROPHES_RE, '')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Matnni `max` belgigacha qisqartiradi (natija `ellipsis` bilan birga `max` dan oshmaydi).
 * Belgilar kod nuqtasi bo'yicha sanaladi (emoji bo'linmaydi).
 * @example truncate('Salom dunyo', 7) // 'Salom…'
 */
export function truncate(s: string, max: number, ellipsis = '…'): string {
  const chars = [...s];
  if (chars.length <= max) return s;
  if (max <= 0) return '';
  const tail = [...ellipsis];
  if (max <= tail.length) return tail.slice(0, max).join('');
  return (
    chars
      .slice(0, max - tail.length)
      .join('')
      .trimEnd() + ellipsis
  );
}

/** Kengaytma (nuqta bilan) — 10 belgigacha, bo'shliqsiz, nomning o'zi bo'lmasa */
function extensionOf(chars: string[]): number {
  const dot = chars.lastIndexOf('.');
  if (dot <= 0) return 0;
  const len = chars.length - dot;
  if (len < 2 || len > 10 || chars.slice(dot).some((c) => /\s/.test(c))) return 0;
  return len;
}

/**
 * Matnni o'rtadan qisqartiradi; fayl nomi bo'lsa kengaytmasi va oxirgi qismi saqlanadi.
 * @example truncateMiddle('hisobot-oktabr-2026.pdf', 22) // 'hisobot-oktab…2026.pdf'
 */
export function truncateMiddle(s: string, max: number, ellipsis = '…'): string {
  const chars = [...s];
  if (chars.length <= max) return s;
  const mark = [...ellipsis];
  if (max <= mark.length) return truncate(s, max, ellipsis);
  const available = max - mark.length;

  let ext = extensionOf(chars);
  if (ext >= available) ext = 0;
  const rest = available - ext;
  const tailExtra = ext ? Math.floor(rest / 4) : Math.floor(rest / 2);
  const head = rest - tailExtra;
  const tail = tailExtra + ext;
  return chars.slice(0, head).join('') + ellipsis + (tail ? chars.slice(-tail).join('') : '');
}

/**
 * Birinchi harfni katta qiladi, qolganiga tegmaydi.
 * @example capitalize("o'zbekiston") // "O'zbekiston"
 */
export function capitalize(s: string): string {
  const first = s.codePointAt(0);
  if (first === undefined) return '';
  const ch = String.fromCodePoint(first);
  return ch.toUpperCase() + s.slice(ch.length);
}
