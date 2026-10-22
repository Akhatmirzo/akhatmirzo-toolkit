'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Card } from '@akhatmirzo/ui';
import { Sparkline } from '@akhatmirzo/ui/charts';

const kpis = [
  { title: 'Tushum', value: formatMoney(63_100_000), trend: [42, 39, 51, 48, 58, 63], up: true },
  { title: 'Qaytarishlar', value: '38 ta', trend: [52, 47, 49, 44, 41, 38], up: false },
];

export default function ChartsSparkline() {
  return (
    <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
      {kpis.map((kpi) => (
        <Card key={kpi.title} padding="sm" className="gap-2">
          <p className="text-sm text-text-muted">{kpi.title}</p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-xl font-bold whitespace-nowrap tabular-nums">{kpi.value}</p>
            {/* Qiymat matn bilan berilgan — grafik faqat bezak */}
            <Sparkline
              aria-hidden
              data={kpi.trend}
              color={kpi.up ? 'success' : 'danger'}
              className="w-24"
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
