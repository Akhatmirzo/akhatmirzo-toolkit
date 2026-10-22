'use client';

import { BarChart } from '@akhatmirzo/ui/charts';

const products = [
  { name: 'Smartfonlar', tushum: 184_000_000 },
  { name: 'Noutbuklar', tushum: 142_500_000 },
  { name: 'Quloqchinlar', tushum: 61_200_000 },
  { name: 'Aqlli soatlar', tushum: 48_900_000 },
  { name: 'Aksessuarlar', tushum: 23_400_000 },
];

const short = (v: number) => `${Math.round(v / 1_000_000)} mln so'm`;

export default function ChartsBarHorizontal() {
  return (
    <BarChart
      aria-label="Eng ko'p sotilgan toifalar, tushum bo'yicha"
      className="w-full"
      data={products}
      index="name"
      series={[{ key: 'tushum', label: 'Tushum', color: 'emerald' }]}
      valueFormat={short}
      orientation="horizontal"
      legend={false}
      height={240}
    />
  );
}
