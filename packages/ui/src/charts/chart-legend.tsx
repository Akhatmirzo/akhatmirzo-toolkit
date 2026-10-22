import type { ComponentProps, ReactNode } from 'react';
import type { LegendPayload } from 'recharts';
import { cn } from '../lib/cn';
import { useChartConfig } from './chart-container';

export interface ChartLegendItem {
  /** Ko'rsatiladigan nom */
  value: ReactNode;
  /** Belgi rangi (CSS qiymat) */
  color?: string;
  /** Seriya kaliti — `config` dan nom olish uchun */
  dataKey?: unknown;
  type?: LegendPayload['type'];
}

export interface ChartLegendProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /**
   * Elementlar. `<Legend content={<ChartLegend />} />` da Recharts o'zi beradi;
   * grafikdan tashqarida ishlatsangiz — o'zingiz bering.
   */
  payload?: readonly ChartLegendItem[];
}

/**
 * Tokenlar bilan stillangan legend: rangli nuqta + nom, sig'masa keyingi qatorga o'raladi.
 * Ildizga `className`, `ref`, `id`, `style`, `role`, `aria-*` va `data-*` o'tadi.
 */
export function ChartLegend({ payload, className, ref, ...rest }: ChartLegendProps) {
  const config = useChartConfig();
  const items = (payload ?? []).filter((item) => item.type !== 'none');
  if (items.length === 0) return null;

  // Recharts Legend tashqi props'larini (verticalAlign, layout ...) DOM'ga o'tkazmaymiz
  const domProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => /^(id|style|role)$|^(aria|data)-/.test(key)),
  );

  return (
    <ul
      data-slot="chart-legend"
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-sans text-xs text-text-muted',
        className,
      )}
      ref={ref}
      {...domProps}
    >
      {items.map((item, i) => {
        const conf = item.dataKey != null ? config[String(item.dataKey)] : undefined;
        return (
          <li
            key={`${String(item.dataKey ?? '')}-${i}`}
            className="inline-flex items-center gap-1.5"
          >
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: item.color }}
            />
            {conf?.label ?? item.value}
          </li>
        );
      })}
    </ul>
  );
}
