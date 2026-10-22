import { formatNumber } from '@akhatmirzo/core';
import type { ReactNode } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartContainer } from './chart-container';
import { ChartFrame } from './chart-frame';
import { ChartTooltip } from './chart-tooltip';
import { resolveChartColor, type ChartColor } from './theme';
import type { ChartRootProps, ChartStateProps } from './types';

export type DonutChartProps<
  T,
  K extends keyof T & string,
  V extends keyof T & string,
> = ChartRootProps &
  ChartStateProps & {
    /** Ma'lumotlar: `[{ name: 'Oziq-ovqat', total: 4200000 }, ...]` */
    data: readonly T[];
    /** Bo'lak nomi maydoni */
    index: K;
    /** Bo'lak qiymati (raqam) maydoni */
    value: V;
    /** Bo'laklar ranglari, ketma-ket. Standart — `chartColors` */
    colors?: readonly ChartColor[];
    /** Qiymat ko'rinishi — tooltip, legend va markaz. Standart — `formatNumber` */
    valueFormat?: (value: number) => string;
    /** Nom ko'rinishi */
    indexFormat?: (value: T[K]) => string;
    /** Markazdagi izoh (masalan "Jami") */
    centerLabel?: ReactNode;
    /** Markazdagi qiymat. Standart — `valueFormat(jami)`; `null` — ko'rsatilmaydi */
    centerValue?: ReactNode;
    /** Legend. Standart — `true` */
    legend?: boolean;
    /** Tooltip. Standart — `true` */
    tooltip?: boolean;
  };

const defaultFormat = (v: number) => formatNumber(v);

/** Halqa grafigi: butunning qismlari (toifalar bo'yicha ulush) */
export function DonutChart<
  T extends object,
  K extends keyof T & string,
  V extends keyof T & string,
>({
  data,
  index,
  value,
  colors,
  valueFormat = defaultFormat,
  indexFormat,
  centerLabel,
  centerValue,
  height = 280,
  legend = true,
  tooltip = true,
  emptyState,
  loading,
  description,
  labels,
  title,
  'aria-label': ariaLabel,
  ...props
}: DonutChartProps<T, K, V>) {
  const slices = data.map((row, i) => {
    const raw = row[index];
    return {
      name: indexFormat ? indexFormat(raw) : String(raw),
      value: Number(row[value]) || 0,
      color: resolveChartColor(colors?.[i % colors.length], i),
    };
  });
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const center = centerValue === undefined ? valueFormat(total) : centerValue;

  return (
    <ChartFrame
      loading={loading}
      empty={data.length === 0 || total === 0}
      emptyState={emptyState}
      labels={labels}
      height={height}
      legend={legend && slices.map((s) => ({ value: s.name, color: s.color }))}
      {...props}
    >
      <div className="relative">
        <ChartContainer
          aria-label={(ariaLabel ?? title)!}
          description={description}
          height={height}
        >
          <PieChart accessibilityLayer>
            {tooltip && <Tooltip content={<ChartTooltip format={valueFormat} hideLabel />} />}
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
            >
              {slices.map((s, i) => (
                <Cell key={i} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        {(centerLabel != null || center != null) && (
          <div
            data-slot="chart-center"
            className="pointer-events-none absolute inset-0 grid place-content-center text-center"
          >
            {centerLabel != null && <span className="text-xs text-text-muted">{centerLabel}</span>}
            {center != null && (
              <span className="text-lg font-bold text-text tabular-nums">{center}</span>
            )}
          </div>
        )}
      </div>
    </ChartFrame>
  );
}
