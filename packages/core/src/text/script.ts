import { latToCyr, walkCyrToLat } from './translit';

/** O'zbek alifbosi: lotin yoki kirill. */
export type UzScript = 'latin' | 'cyrillic';

/**
 * Lotin natijadagi apostroflar: `'typographic'` — `oʻ gʻ` (U+02BB) va tutuq belgisi `ʼ` (U+02BC);
 * `'ascii'` — oddiy `'`.
 */
export type UzApostropheStyle = 'typographic' | 'ascii';

/** {@link detectScript} natijasi. */
export type DetectedScript = 'latin' | 'cyrillic' | 'mixed' | 'none';

const LATIN_RE = /\p{Script=Latin}/u;
const CYRILLIC_RE = /\p{Script=Cyrillic}/u;
const LETTER_RE = /\p{L}/u;

/**
 * Matn qaysi yozuvda ekanini aniqlaydi.
 *
 * Qoidalar: faqat harflar sanaladi — raqamlar, tinish belgilari, bo'shliqlar, apostroflar
 * (`ʻ ʼ '` …) va boshqa yozuvlar (yunon, arab …) e'tiborga olinmaydi. Ikkala yozuvdan kamida
 * bittadan harf bo'lsa — `'mixed'` (chegara yo'q: bitta begona harf ham hisobga olinadi),
 * faqat bittasidan bo'lsa — o'sha yozuv, lotin ham kirill ham bo'lmasa — `'none'`.
 * @example detectScript('Salom dunyo') // 'latin'
 * @example detectScript('Салом') // 'cyrillic'
 * @example detectScript('Salom Салом') // 'mixed'
 * @example detectScript('+998 90 123-45-67') // 'none'
 */
export function detectScript(s: string | null | undefined): DetectedScript {
  let latin = false;
  let cyrillic = false;
  for (const ch of s ?? '') {
    if (!LETTER_RE.test(ch)) continue;
    if (!latin && LATIN_RE.test(ch)) latin = true;
    else if (!cyrillic && CYRILLIC_RE.test(ch)) cyrillic = true;
    if (latin && cyrillic) return 'mixed';
  }
  return latin ? 'latin' : cyrillic ? 'cyrillic' : 'none';
}

export interface ToScriptOptions {
  /**
   * Lotin natijadagi apostroflar: `'typographic'` — `oʻ gʻ` (U+02BB) va tutuq belgisi `ʼ`
   * (U+02BC); `'ascii'` — oddiy `'`. Faqat kirilldan o'girilgan qismlarga ta'sir qiladi.
   * Standart: `'typographic'`
   */
  apostrophe?: UzApostropheStyle;
}

const OKINA = 'ʻ';
const TUTUQ = 'ʼ';

/**
 * Matnni berilgan yozuvga o'giradi. Manba avtomatik aniqlanadi va faqat **boshqa** yozuvdagi
 * qismlar o'giriladi — aralash matnda lotin qismi lotinga o'girilganda o'zgarmaydi (va aksincha).
 * Matn allaqachon kerakli yozuvda bo'lsa — aynan o'zi qaytadi (apostroflarga ham tegilmaydi,
 * ular uchun {@link fixApostrophes}).
 * @example toScript('Салом, дунё', 'latin') // 'Salom, dunyo'
 * @example toScript('Ўзбекистон', 'latin') // 'Oʻzbekiston'
 * @example toScript('маъно', 'latin', { apostrophe: 'ascii' }) // "ma'no"
 * @example toScript("Salom, O'zbekiston", 'cyrillic') // 'Салом, Ўзбекистон'
 * @example toScript('Toshkent — Тошкент', 'cyrillic') // 'Тошкент — Тошкент'
 */
export function toScript(
  s: string | null | undefined,
  target: UzScript,
  options: ToScriptOptions = {},
): string {
  const text = s ?? '';
  const source = detectScript(text);
  if (source === 'none' || source === target) return text;
  if (target === 'cyrillic') return latToCyr(text);

  const ascii = options.apostrophe === 'ascii';
  let result = '';
  walkCyrToLat(text, "'", (out, index, length) => {
    if (!ascii && out.includes("'")) {
      // ъ → tutuq belgisi, ў/ғ → oʻ/gʻ; lotin qismdagi apostroflarga tegilmaydi
      const src = text
        .slice(index, index + length)
        .normalize('NFC')
        .toLowerCase();
      if (src === 'ъ') out = out.replace("'", TUTUQ);
      else if (src === 'ў' || src === 'ғ') out = out.replace("'", OKINA);
    }
    result += out;
  });
  return result;
}
