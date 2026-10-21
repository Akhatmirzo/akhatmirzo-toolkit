/** O'zbek apostrofining barcha uchraydigan variantlari: ʻ ʼ ‘ ’ ` ´ ' */
export const UZ_APOSTROPHES = "ʻʼ‘’`´'";

const APOSTROPHE_SET = new Set(UZ_APOSTROPHES);

/** Belgi o'zbek apostrofi variantlaridan birimi. */
export function isApostrophe(ch: string | undefined): boolean {
  return ch !== undefined && APOSTROPHE_SET.has(ch);
}

/** `'` — apostrof o'rnida turadigan belgi (ў → o', ғ → g', ъ → '). */
const CYR_TO_LAT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'x',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: "'",
  ы: 'i',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  ў: "o'",
  қ: 'q',
  ғ: "g'",
  ҳ: 'h',
};

/** `е` dan oldin kelsa, `е` → `ye` bo'ladi */
const YE_AFTER = new Set('аеёиоуэюяўыъьaeiou');

const LETTER_RE = /\p{L}/u;

function isLetter(ch: string | undefined): ch is string {
  return ch !== undefined && LETTER_RE.test(ch);
}

/** Katta-kichik harf farqi bor harf va u katta bo'lsa */
function isUpper(ch: string | undefined): boolean {
  return ch !== undefined && ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}

function isCased(ch: string | undefined): ch is string {
  return ch !== undefined && ch.toLowerCase() !== ch.toUpperCase();
}

interface Char {
  /** NFC ko'rinishi (ajratilgan `у`+U+0306 → `ў`) */
  ch: string;
  /** Asl matndagi bo'lak */
  src: string;
  index: number;
}

const MARK_RE = /\p{M}/u;

/**
 * Satrni "asos + birikuvchi belgilar" bo'laklariga ajratadi, har birini alohida NFC qiladi
 * va asl UTF-16 indeksini saqlaydi (butun satrni NFC qilish indekslarni siljitadi).
 */
function toChars(s: string): Char[] {
  const out: Char[] = [];
  let index = 0;
  for (const cp of s) {
    const last = out[out.length - 1];
    if (last && MARK_RE.test(cp)) {
      last.src += cp;
    } else {
      out.push({ ch: cp, src: cp, index });
    }
    index += cp.length;
  }
  for (const c of out) if (c.src.length > 1) c.ch = c.src.normalize('NFC');
  return out;
}

/** Ko'p harfli natijaga katta harfni qo'llaydi: so'z butunlay katta bo'lsa — "SH", aks holda "Sh". */
function applyCase(out: string, src: string, prev: string | undefined, next: string | undefined) {
  if (!isUpper(src) || out === '') return out;
  if (out.length === 1) return out.toUpperCase();
  const allCaps = isCased(next) ? isUpper(next) : isCased(prev) ? isUpper(prev) : false;
  return allCaps ? out.toUpperCase() : out.charAt(0).toUpperCase() + out.slice(1);
}

/**
 * Kirill → lotin o'girishning yadrosi. Har bir asl belgi uchun `emit(natija, indeks, uzunlik)`
 * chaqiriladi — indekslar xaritasini qurish (qidiruvda ajratish) uchun kerak.
 * `contextualYe: false` — `е` doim `e` (qidiruv kaliti: so'rov bo'lak, uning boshi so'z boshi emas).
 * @internal
 */
export function walkCyrToLat(
  s: string,
  apostrophe: string,
  emit: (out: string, index: number, length: number) => void,
  contextualYe = true,
): void {
  const chars = toChars(s);
  for (let i = 0; i < chars.length; i++) {
    const { ch, src, index } = chars[i]!;
    const lower = ch.toLowerCase();
    const prev = chars[i - 1]?.ch;
    const next = chars[i + 1]?.ch;
    let out: string | undefined;
    if (lower === 'е' && contextualYe) {
      const atWordStart = !isLetter(prev);
      out = atWordStart || YE_AFTER.has(prev.toLowerCase()) ? 'ye' : 'e';
    } else {
      out = lower === 'е' ? 'e' : CYR_TO_LAT[lower];
    }
    if (out === undefined) {
      emit(src, index, src.length);
      continue;
    }
    out = out.replace("'", apostrophe);
    emit(applyCase(out, ch, prev, next), index, src.length);
  }
}

