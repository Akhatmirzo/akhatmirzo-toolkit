export interface FormatNumberOptions {
  /** Kasr qismidagi raqamlar soni (0–20). Berilmasa — son qanday bo'lsa shunday. */
  decimals?: number;
  /** Minglik ajratuvchi. Default: oddiy bo'sh joy `' '`. */
  separator?: string;
  /** Kasr ajratuvchisi. Default: `'.'`. */
  decimalMark?: string;
}

const plain = (n: number, decimals: number | undefined): string =>
  n.toLocaleString('en-US', {
    useGrouping: false,
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 20,
  });

/**
 * Sonni minglik ajratuvchi bilan formatlaydi (locale'ga bog'liq emas).
 * Noto'g'ri son (`NaN`, `Infinity`) → `''`.
 * @example formatNumber(1250000.5, { decimals: 2 }) // "1 250 000.50"
 */
export function formatNumber(n: number, options: FormatNumberOptions = {}): string {
  const { separator = ' ', decimalMark = '.' } = options;
  if (typeof n !== 'number' || !Number.isFinite(n)) return '';
  const decimals =
    options.decimals === undefined
      ? undefined
      : Math.min(20, Math.max(0, Math.trunc(options.decimals)));
  const raw = plain(Math.abs(n), decimals);
  const [int = '0', frac] = raw.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const isZero = /^[0.]*$/.test(raw);
  return (n < 0 && !isZero ? '-' : '') + grouped + (frac ? decimalMark + frac : '');
}

export type MoneyCurrency = "so'm" | 'UZS' | false;

export interface FormatMoneyOptions extends Omit<FormatNumberOptions, 'decimals'> {
  /** Valyuta belgisi; `false` — belgisiz. Default: `"so'm"`. */
  currency?: MoneyCurrency;
  /** Default: `0`. */
  decimals?: number;
}

/**
 * Pul summasini formatlaydi.
 * @example formatMoney(1250000) // "1 250 000 so'm"
 * @example formatMoney(99.5, { currency: 'UZS', decimals: 2 }) // "99.50 UZS"
 */
export function formatMoney(n: number, options: FormatMoneyOptions = {}): string {
  const { currency = "so'm", decimals = 0, ...rest } = options;
  const value = formatNumber(n, { ...rest, decimals });
  if (!value) return '';
  return currency ? `${value} ${currency}` : value;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const;

/**
 * Fayl hajmini o'qiladigan ko'rinishga keltiradi (1 KB = 1024 B). Ortiqcha nollar tashlanadi.
 * Manfiy yoki noto'g'ri qiymat → `''`.
 * @example formatFileSize(3565158) // "3.4 MB"
 */
export function formatFileSize(bytes: number, decimals = 1): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return '';
  const digits = Math.min(20, Math.max(0, Math.trunc(decimals)));
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  let unit = 0;
  let value = bytes;
  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  let text = value.toFixed(digits);
  // 1023.97 KB → "1024.0" bo'lib qolmasligi uchun keyingi birlikka o'tamiz
  if (Number(text) >= 1024 && unit < SIZE_UNITS.length - 1) {
    unit++;
    text = (value / 1024).toFixed(digits);
  }
  if (text.includes('.')) text = text.replace(/\.?0+$/, '');
  return `${text} ${SIZE_UNITS[unit]}`;
}
