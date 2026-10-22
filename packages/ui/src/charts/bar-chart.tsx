import { formatNumber } from '@akhatmirzo/core';
import { Bar, CartesianGrid, BarChart as RechartsBarChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from './chart-container';
import { ChartFrame } from './chart-frame';
import { ChartTooltip } from './chart-tooltip';
import { axisProps, cursorProps, gridProps, resolveChartColor } from './theme';
import type { CartesianChartProps } from './types';

/**
 * Ustunlar yo'nalishi (ko'rinishga qarab): `vertical` — tik ustunlar, `horizontal` — yotiq
 * chiziqlar (uzun kategoriya nomlari uchun). Recharts'ning `layout` prop'i bilan adashmaslik
 * uchun ataylab boshqa nom: Recharts'da `layout="vertical"` aksincha yotiq chiziqlar beradi.
 */
export type BarChartOrientation = 'vertical' | 'horizontal';

export type BarChartProps<T, K extends keyof T & string> = CartesianChartProps<T, K> & {
  /** Seriyalarni bitta ustunga yig'ish. Standart — `false` */
  stacked?: boolean;
  /** Ustunlar yo'nalishi. Standart — `'vertical'` (tik ustunlar); `'horizontal'` — yotiq chiziqlar */
  orientation?: BarChartOrientation;
};

const defaultFormat = (v: number) => formatNumber(v);
const RADIUS = 6;

/** Ustunli grafik: kategoriyalar yoki davrlarni solishtirish */
export function BarChart<T extends object, K extends keyof T & string>({
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
  orientation = 'vertical',
  emptyState,
  loading,
  description,
  labels,
  title,
  'aria-label': ariaLabel,
  ...props
}: BarChartProps<T, K>) {
  const horizontal = orientation === 'horizontal';
  const items = series.map((s, i) => ({
    ...s,
    name: s.label ?? s.key,
    color: resolveChartColor(s.color, i),
  }));
  const formatIndex = indexFormat as ((value: unknown) => string) | undefined;
  const formatValue = (v: number) => valueFormat(v);
  // Yumaloq burchak faqat ustun uchida (yig'ilganda — eng ustki seriyada)
  const radiusFor = (i: number): [number, number, number, number] => {
    const r = !stacked || i === items.length - 1 ? RADIUS : 0;
    return horizontal ? [0, r, r, 0] : [r, r, 0, 0];
  };

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
        <RechartsBarChart
          data={data as unknown as Record<string, unknown>[]}
          // Recharts `layout` — o'qlar joylashuvi: yotiq chiziqlar uchun `vertical`
          layout={horizontal ? 'vertical' : 'horizontal'}
          barGap={4}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          accessibilityLayer
        >
          {grid && <CartesianGrid {...gridProps} vertical={horizontal} horizontal={!horizontal} />}
          {horizontal ? (
            <>
              <XAxis type="number" {...axisProps} tickFormatter={formatValue} />
              <YAxis
                type="category"
                dataKey={index}
                {...axisProps}
                width="auto"
                tickFormatter={formatIndex}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={index}
                {...axisProps}
                minTickGap={8}
                tickMargin={8}
                tickFormatter={formatIndex}
              />
              <YAxis {...axisProps} width="auto" tickFormatter={formatValue} />
            </>
          )}
          {tooltip && (
            <Tooltip
              cursor={cursorProps}
              content={<ChartTooltip format={valueFormat} labelFormat={formatIndex} />}
            />
          )}
          {items.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key as string}
              name={s.name}
              fill={s.color}
              stackId={stacked ? 'stack' : undefined}
              radius={radiusFor(i)}
              maxBarSize={32}
            />
          ))}
        </RechartsBarChart>
      </ChartContainer>
    </ChartFrame>
  );
}
