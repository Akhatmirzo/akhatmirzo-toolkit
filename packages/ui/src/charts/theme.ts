/**
 * Recharts uchun umumiy uslub: ranglar faqat tokenlardan (`var(--ak-*)`), shuning uchun
 * grafiklar dark rejimda o'zi moslashadi.
 */

/** Seriyalar ranglari — ketma-ketlikda ishlating (1-seriya primary) */
export const chartColors = [
  'var(--ak-primary)',
  'var(--ak-sky-500)',
  'var(--ak-emerald-500)',
  'var(--ak-amber-500)',
  'var(--ak-rose-500)',
] as const;

/** Token nomlari: semantik (`primary`, `success` ...) yoki palitra (`sky`, `emerald` ...) */
export type ChartColorToken =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'rose';

/**
 * Seriya rangi: token nomi yoki istalgan CSS rang qiymati (masalan `var(--ak-indigo-400)`).
 * Hex yozish mumkin, lekin dark rejimga moslashmaydi — tokenlarni afzal ko'ring.
 */
export type ChartColor = ChartColorToken | (string & {});

const tokenColors: Record<ChartColorToken, string> = {
  primary: 'var(--ak-primary)',
  success: 'var(--ak-success)',
  warning: 'var(--ak-warning)',
  danger: 'var(--ak-danger)',
  info: 'var(--ak-info)',
  neutral: 'var(--ak-text-muted)',
  sky: 'var(--ak-sky-500)',
  emerald: 'var(--ak-emerald-500)',
  amber: 'var(--ak-amber-500)',
  rose: 'var(--ak-rose-500)',
};

/** Token nomini CSS qiymatga aylantiradi; berilmasa — palitradan `index` bo'yicha */
export function resolveChartColor(color: ChartColor | undefined, index = 0): string {
  if (color == null) return chartColors[index % chartColors.length]!;
  return tokenColors[color as ChartColorToken] ?? color;
}

/** O'qlar: `<XAxis {...axisProps} />` — `text-muted` 12px, chiziqlarsiz */
export const axisProps = {
  stroke: 'var(--ak-border)',
  tick: { fill: 'var(--ak-text-muted)', fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

/** To'r: `<CartesianGrid {...gridProps} />` — `border` rangida punktir, faqat gorizontal */
export const gridProps = {
  stroke: 'var(--ak-border)',
  strokeDasharray: '3 3',
  vertical: false,
} as const;

/** Kursor (hover chizig'i / ustun foni): `<Tooltip cursor={cursorProps} />` */
export const cursorProps = { stroke: 'var(--ak-border-strong)', fill: 'var(--ak-surface-muted)' };
