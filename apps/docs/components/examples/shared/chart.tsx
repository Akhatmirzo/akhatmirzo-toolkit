'use client';

import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';

/**
 * Recharts uchun umumiy uslub: ranglar faqat tokenlardan (`var(--ak-*)`), shuning uchun
 * grafiklar dark rejimda o'zi moslashadi. Barcha namunalar shu yerdan oladi.
 */

/** Seriyalar ranglari — ketma-ketlikda ishlating (1-seriya primary) */
export const chartColors = [
  'var(--ak-primary)',
  'var(--ak-sky-500)',
  'var(--ak-emerald-500)',
  'var(--ak-amber-500)',
  'var(--ak-rose-500)',
] as const;

/** O'qlar va to'r: `<XAxis {...axisProps} />`, `<CartesianGrid {...gridProps} />` */
export const axisProps = {
  stroke: 'var(--ak-border)',
  tick: { fill: 'var(--ak-text-muted)', fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const;

export const gridProps = {
  stroke: 'var(--ak-border)',
  strokeDasharray: '3 3',
  vertical: false,
} as const;

/** Kursor (hover chizig'i / ustun foni) */
export const cursorProps = { stroke: 'var(--ak-border-strong)', fill: 'var(--ak-surface-muted)' };

/**
 * Tokenlar bilan stillangan tooltip: `<Tooltip content={<ChartTooltip format={formatMoney} />} />`.
 * `format` — qiymatni ko'rsatish (masalan `formatMoney`), `labelFormat` — sarlavha.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  format = (v) => String(v),
  labelFormat = (l) => String(l),
}: Partial<TooltipContentProps<number, string>> & {
  format?: (value: number) => ReactNode;
  labelFormat?: (label: unknown) => ReactNode;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-36 rounded-xl bg-surface-raised px-3 py-2 font-sans text-xs text-text shadow-lg">
      <p className="mb-1.5 font-medium text-text-muted">{labelFormat(label)}</p>
      <ul className="flex flex-col gap-1">
        {payload.map((item) => (
          <li key={String(item.dataKey)} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-text-muted">{item.name}</span>
            <span className="ml-auto pl-3 font-semibold tabular-nums">
              {format(Number(item.value))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
