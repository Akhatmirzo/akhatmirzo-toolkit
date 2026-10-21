/** Oylar nomlari (Yanvar … Dekabr). */
export const MONTHS_UZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
] as const;

/** Oylarning qisqa nomlari (Iyun/Iyul farqlanishi uchun "Iyn"/"Iyl"). */
export const MONTHS_UZ_SHORT = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'Iyn',
  'Iyl',
  'Avg',
  'Sen',
  'Okt',
  'Noy',
  'Dek',
] as const;

/** Hafta kunlari — DUSHANBADAN boshlab. Indeks uchun `weekdayIndex()` dan foydalaning. */
export const WEEKDAYS_UZ = [
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
  'Yakshanba',
] as const;

/** Hafta kunlarining qisqa nomlari — dushanbadan. */
export const WEEKDAYS_UZ_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'] as const;

export type DateInput = Date | number | string | null | undefined;

const MS_MINUTE = 60_000;
const MS_HOUR = 3_600_000;
const MS_DAY = 86_400_000;

function toDate(value: DateInput): Date | null {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Hafta kuni indeksi dushanbadan: 0 = Dushanba … 6 = Yakshanba.
 * @example WEEKDAYS_UZ[weekdayIndex(new Date(2026, 9, 21))] // "Chorshanba"
 */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

const TOKEN_RE = /\[([^\]]*)]|yyyy|yy|MMMM|MMM|MM|M|dd|d|HH|H|mm|m|ss|s|EEEE|EEE/g;

/**
 * Sanani shablon bo'yicha formatlaydi (mahalliy vaqt). Noto'g'ri sana → `''`.
 * Tokenlar: `d dd M MM MMM MMMM yy yyyy H HH m mm ss EEE EEEE`; `[...]` ichidagi matn o'zgarmaydi.
 * @example formatDate(new Date(2026, 9, 21), 'd MMMM yyyy, EEEE') // "21 Oktabr 2026, Chorshanba"
 */
export function formatDate(date: DateInput, pattern = 'dd.MM.yyyy'): string {
  const d = toDate(date);
  if (!d) return '';
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const wd = weekdayIndex(d);
  return pattern.replace(TOKEN_RE, (token: string, literal: string | undefined) => {
    if (literal !== undefined) return literal;
    switch (token) {
      case 'yyyy':
        return pad(year, 4);
      case 'yy':
        return pad(Math.abs(year) % 100);
      case 'MMMM':
        return MONTHS_UZ[month] ?? '';
      case 'MMM':
        return MONTHS_UZ_SHORT[month] ?? '';
      case 'MM':
        return pad(month + 1);
      case 'M':
        return String(month + 1);
      case 'dd':
        return pad(day);
      case 'd':
        return String(day);
      case 'HH':
        return pad(d.getHours());
      case 'H':
        return String(d.getHours());
      case 'mm':
        return pad(d.getMinutes());
      case 'm':
        return String(d.getMinutes());
      case 'ss':
        return pad(d.getSeconds());
      case 's':
        return String(d.getSeconds());
      case 'EEEE':
        return WEEKDAYS_UZ[wd] ?? '';
      default: // EEE
        return WEEKDAYS_UZ_SHORT[wd] ?? '';
    }
  });
}

type Part = 'y' | 'yy' | 'M' | 'MMM' | 'MMMM' | 'd' | 'H' | 'm' | 's' | 'E';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const namesRe = (names: readonly string[]) =>
  [...names]
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join('|');

const PARSE_TOKENS: Record<string, { re: string; part: Part }> = {
  yyyy: { re: '\\d{4}', part: 'y' },
  yy: { re: '\\d{2}', part: 'yy' },
  MMMM: { re: namesRe(MONTHS_UZ), part: 'MMMM' },
  MMM: { re: namesRe(MONTHS_UZ_SHORT), part: 'MMM' },
  MM: { re: '\\d{2}', part: 'M' },
  M: { re: '\\d{1,2}', part: 'M' },
  dd: { re: '\\d{2}', part: 'd' },
  d: { re: '\\d{1,2}', part: 'd' },
  HH: { re: '\\d{2}', part: 'H' },
  H: { re: '\\d{1,2}', part: 'H' },
  mm: { re: '\\d{2}', part: 'm' },
  m: { re: '\\d{1,2}', part: 'm' },
  ss: { re: '\\d{2}', part: 's' },
  s: { re: '\\d{1,2}', part: 's' },
  EEEE: { re: namesRe(WEEKDAYS_UZ), part: 'E' },
  EEE: { re: namesRe(WEEKDAYS_UZ_SHORT), part: 'E' },
};

