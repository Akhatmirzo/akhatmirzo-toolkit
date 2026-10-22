import { formatNumber } from '@akhatmirzo/core';
import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { cn } from '../lib/cn';
import { useChartConfig } from './chart-container';

export type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  /** Qiymat ko'rinishi (masalan `formatMoney`). Standart — `formatNumber` */
  format?: (value: number) => ReactNode;
  /** Sarlavha (x o'qi qiymati) ko'rinishi */
  labelFormat?: (label: unknown) => ReactNode;
  /** Sarlavhani yashirish (masalan, doiraviy grafikda) */
  hideLabel?: boolean;
  className?: string;
};

/**
 * Tokenlar bilan stillangan tooltip: `<Tooltip content={<ChartTooltip format={formatMoney} />} />`.
 * Seriya nomi `ChartContainer` `config`idagi `label` dan, bo'lmasa Recharts `name` dan olinadi.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  format = (v) => formatNumber(v),
  labelFormat = (l) => String(l),
  hideLabel = false,
  className,
}: ChartTooltipProps) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;
  const showLabel = !hideLabel && label != null && label !== '';

  return (
    <div
      data-slot="chart-tooltip"
      className={cn(
        'min-w-36 rounded-xl bg-surface-raised px-3 py-2 font-sans text-xs text-text shadow-lg',
        className,
      )}
    >
      {showLabel && <p className="mb-1.5 font-medium text-text-muted">{labelFormat(label)}</p>}
      <ul className="flex flex-col gap-1">
        {payload.map((item, i) => {
          const conf = config[String(item.dataKey)] ?? config[String(item.name)];
          return (
            <li key={`${String(item.dataKey)}-${i}`} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color ?? item.payload?.fill }}
              />
              <span className="text-text-muted">{conf?.label ?? item.name}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums">
                {format(Number(item.value))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
