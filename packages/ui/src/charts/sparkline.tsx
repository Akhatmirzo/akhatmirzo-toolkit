import { useId, type ComponentProps } from 'react';
import { Area, AreaChart as RechartsAreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/cn';
import type { ChartA11yProps } from './chart-container';
import { resolveChartColor, type ChartColor } from './theme';
import type { ChartCurve } from './types';

/** Bezak sifatida (yonida qiymat matn bilan berilgan bo'lsa) — `aria-hidden` */
type SparklineA11yProps = ChartA11yProps | { 'aria-hidden': true | 'true'; title?: never };

export type SparklineProps = Omit<
  ComponentProps<'div'>,
  'title' | 'aria-label' | 'aria-hidden' | 'role' | 'children' | 'color'
> &
  SparklineA11yProps & {
    /** Qiymatlar ketma-ketligi */
    data: readonly number[];
    /** Token nomi yoki CSS rang. Standart — `'primary'` */
    color?: ChartColor;
    /** `area` — chiziq ostida yumshoq gradient, `line` — faqat chiziq. Standart — `'area'` */
    variant?: 'area' | 'line';
    /** Chiziq shakli. Standart — `'monotone'` */
    curve?: ChartCurve;
    /** Balandlik, px. Standart — `36` */
    height?: number;
  };

/**
 * Kichik trend chizig'i (KPI kartalar, jadval kataklari): o'qlar, to'r va tooltip'siz.
 * Nom (`aria-label`) beriladi yoki, qiymat yonida matn bilan bo'lsa, `aria-hidden`.
 */
export function Sparkline({
  data,
  color = 'primary',
  variant = 'area',
  curve = 'monotone',
  height = 36,
  className,
  style,
  ...props
}: SparklineProps) {
  const {
    title,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...rest
  } = props as typeof props & { title?: string; 'aria-label'?: string; 'aria-hidden'?: unknown };
  const gradientId = 'ak-spark' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const stroke = resolveChartColor(color);
  const points = data.map((v, i) => ({ i, v }));
  const decorative = ariaHidden === true || ariaHidden === 'true';

  return (
    <div
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : (ariaLabel ?? title)}
      aria-hidden={decorative || undefined}
      data-slot="sparkline"
      className={cn('w-full min-w-0', className)}
      style={{ height, ...style }}
      {...rest}
    >
      {points.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart
            data={points}
            margin={{ top: 2, bottom: 2, left: 0, right: 0 }}
            // Tooltip yo'q — klaviatura qatlami foydasiz fokus to'xtashini qo'shardi
            accessibilityLayer={false}
          >
            {variant === 'area' && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0.25 }} />
                  <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} />
                </linearGradient>
              </defs>
            )}
            <Area
              type={curve}
              dataKey="v"
              stroke={stroke}
              strokeWidth={1.5}
              fill={variant === 'area' ? `url(#${gradientId})` : 'none'}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
