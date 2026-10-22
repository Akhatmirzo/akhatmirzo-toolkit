import type { UzApostropheStyle } from './script';
import { isApostrophe } from './translit';

export interface FixApostrophesOptions {
  /**
   * `'typographic'` — `oʻ gʻ` (U+02BB) va tutuq belgisi `ʼ` (U+02BC);
   * `'ascii'` — ikkalasi ham oddiy `'`. Standart: `'typographic'`
   */
  style?: UzApostropheStyle;
}

const OKINA = 'ʻ';
const TUTUQ = 'ʼ';
const O_G = new Set(['o', 'O', 'g', 'G']);
const LETTER_RE = /\p{L}/u;

/** Harf (`ʻ`, `ʼ` ham Unicode'da "harf", lekin bu yerda apostrof sifatida hisoblanadi). */
function isWordLetter(ch: string | undefined): boolean {
  return ch !== undefined && !isApostrophe(ch) && LETTER_RE.test(ch);
}

type Role = 'okina' | 'tutuq' | 'quote';

/**
 * O'zbek lotin matnidagi apostroflarni to'g'rilaydi.
 *
 * - `o`/`g` dan keyingi har qanday variant (`' ‘ ’ \` ´ ʼ`) → `ʻ` (U+02BB): `oʻ`, `gʻ`;
 * - so'z ichidagi boshqa apostrof (tutuq belgisi) → `ʼ` (U+02BC): `maʼno`, `sanʼat`;
 * - qo'shtirnoq vazifasidagilarga tegilmaydi: so'z boshidagi apostrof (`'Salom'` ning
 *   birinchisi) ochuvchi, ochiq qo'shtirnoqdan keyin so'z oxiridagi apostrof — yopuvchi.
 *   Ochiq qo'shtirnoq bo'lmasa, so'z oxiridagi apostrof `o`/`g` dan keyin `ʻ` (`togʻ`),
 *   boshqa harfdan keyin `ʼ` (`jamʼ`) bo'ladi.
 * @example fixApostrophes("O'zbekiston g'alabasi, ma'no") // 'Oʻzbekiston gʻalabasi, maʼno'
 * @example fixApostrophes("'Salom' dedi") // "'Salom' dedi"
 * @example fixApostrophes("tog' va bog'") // 'togʻ va bogʻ'
 * @example fixApostrophes('Oʻzbekiston', { style: 'ascii' }) // "O'zbekiston"
 */
export function fixApostrophes(
  s: string | null | undefined,
  options: FixApostrophesOptions = {},
): string {
  const chars = [...(s ?? '')];
  const ascii = options.style === 'ascii';
  let result = '';
  let quoteOpen = false;
  let prevRole: Role | null = null;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    if (!isApostrophe(ch)) {
      result += ch;
      prevRole = null;
      continue;
    }
    const prev = chars[i - 1];
    // `mo''tabar` (мўътабар): ikkinchi apostrof ham so'z ichida
    const afterLetter = isWordLetter(prev) || prevRole === 'okina' || prevRole === 'tutuq';
    const beforeLetter = isWordLetter(chars[i + 1]);
    const nextIsApostrophe = isApostrophe(chars[i + 1]);

    let role: Role;
    if (!afterLetter) {
      role = 'quote';
      if (beforeLetter) quoteOpen = true;
    } else if (O_G.has(prev!) && prevRole === null) {
      role = beforeLetter || nextIsApostrophe || !quoteOpen ? 'okina' : 'quote';
    } else if (beforeLetter) {
      role = 'tutuq';
    } else {
      role = quoteOpen ? 'quote' : 'tutuq';
    }
    if (role === 'quote' && afterLetter && !beforeLetter) quoteOpen = false;

    prevRole = role;
    if (role === 'quote') result += ch;
    else if (ascii) result += "'";
    else result += role === 'okina' ? OKINA : TUTUQ;
  }
  return result;
}
