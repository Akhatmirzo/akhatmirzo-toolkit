'use client';

import { AreaChart } from '@akhatmirzo/ui/charts';

const sales = [
  { month: 'Yan', tushum: 42_500_000, xarajat: 28_300_000 },
  { month: 'Fev', tushum: 38_900_000, xarajat: 26_100_000 },
  { month: 'Mar', tushum: 51_200_000, xarajat: 30_400_000 },
  { month: 'Apr', tushum: 47_800_000, xarajat: 31_900_000 },
  { month: 'May', tushum: 58_300_000, xarajat: 33_200_000 },
  { month: 'Iyn', tushum: 63_100_000, xarajat: 35_700_000 },
];

/** Qisqa ko'rinish: 42,5 mln so'm */
const short = (v: number) => `${(v / 1_000_000).toFixed(1).replace('.', ',')} mln so'm`;

export default function ChartsArea() {
  return (
    <AreaChart
      aria-label="Oylik tushum va xarajat, yanvar–iyun"
      className="w-full"
      data={sales}
      index="month"
      series={[
        { key: 'tushum', label: 'Tushum' },
        { key: 'xarajat', label: 'Xarajat', color: 'amber' },
      ]}
      valueFormat={short}
      height={280}
    />
  );
}
