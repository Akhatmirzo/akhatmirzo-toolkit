import { applyUzScript, capitalizeFirst, type UzScriptOptions } from './uz-script';

// Ichki lug'at — lotin, tipografik apostrof (U+02BB). Alifbo/apostrof `applyUzScript` da.
const ONES = ['', 'bir', 'ikki', 'uch', 'toʻrt', 'besh', 'olti', 'yetti', 'sakkiz', 'toʻqqiz'];
const TENS = [
  '',
  'oʻn',
  'yigirma',
  'oʻttiz',
  'qirq',
  'ellik',
  'oltmish',
  'yetmish',
  'sakson',
  'toʻqson',
];
const SCALES = ['', 'ming', 'million', 'milliard', 'trillion'];

/** `numberToWords` qabul qiladigan eng katta modul: 999 999 999 999 999 (trillionlar). */
const MAX_WORDS = 999_999_999_999_999;

export interface NumberToWordsOptions extends UzScriptOptions {
  /**
   * Rasmiy hujjatlar uslubi: `"bir yuz"`, `"bir ming"`. Default (`false`): `"yuz"`, `"ming"`
   * (`"ming"` — faqat son ming bilan boshlanganda; `"bir million bir ming"`).
   */
  formal?: boolean;
}

/** 1–999 oralig'idagi guruh so'zlari. */
function groupWords(n: number, formal: boolean): string[] {
  const words: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds > 0) {
    if (hundreds > 1 || formal) words.push(ONES[hundreds]!);
    words.push('yuz');
  }
  if (rest >= 10) words.push(TENS[Math.floor(rest / 10)]!);
  if (rest % 10 > 0) words.push(ONES[rest % 10]!);
  return words;
}

/** Butun sonning lotin so'zlari (ichki ko'rinish). Chegaradan tashqari yoki noto'g'ri → `''`. */
function intToWords(value: number, formal: boolean): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  const n = Math.trunc(value);
  const abs = Math.abs(n);
  if (abs > MAX_WORDS) return '';
  if (abs === 0) return 'nol';

  const groups: number[] = [];
  for (let rest = abs; rest > 0; rest = Math.floor(rest / 1000)) groups.push(rest % 1000);

  const words: string[] = [];
  for (let scale = groups.length - 1; scale >= 0; scale--) {
    const g = groups[scale]!;
    if (g === 0) continue;
    const leading = scale === groups.length - 1;
    // "ming" (bir ming emas) — faqat son ming bilan boshlanganda va rasmiy bo'lmagan uslubda
    if (scale === 1 && g === 1 && leading && !formal) {
      words.push('ming');
      continue;
    }
    words.push(...groupWords(g, formal));
    if (scale > 0) words.push(SCALES[scale]!);
  }
  return (n < 0 ? 'minus ' : '') + words.join(' ');
}

/**
 * Butun sonni o'zbekcha so'z bilan yozadi (`±999 999 999 999 999` gacha). Kasr qismi tashlanadi,
 * manfiy → `"minus …"`. Noto'g'ri son (`NaN`, `Infinity`) yoki chegaradan tashqari → `''`.
 * @example numberToWords(1_250_000) // "bir million ikki yuz ellik ming"
 * @example numberToWords(1_250_000, { script: 'cyrillic' }) // "бир миллион икки юз эллик минг"
 * @example numberToWords(1100, { formal: true }) // "bir ming bir yuz"
 * @example numberToWords(14, { apostrophe: 'ascii' }) // "o'n to'rt"
 */
export function numberToWords(n: number, options: NumberToWordsOptions = {}): string {
  return applyUzScript(intToWords(n, options.formal ?? false), options);
}

export interface MoneyToWordsOptions extends NumberToWordsOptions {
  /**
   * Valyuta: `"so'm"` — so'z bilan (`soʻm` / `сўм`), boshqa satr (`'UZS'`, `'USD'` ...) — o'zgarishsiz.
   * Default: `"so'm"`.
   */
  currency?: "so'm" | 'UZS' | (string & {});
  /**
   * Tiyin (kasr qismi, 2 raqamgacha yaxlitlanadi): `'digits'` — `"50 tiyin"`, `'words'` —
   * `"ellik tiyin"`, `false` — yozilmaydi. 0 tiyin hech qachon yozilmaydi. Default: `'digits'`.
   */
  tiyin?: 'words' | 'digits' | false;
  /** Birinchi harf katta. Default: `true`. */
  capitalize?: boolean;
}

/**
 * Pul summasini so'z bilan yozadi (hisob-faktura, shartnoma uslubi). Noto'g'ri son → `''`.
 * @example moneyToWords(1_250_000.5) // "Bir million ikki yuz ellik ming soʻm 50 tiyin"
 * @example moneyToWords(2500, { tiyin: false, capitalize: false }) // "ikki ming besh yuz soʻm"
 * @example moneyToWords(10.25, { tiyin: 'words', currency: 'UZS' }) // "Oʻn UZS yigirma besh tiyin"
 * @example moneyToWords(1000, { script: 'cyrillic' }) // "Минг сўм"
 */
export function moneyToWords(amount: number, options: MoneyToWordsOptions = {}): string {
  const { currency = "so'm", tiyin = 'digits', capitalize = true, formal = false } = options;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '';
  const abs = Math.abs(amount);
  let whole = Math.trunc(abs);
  // `toPrecision` — suzuvchi nuqta xatosini yo'qotadi: 1.005 → 1 soʻm 1 tiyin (0.4999… emas)
  let fraction = Math.round(Number(((abs - whole) * 100).toPrecision(12)));
  if (fraction === 100) {
    whole += 1;
    fraction = 0;
  }

  let text = intToWords(whole, formal);
  if (!text) return '';
  if (amount < 0 && (whole > 0 || (tiyin && fraction > 0))) text = `minus ${text}`;
  text = applyUzScript(text, options);

  const isSom = currency === "so'm" || currency === 'soʻm';
  if (isSom) text += ` ${applyUzScript('soʻm', options)}`;
  else if (currency) text += ` ${currency}`;

  if (tiyin && fraction > 0) {
    const count =
      tiyin === 'words' ? applyUzScript(intToWords(fraction, formal), options) : fraction;
    text += ` ${count} ${applyUzScript('tiyin', options)}`;
  }
  return capitalize ? capitalizeFirst(text) : text;
}

/**
 * Tartib son (raqam + defis): `"3-"`. Manfiy yoki noto'g'ri son → `''`, kasr qismi tashlanadi.
 * @example ordinal(3) // "3-"
 * @example `${ordinal(22)}oktabr` // "22-oktabr"
 */
export function ordinal(n: number): string {
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return '';
  return `${Math.trunc(n)}-`;
}

const VOWEL_END_RE = /[aeiou]$/;

/**
 * Tartib son so'z bilan. Oxirgi so'z unli bilan tugasa `-nchi` (`ikkinchi`, `yigirmanchi`),
 * aks holda `-inchi` (`uchinchi`, `toʻrtinchi`, `minginchi`). Manfiy yoki noto'g'ri son → `''`.
 * @example ordinalWords(3) // "uchinchi"
 * @example ordinalWords(21) // "yigirma birinchi"
 * @example ordinalWords(2, { script: 'cyrillic' }) // "иккинчи"
 */
export function ordinalWords(n: number, options: UzScriptOptions = {}): string {
  if (typeof n !== 'number' || n < 0) return '';
  const words = intToWords(n, false);
  if (!words) return '';
  return applyUzScript(words + (VOWEL_END_RE.test(words) ? 'nchi' : 'inchi'), options);
}
