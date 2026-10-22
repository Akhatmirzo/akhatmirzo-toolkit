'use client';

import { formatMoney } from '@akhatmirzo/core';
import { DonutChart } from '@akhatmirzo/ui/charts';

const expenses = [
  { name: 'Oziq-ovqat', total: 3_850_000 },
  { name: 'Transport', total: 1_240_000 },
  { name: 'Kommunal', total: 960_000 },
  { name: "Ko'ngilochar", total: 720_000 },
  { name: 'Boshqalar', total: 430_000 },
];

const total = expenses.reduce((sum, e) => sum + e.total, 0);

export default function ChartsDonut() {
  return (
    <DonutChart
      aria-label="Oktabr xarajatlari toifalar bo'yicha"
      className="w-full max-w-sm"
      data={expenses}
      index="name"
      value="total"
      valueFormat={(v) => formatMoney(v)}
      centerLabel="Jami, so'm"
      centerValue={`${(total / 1_000_000).toFixed(1).replace('.', ',')} mln`}
      height={220}
    />
  );
}
