'use client';

import { formatNumber } from '@akhatmirzo/core';
import { BarChart } from '@akhatmirzo/ui/charts';

const orders = [
  { region: 'Toshkent', onlayn: 1240, dokon: 860 },
  { region: 'Samarqand', onlayn: 610, dokon: 540 },
  { region: "Farg'ona", onlayn: 480, dokon: 520 },
  { region: 'Buxoro', onlayn: 350, dokon: 290 },
  { region: 'Namangan', onlayn: 410, dokon: 380 },
];

export default function ChartsBar() {
  return (
    <BarChart
      aria-label="Viloyatlar bo'yicha buyurtmalar: onlayn va do'kondan"
      className="w-full"
      data={orders}
      index="region"
      series={[
        { key: 'onlayn', label: 'Onlayn' },
        { key: 'dokon', label: "Do'kondan", color: 'sky' },
      ]}
      valueFormat={(v) => `${formatNumber(v)} ta`}
      stacked
    />
  );
}
