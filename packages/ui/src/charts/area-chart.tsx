import { formatNumber } from '@akhatmirzo/core';
import { useId } from 'react';
import {
  Area,
  CartesianGrid,
  AreaChart as RechartsAreaChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from './chart-container';
import { ChartFrame } from './chart-frame';
import { ChartTooltip } from './chart-tooltip';
import { axisProps, cursorProps, gridProps, resolveChartColor } from './theme';
import type { CartesianChartProps, ChartCurve } from './types';

export type AreaChartProps<T, K extends keyof T & string> = CartesianChartProps<T, K> & {
  /** Seriyalarni ustma-ust yig'ish. Standart — `false` */
  stacked?: boolean;
  /** Chiziq shakli. Standart — `'monotone'` */
  curve?: ChartCurve;
};

const defaultFormat = (v: number) => formatNumber(v);

/** Maydonli grafik: vaqt bo'yicha o'zgarish (tushum, foydalanuvchilar) */
export function AreaChart<T extends object, K extends keyof T & string>({
  data,
  index,
  series,
  valueFormat = defaultFormat,
  indexFormat,
  height = 280,
  legend = true,
  grid = true,
  tooltip = true,
  stacked = false,
  curve = 'monotone',
  emptyState,
  loading,
  description,
  labels,
  title,
  'aria-label': ariaLabel,
  ...props
}: AreaChartProps<T, K>) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const items = series.map((s, i) => ({
    ...s,
    name: s.label ?? s.key,
    color: resolveChartColor(s.color, i),
    gradient: `ak-area-${uid}-${i}`,
  }));
  const formatIndex = indexFormat as ((value: unknown) => string) | undefined;

  return (
    <ChartFrame
      loading={loading}
      empty={data.length === 0}
      emptyState={emptyState}
      labels={labels}
      height={height}
      legend={legend && items.map((s) => ({ value: s.name, color: s.color, dataKey: s.key }))}
      {...props}
    >
      <ChartContainer aria-label={(ariaLabel ?? title)!} description={description} height={height}>
        <RechartsAreaChart
          data={data as unknown as Record<string, unknown>[]}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          accessibilityLayer
        >
          <defs>
            {items.map((s) => (
              <linearGradient key={s.gradient} id={s.gradient} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  style={{ stopColor: s.color, stopOpacity: stacked ? 0.4 : 0.28 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: s.color, stopOpacity: stacked ? 0.1 : 0 }}
                />
              </linearGradient>
            ))}
          </defs>
          {grid && <CartesianGrid {...gridProps} />}
          <XAxis
            dataKey={index}
            {...axisProps}
            minTickGap={24}
            tickMargin={8}
            tickFormatter={formatIndex}
          />
          <YAxis {...axisProps} width="auto" tickFormatter={(v: number) => valueFormat(v)} />
          {tooltip && (
            <Tooltip
              cursor={cursorProps}
              content={<ChartTooltip format={valueFormat} labelFormat={formatIndex} />}
            />
          )}
          {items.map((s) => (
            <Area
              key={s.key}
              type={curve}
              dataKey={s.key as string}
              name={s.name}
              stackId={stacked ? 'stack' : undefined}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#${s.gradient})`}
              dot={data.length <= 2 ? { r: 4, strokeWidth: 0, fill: s.color } : false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </RechartsAreaChart>
      </ChartContainer>
    </ChartFrame>
  );
}
