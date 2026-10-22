'use client';

import { formatMoney, formatNumber } from '@akhatmirzo/core';
import { Card, Skeleton, Tabs } from '@akhatmirzo/ui';
import { useId, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartTooltip,
  axisProps,
  chartColors,
  cursorProps,
  gridProps,
} from '@akhatmirzo/ui/charts';
import { formatCompact } from './analytics';

interface Point {
  label: string;
  revenue: number;
  orders: number;
  prevRevenue?: number;
  prevOrders?: number;
}

type Metric = 'revenue' | 'orders';

export function SalesChart({ data, loading }: { data: Point[]; loading?: boolean }) {
  const [metric, setMetric] = useState<Metric>('revenue');
  const gradientId = 'sales' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const isRevenue = metric === 'revenue';
  const format = (v: number) => (isRevenue ? formatMoney(v) : `${formatNumber(v)} ta`);
  const total = data.reduce((s, d) => s + d[metric], 0);

  return (
    <Card padding="none" className="lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <div>
          <h2 className="text-base font-semibold">Savdo dinamikasi</h2>
          <div className="mt-0.5 text-sm text-text-muted">
            {loading ? (
              <Skeleton className="mt-1 h-4 w-40" />
            ) : (
              <>
                Jami: <span className="font-semibold text-text tabular-nums">{format(total)}</span>
              </>
            )}
          </div>
        </div>
        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as Metric)}
          variant="segmented"
          size="sm"
        >
          <Tabs.List aria-label="Ko'rsatkich">
            <Tabs.Trigger value="revenue">Tushum</Tabs.Trigger>
            <Tabs.Trigger value="orders">Buyurtmalar</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </div>

      <div className="h-72 px-2 pt-4 pb-3">
        {loading ? (
          <Skeleton className="mx-3 h-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: chartColors[0], stopOpacity: 0.28 }} />
                  <stop offset="100%" style={{ stopColor: chartColors[0], stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} minTickGap={24} tickMargin={8} />
              <YAxis
                {...axisProps}
                width={isRevenue ? 64 : 40}
                tickFormatter={(v: number) => (isRevenue ? formatCompact(v) : String(v))}
              />
              <Tooltip cursor={cursorProps} content={<ChartTooltip format={format} />} />
              <Line
                type="monotone"
                dataKey={isRevenue ? 'prevRevenue' : 'prevOrders'}
                name="O'tgan davr"
                stroke="var(--ak-border-strong)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
              <Area
                type="monotone"
                dataKey={metric}
                name="Joriy davr"
                stroke={chartColors[0]}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                // Bir-ikki kunlik davrda chiziq yo'q — nuqtalar ko'rinsin
                dot={data.length <= 2 ? { r: 4, strokeWidth: 0, fill: chartColors[0] } : false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex flex-wrap gap-4 px-5 pb-4 text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-0.5 w-4 rounded bg-primary" /> Joriy davr
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-0 w-4 border-t-2 border-dashed border-border-strong"
          />{' '}
          O&apos;tgan davr
        </span>
      </div>
    </Card>
  );
}
