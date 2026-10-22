import { formatNumber } from '@akhatmirzo/core';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer } from './chart-container';
import { ChartFrame } from './chart-frame';
import { ChartTooltip } from './chart-tooltip';
import { axisProps, cursorProps, gridProps, resolveChartColor } from './theme';
import type { CartesianChartProps, ChartCurve } from './types';

export type LineChartProps<T, K extends keyof T & string> = CartesianChartProps<T, K> & {
  /** Chiziq shakli. Standart — `'monotone'` */
  curve?: ChartCurve;
};

const defaultFormat = (v: number) => formatNumber(v);

/** Chiziqli grafik: bir nechta ko'rsatkichni vaqt bo'yicha solishtirish */
export function LineChart<T extends object, K extends keyof T & string>({
  data,
  index,
  series,
  valueFormat = defaultFormat,
  indexFormat,
  height = 280,
  legend = true,
  grid = true,
  tooltip = true,
  curve = 'monotone',
  emptyState,
  loading,
  description,
  labels,
  title,
  'aria-label': ariaLabel,
  ...props
}: LineChartProps<T, K>) {
  const items = series.map((s, i) => ({
    ...s,
    name: s.label ?? s.key,
    color: resolveChartColor(s.color, i),
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
        <RechartsLineChart
          data={data as unknown as Record<string, unknown>[]}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          accessibilityLayer
        >
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
            <Line
              key={s.key}
              type={curve}
              dataKey={s.key as string}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              dot={data.length <= 2 ? { r: 4, strokeWidth: 0, fill: s.color } : false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </RechartsLineChart>
      </ChartContainer>
    </ChartFrame>
  );
}
