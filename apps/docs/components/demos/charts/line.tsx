'use client';

import { LineChart } from '@akhatmirzo/ui/charts';

const visits = [
  { day: 'Du', yangi: 320, qaytgan: 540 },
  { day: 'Se', yangi: 410, qaytgan: 580 },
  { day: 'Ch', yangi: 380, qaytgan: 610 },
  { day: 'Pa', yangi: 520, qaytgan: 640 },
  { day: 'Ju', yangi: 610, qaytgan: 700 },
  { day: 'Sh', yangi: 450, qaytgan: 520 },
  { day: 'Ya', yangi: 300, qaytgan: 410 },
];

export default function ChartsLine() {
  return (
    <LineChart
      aria-label="Haftalik tashriflar: yangi va qaytgan foydalanuvchilar"
      className="w-full"
      data={visits}
      index="day"
      series={[
        { key: 'yangi', label: 'Yangi' },
        { key: 'qaytgan', label: 'Qaytgan', color: 'success' },
      ]}
      curve="linear"
      height={240}
    />
  );
}
