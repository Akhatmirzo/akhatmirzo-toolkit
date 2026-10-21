import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns';

/** Sanalar oralig'i; `to` — `null` bo'lsa oraliq hali tugallanmagan */
export interface DateRangeValue {
  from: Date | null;
  to: Date | null;
}

export interface DateConstraints {
  minDate?: Date;
  maxDate?: Date;
  /** `true` qaytarsa — kunni tanlab bo'lmaydi (masalan dam olish kunlari) */
  disabledDates?: (date: Date) => boolean;
}

/** Sana cheklovlarga mos keladimi (min/max — kun aniqligida) */
export function isDateSelectable(date: Date, { minDate, maxDate, disabledDates }: DateConstraints) {
  if (minDate && differenceInCalendarDays(date, minDate) < 0) return false;
  if (maxDate && differenceInCalendarDays(date, maxDate) > 0) return false;
  return !disabledDates?.(date);
}

/** Oy butunlay ruxsat etilmagan oraliqdami (oy/yil tanlash ko'rinishi uchun) */
export function isMonthOutOfRange(month: Date, { minDate, maxDate }: DateConstraints) {
  if (minDate && differenceInCalendarDays(endOfMonth(month), minDate) < 0) return true;
  if (maxDate && differenceInCalendarDays(startOfMonth(month), maxDate) > 0) return true;
  return false;
}

export const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  a != null && b != null && isSameDay(a, b);

export function sameRange(a: DateRangeValue | null | undefined, b: DateRangeValue | null) {
  if (!a || !b) return false;
  return sameDay(a.from, b.from) && sameDay(a.to, b.to);
}

/** Bosilgan kun bo'yicha oraliqning keyingi holati */
export function nextRange(current: DateRangeValue | null | undefined, day: Date): DateRangeValue {
  const from = current?.from ?? null;
  if (!from || current?.to) return { from: day, to: null };
  return day < from ? { from: day, to: from } : { from, to: day };
}

/** Bir kunlik tanlov uchun tayyor variant */
export interface DatePreset {
  label: string;
  date: Date | ((today: Date) => Date);
}

/** Oraliq uchun tayyor variant */
export interface DateRangePreset {
  label: string;
  range: DateRangeValue | ((today: Date) => DateRangeValue);
}

export interface DatePresetLabels {
  today?: string;
  tomorrow?: string;
  inAWeek?: string;
}

export interface DateRangePresetLabels {
  today?: string;
  last7Days?: string;
  thisMonth?: string;
  lastMonth?: string;
}

export function defaultDatePresets(labels: Required<DatePresetLabels>): DatePreset[] {
  return [
    { label: labels.today, date: (t) => t },
    { label: labels.tomorrow, date: (t) => addDays(t, 1) },
    { label: labels.inAWeek, date: (t) => addDays(t, 7) },
  ];
}

export function defaultRangePresets(labels: Required<DateRangePresetLabels>): DateRangePreset[] {
  return [
    { label: labels.today, range: (t) => ({ from: t, to: t }) },
    { label: labels.last7Days, range: (t) => ({ from: addDays(t, -6), to: t }) },
    { label: labels.thisMonth, range: (t) => ({ from: startOfMonth(t), to: endOfMonth(t) }) },
    {
      label: labels.lastMonth,
      range: (t) => {
        const prev = subMonths(t, 1);
        return { from: startOfMonth(prev), to: startOfDay(endOfMonth(prev)) };
      },
    },
  ];
}

/* ---------- Yozish niqobi ---------- */

const MASK_TOKEN_RE = /yyyy|yy|MM|dd/g;

/** Faqat raqamli shablon (`dd.MM.yyyy`) uchun niqob: `__.__.____`; aks holda `null` */
export function buildMask(format: string): string | null {
  if (!/^(?:yyyy|yy|MM|dd|[^A-Za-z])+$/.test(format)) return null;
  return format.replace(MASK_TOKEN_RE, (t) => '_'.repeat(t.length));
}

/** Shablondan placeholder: `dd.MM.yyyy` → `kk.oo.yyyy` */
export function formatPlaceholder(format: string) {
  return format.replace(/d/g, 'k').replace(/M/g, 'o');
}

export const countDigits = (s: string) => s.replace(/\D/g, '').length;

/** Raqamlarni niqobga joylaydi; doimiy belgi faqat undan keyin raqam bo'lsa qo'yiladi */
export function applyMask(digits: string, mask: string) {
  let out = '';
  let i = 0;
  for (const ch of mask) {
    if (i >= digits.length) break;
    if (ch === '_') out += digits[i++];
    else out += ch;
  }
  return out;
}

/** `count` ta raqamdan keyingi kursor o'rni */
export function caretAfterDigits(text: string, count: number) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let pos = 0; pos < text.length; pos++) {
    if (/\d/.test(text[pos] ?? '')) seen++;
    if (seen === count) return pos + 1;
  }
  return text.length;
}