export interface TranslitOptions {
  /** ў, ғ, ъ uchun ishlatiladigan apostrof belgisi. Standart: `'` */
  apostrophe?: string;
}

/**
 * O'zbek kirill matnini lotinga o'giradi (katta harflar saqlanadi). Kirill bo'lmagan belgilar o'zgarmaydi.
 * @example cyrToLat('Шаҳар') // 'Shahar'
 * @example cyrToLat('ЎЗБЕКИСТОН') // "O'ZBEKISTON"
 * @example cyrToLat('Ғузор', { apostrophe: 'ʻ' }) // 'Gʻuzor'
 */
export function cyrToLat(s: string, options: TranslitOptions = {}): string {
  const apostrophe = options.apostrophe ?? "'";
  let result = '';
  walkCyrToLat(s, apostrophe, (out) => {
    result += out;
  });
  return result;
}

const LAT_TO_CYR: Record<string, string> = {
  a: 'а',
  b: 'б',
  c: 'ц',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'ҳ',
  i: 'и',
  j: 'ж',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  q: 'қ',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'в',
  w: 'в',
  x: 'х',
  y: 'й',
  z: 'з',
};

const LAT_DIGRAPHS: Record<string, string> = {
  sh: 'ш',
  ch: 'ч',
  yo: 'ё',
  yu: 'ю',
  ya: 'я',
  ye: 'е',
};

/**
 * O'zbek lotin matnini kirillga o'giradi. `o'`, `g'` uchun barcha apostrof variantlari qabul qilinadi
 * (ʻ ʼ ‘ ’ ` ´ '); boshqa joydagi apostrof → `ъ` (tutuq belgisi). So'z boshidagi `e` → `э`.
 * @example latToCyr("G'uzor") // 'Ғузор'
 * @example latToCyr('SHAHAR') // 'ШАҲАР'
 * @example latToCyr("yo'l") // 'йўл'
 */
export function latToCyr(s: string): string {
  const chars = [...s];
  let result = '';
  const at = (k: number) => chars[k]?.toLowerCase();

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const lower = ch.toLowerCase();
    const upper = isUpper(ch);
    const nextUpper = isUpper(chars[i + 1]);
    const caseOf = (cyr: string) => (upper ? cyr.toUpperCase() : cyr);

    // o' / g'
    if ((lower === 'o' || lower === 'g') && isApostrophe(chars[i + 1])) {
      result += caseOf(lower === 'o' ? 'ў' : 'ғ');
      i++;
      continue;
    }
    // s'h → сҳ (Is'hoq), apostrof faqat ajratuvchi
    if (lower === 's' && isApostrophe(chars[i + 1]) && at(i + 2) === 'h') {
      result += caseOf('с');
      i++;
      continue;
    }
    const pair = lower + (at(i + 1) ?? '');
    const digraph = LAT_DIGRAPHS[pair];
    // yo' → йў (yo'l), ya'ni `y` + `o'`
    const yoApostrophe = pair === 'yo' && isApostrophe(chars[i + 2]);
    if (digraph && !yoApostrophe) {
      result += upper || nextUpper ? caseOf(digraph) : digraph;
      i++;
      continue;
    }
    if (isApostrophe(ch)) {
      result += isLetter(chars[i - 1]) && isLetter(chars[i + 1]) ? 'ъ' : ch;
      continue;
    }
    if (lower === 'e' && !isLetter(chars[i - 1])) {
      result += caseOf('э');
      continue;
    }
    const cyr = LAT_TO_CYR[lower];
    result += cyr === undefined ? ch : caseOf(cyr);
  }
  return result;
}