const findName = (names: readonly string[], value: string) =>
  names.findIndex((n) => n.toLowerCase() === value.toLowerCase());

/**
 * Matnni shablon bo'yicha sanaga aylantiradi (mahalliy vaqt). Mos kelmasa yoki sana mavjud
 * bo'lmasa (`31.02.2026`) → `null`. Oy nomlari katta-kichik harfga sezgir emas; `yy` → 20yy.
 * @example parseDate('21.10.2026') // new Date(2026, 9, 21)
 * @example parseDate('5 oktabr 2026', 'd MMMM yyyy') // new Date(2026, 9, 5)
 */
export function parseDate(input: string | null | undefined, pattern = 'dd.MM.yyyy'): Date | null {
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (!text) return null;

  const parts: Part[] = [];
  let source = '';
  let last = 0;
  for (const match of pattern.matchAll(TOKEN_RE)) {
    const [token, literal] = match;
    source += escapeRe(pattern.slice(last, match.index));
    if (literal !== undefined) {
      source += escapeRe(literal);
    } else {
      const def = PARSE_TOKENS[token];
      if (!def) return null;
      source += `(${def.re})`;
      parts.push(def.part);
    }
    last = match.index + token.length;
  }
  source += escapeRe(pattern.slice(last));

  const m = new RegExp(`^${source}$`, 'i').exec(text);
  if (!m) return null;

  let year: number | undefined;
  let month = 0;
  let day = 1;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  parts.forEach((part, i) => {
    const raw = m[i + 1] ?? '';
    const num = Number(raw);
    if (part === 'y') year = num;
    else if (part === 'yy') year = 2000 + num;
    else if (part === 'M') month = num - 1;
    else if (part === 'MMMM') month = findName(MONTHS_UZ, raw);
    else if (part === 'MMM') month = findName(MONTHS_UZ_SHORT, raw);
    else if (part === 'd') day = num;
    else if (part === 'H') hours = num;
    else if (part === 'm') minutes = num;
    else if (part === 's') seconds = num;
  });
  if (year === undefined) return null;
  if (month < 0 || month > 11 || day < 1 || hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }
  const date = new Date(2000, month, day, hours, minutes, seconds);
  date.setFullYear(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Nisbiy vaqt: "hozirgina", "5 daqiqa oldin", "kecha", "3 kun oldin", "2 haftadan keyin" ...
 * Bir daqiqadan kam farq — "hozirgina"; sutkadan ko'p bo'lsa kunlar kalendar bo'yicha sanaladi.
 * Noto'g'ri sana → `''`.
 * @example timeAgo(Date.now() - 5 * 60_000) // "5 daqiqa oldin"
 */
export function timeAgo(date: DateInput, now: DateInput = new Date()): string {
  const d = toDate(date);
  const ref = toDate(now);
  if (!d || !ref) return '';
  const diff = ref.getTime() - d.getTime();
  const past = diff >= 0;
  const abs = Math.abs(diff);
  const say = (n: number, unit: string) => (past ? `${n} ${unit} oldin` : `${n} ${unit}dan keyin`);

  if (abs < MS_MINUTE) return 'hozirgina';
  if (abs < MS_HOUR) return say(Math.floor(abs / MS_MINUTE), 'daqiqa');
  if (abs < MS_DAY) return say(Math.floor(abs / MS_HOUR), 'soat');

  // DST tufayli sutka 23/25 soat bo'lishi mumkin — round
  const days = Math.max(1, Math.abs(Math.round((startOfDay(ref) - startOfDay(d)) / MS_DAY)));
  if (days === 1) return past ? 'kecha' : 'ertaga';
  if (days < 7) return say(days, 'kun');
  if (days < 30) return say(Math.floor(days / 7), 'hafta');
  if (days >= 365) return say(Math.floor(days / 365), 'yil');
  return say(Math.min(11, Math.max(1, Math.round(days / 30.4375))), 'oy');
}
