import type { UzScript } from '../text/script';
import { latToCyr } from '../text/translit';
import {
  MONTHS_UZ,
  MONTHS_UZ_SHORT,
  WEEKDAYS_UZ,
  toDate,
  weekdayIndex,
  type DateInput,
} from './date';

// Kirill oy nomlari `latToCyr` bilan olinmaydi: imloda ular ruscha shaklda (`июнь`, `октябрь`).
const MONTHS_CYR = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];
const MONTHS_CYR_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

export type DateUzStyle = 'long' | 'full' | 'short' | 'dayMonth' | 'monthYear';

export interface FormatDateUzOptions {
  /**
   * - `'long'` (default) — `"22-oktabr, 2026-yil"`
   * - `'full'` — `"2026-yil 22-oktabr, payshanba"`
   * - `'short'` — `"22-okt, 2026"`
   * - `'dayMonth'` — `"22-oktabr"`
   * - `'monthYear'` — `"oktabr, 2026-yil"`
   */
  style?: DateUzStyle;
  /** Oxiriga vaqt qo'shiladi: `", 14:30"`. Default: `false`. */
  time?: boolean;
  /** Natija alifbosi. Default: `'latin'`. */
  script?: UzScript;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

interface Parts {
  day: string;
  month: string;
  year: string;
}

/** Sana bo'laklari so'ralgan alifboda: `"22-oktabr"`, `"oktabr"`, `"2026-yil"` (yoki qisqa). */
function partsOf(d: Date, short: boolean, cyr: boolean): Parts {
  const m = d.getMonth();
  const month = cyr
    ? (short ? MONTHS_CYR_SHORT : MONTHS_CYR)[m]!
    : (short ? MONTHS_UZ_SHORT : MONTHS_UZ)[m]!.toLowerCase();
  const year = String(d.getFullYear());
  return {
    day: `${d.getDate()}-${month}`,
    month,
    year: short ? year : `${year}-${cyr ? 'йил' : 'yil'}`,
  };
}

/**
 * Sanani o'zbek imlosi bo'yicha yozadi: oy nomi kichik harf bilan, kun va yil defis bilan
 * (`22-oktabr`, `2026-yil`). Mahalliy vaqt. Noto'g'ri sana → `''`.
 * Mavjud `formatDate` / `MONTHS_UZ` (bosh harfli nomlar) o'zgarmaydi.
 * @example formatDateUz(new Date(2026, 9, 22)) // "22-oktabr, 2026-yil"
 * @example formatDateUz(new Date(2026, 9, 22), { style: 'full' }) // "2026-yil 22-oktabr, payshanba"
 * @example formatDateUz(new Date(2026, 9, 22, 14, 30), { time: true }) // "22-oktabr, 2026-yil, 14:30"
 * @example formatDateUz(new Date(2026, 9, 22), { script: 'cyrillic' }) // "22-октябрь, 2026-йил"
 */
export function formatDateUz(date: DateInput, options: FormatDateUzOptions = {}): string {
  const d = toDate(date);
  if (!d) return '';
  const { style = 'long', time = false } = options;
  const cyr = options.script === 'cyrillic';
  const p = partsOf(d, style === 'short', cyr);

  let text: string;
  switch (style) {
    case 'full': {
      const weekday = WEEKDAYS_UZ[weekdayIndex(d)]!.toLowerCase();
      text = `${p.year} ${p.day}, ${cyr ? latToCyr(weekday) : weekday}`;
      break;
    }
    case 'dayMonth':
      text = p.day;
      break;
    case 'monthYear':
      text = `${p.month}, ${p.year}`;
      break;
    default: // long, short
      text = `${p.day}, ${p.year}`;
  }
  return time ? `${text}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}` : text;
}

export interface FormatDateRangeOptions {
  /** `'long'` (default) — `"20–22-oktabr, 2026-yil"`, `'short'` — `"20–22-okt, 2026"`. */
  style?: 'long' | 'short';
  /** Natija alifbosi. Default: `'latin'`. */
  script?: UzScript;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Sanalar oralig'i, takrorlanmaydigan qilib: bir oy ichida — `"20–22-oktabr, 2026-yil"`, bir yil
 * ichida — `"30-sentabr – 2-oktabr, 2026-yil"`, yillar farq qilsa — ikkalasi to'liq. Bir kun bo'lsa —
 * bitta sana. `start > end` bo'lsa, o'rni almashtiriladi. Noto'g'ri sana → `''`.
 * @example formatDateRange(new Date(2026, 9, 20), new Date(2026, 9, 22)) // "20–22-oktabr, 2026-yil"
 * @example formatDateRange(new Date(2026, 8, 30), new Date(2026, 9, 2)) // "30-sentabr – 2-oktabr, 2026-yil"
 */
export function formatDateRange(
  start: DateInput,
  end: DateInput,
  options: FormatDateRangeOptions = {},
): string {
  let a = toDate(start);
  let b = toDate(end);
  if (!a || !b) return '';
  if (a.getTime() > b.getTime()) [a, b] = [b, a];
  const { style = 'long', script } = options;
  if (sameDay(a, b)) return formatDateUz(a, { style, script });

  const short = style === 'short';
  const cyr = script === 'cyrillic';
  const pa = partsOf(a, short, cyr);
  const pb = partsOf(b, short, cyr);
  if (a.getFullYear() !== b.getFullYear()) return `${pa.day}, ${pa.year} – ${pb.day}, ${pb.year}`;
  if (a.getMonth() !== b.getMonth()) return `${pa.day} – ${pb.day}, ${pb.year}`;
  return `${a.getDate()}–${pb.day}, ${pb.year}`;
}

export interface FormatDurationOptions {
  /** Nechta eng katta birlik ko'rsatiladi (1–4). Default: `2`. */
  units?: number;
  /** `'long'` (default) — `"2 soat 15 daqiqa"`, `'short'` — `"2 soat 15 daq"`, `"45 s"`. */
  style?: 'long' | 'short';
  /** Natija alifbosi. Default: `'latin'`. */
  script?: UzScript;
}

const DURATION_UNITS = [
  { ms: 86_400_000, long: 'kun', short: 'kun' },
  { ms: 3_600_000, long: 'soat', short: 'soat' },
  { ms: 60_000, long: 'daqiqa', short: 'daq' },
  { ms: 1000, long: 'soniya', short: 's' },
] as const;

/**
 * Davomiylik (millisoniyada) so'z bilan: birliklar — kun, soat, daqiqa, soniya. Eng katta noldan
 * farqli birlikdan boshlab `units` ta ketma-ket birlik olinadi, nol qiymatlilari tashlanadi,
 * qoldiq kesiladi (yaxlitlanmaydi). `< 1 s` → `"0 soniya"`. Manfiy yoki noto'g'ri son → `''`.
 * @example formatDuration(8_100_000) // "2 soat 15 daqiqa"
 * @example formatDuration(90_061_000, { units: 3 }) // "1 kun 1 soat 1 daqiqa"
 * @example formatDuration(45_000, { style: 'short' }) // "45 s"
 * @example formatDuration(8_100_000, { script: 'cyrillic' }) // "2 соат 15 дақиқа"
 */
export function formatDuration(ms: number, options: FormatDurationOptions = {}): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms < 0) return '';
  const { style = 'long' } = options;
  const units = Math.min(4, Math.max(1, Math.trunc(options.units ?? 2) || 1));
  const tr = (s: string) => (options.script === 'cyrillic' ? latToCyr(s) : s);

  let rest = Math.floor(ms / 1000) * 1000;
  const values = DURATION_UNITS.map((u) => {
    const v = Math.floor(rest / u.ms);
    rest -= v * u.ms;
    return v;
  });
  const first = values.findIndex((v) => v > 0);
  if (first === -1) return `0 ${tr(DURATION_UNITS[3][style])}`;

  const out: string[] = [];
  for (let i = first; i < Math.min(first + units, DURATION_UNITS.length); i++) {
    if (values[i]! > 0) out.push(`${values[i]} ${tr(DURATION_UNITS[i]![style])}`);
  }
  return out.join(' ');
}
