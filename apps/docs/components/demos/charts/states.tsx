'use client';

import { SegmentedControl } from '@akhatmirzo/ui';
import { AreaChart } from '@akhatmirzo/ui/charts';
import { useState } from 'react';

const data = [
  { week: '1-hafta', buyurtma: 120 },
  { week: '2-hafta', buyurtma: 164 },
  { week: '3-hafta', buyurtma: 142 },
  { week: '4-hafta', buyurtma: 190 },
];

export default function ChartsStates() {
  const [state, setState] = useState('ready');
  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl value={state} onValueChange={setState} aria-label="Holat" size="sm">
        <SegmentedControl.Item value="ready">Ma&apos;lumot</SegmentedControl.Item>
        <SegmentedControl.Item value="loading">Yuklanmoqda</SegmentedControl.Item>
        <SegmentedControl.Item value="empty">Bo&apos;sh</SegmentedControl.Item>
      </SegmentedControl>
      <AreaChart
        aria-label="Haftalik buyurtmalar"
        data={state === 'empty' ? [] : data}
        index="week"
        series={[{ key: 'buyurtma', label: 'Buyurtmalar' }]}
        loading={state === 'loading'}
        legend={false}
        height={220}
      />
    </div>
  );
}
