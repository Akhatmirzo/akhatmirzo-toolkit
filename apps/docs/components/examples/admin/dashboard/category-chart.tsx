'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Card, Skeleton } from '@akhatmirzo/ui';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip, chartColors } from '@akhatmirzo/ui/charts';
import { formatCompact } from './analytics';

interface Slice {
  id: string;
  name: string;
  value: number;
}

export function CategoryChart({ data, loading }: { data: Slice[]; loading?: boolean }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card padding="none" className="p-5">
      <h2 className="text-base font-semibold">Toifalar bo&apos;yicha</h2>
      <p className="mt-0.5 text-sm text-text-muted">Tushum ulushi</p>

      {loading ? (
        <div className="mt-6 flex flex-col items-center gap-6">
          <Skeleton variant="circle" className="size-40" />
          <Skeleton.Text lines={4} className="w-full" />
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-4 size-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTooltip format={(v) => formatMoney(v)} />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="68%"
                  outerRadius="100%"
                  paddingAngle={2}
                  cornerRadius={4}
                  stroke="none"
                >
                  {data.map((slice, i) => (
                    <Cell key={slice.id} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
              <span className="text-xs text-text-muted">Jami</span>
              <span className="text-lg font-bold tabular-nums">{formatCompact(total)}</span>
            </div>
          </div>
          <ul className="mt-5 flex flex-col gap-2.5">
            {data.map((slice, i) => (
              <li key={slice.id} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: chartColors[i % chartColors.length] }}
                />
                <span className="flex-1 truncate">{slice.name}</span>
                <span className="text-text-muted tabular-nums">{formatCompact(slice.value)}</span>
                <span className="w-12 text-right font-semibold tabular-nums">
                  {total ? Math.round((slice.value / total) * 100) : 0}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
