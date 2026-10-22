'use client';

import { formatFileSize, formatNumber } from '@akhatmirzo/core';
import {
  Area,
  AreaChart,
  CartesianGrid,
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
} from '@/components/examples/shared/chart';
import { plans, storageHistory, usage } from '../data';
import { useWorkspace } from '../store';
import { SettingsSection, UsageBar } from '../ui';

export function UsageSection() {
  const { employees, billing } = useWorkspace();
  const plan = plans.find((p) => p.id === billing.plan) ?? plans[1]!;
  const seats = employees.filter((e) => e.status !== 'left').length;
  const storageMax = plan.storageGb * 1024 ** 3;

  return (
    <SettingsSection
      title="Foydalanish"
      description="Joriy hisob davri bo'yicha. Limitning 80% idan oshsa, sizga xabar beramiz."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col gap-5">
          <UsageBar
            label="Xodim o'rinlari"
            value={seats}
            max={plan.seats}
            display={`${seats} / ${plan.seats}`}
          />
          <UsageBar
            label="Xotira"
            value={usage.storageBytes}
            max={storageMax}
            display={`${formatFileSize(usage.storageBytes)} / ${formatFileSize(storageMax, 0)}`}
          />
          <UsageBar
            label="API so'rovlar"
            value={usage.apiCalls}
            max={usage.apiLimit}
            display={`${formatNumber(usage.apiCalls)} / ${formatNumber(usage.apiLimit)}`}
          />
        </div>

        <figure className="min-w-0">
          <figcaption className="mb-2 text-sm font-medium">
            Xotira o&apos;sishi{' '}
            <span className="font-normal text-text-muted">— oxirgi 6 oy, GB</span>
          </figcaption>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="ws-storage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors[0]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColors[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="month" {...axisProps} />
                <YAxis {...axisProps} width={48} />
                <Tooltip
                  cursor={cursorProps}
                  content={<ChartTooltip format={(v) => `${v.toLocaleString('uz-UZ')} GB`} />}
                />
                <Area
                  type="monotone"
                  dataKey="gb"
                  name="Xotira"
                  stroke={chartColors[0]}
                  strokeWidth={2}
                  fill="url(#ws-storage)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </figure>
      </div>
    </SettingsSection>
  );
}
