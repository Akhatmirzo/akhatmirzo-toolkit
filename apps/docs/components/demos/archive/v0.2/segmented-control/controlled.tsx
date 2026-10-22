'use client';

import { SegmentedControl } from '@akhatmirzo/ui';
import { useState } from 'react';

const totals: Record<string, string> = {
  day: "1 250 000 so'm",
  week: "8 740 000 so'm",
  month: "36 900 000 so'm",
};

export default function SegmentedControlControlled() {
  const [period, setPeriod] = useState('week');

  return (
    <div className="flex flex-col items-start gap-3">
      <SegmentedControl value={period} onValueChange={setPeriod} aria-label="Davr">
        <SegmentedControl.Item value="day">Kun</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Hafta</SegmentedControl.Item>
        <SegmentedControl.Item value="month">Oy</SegmentedControl.Item>
      </SegmentedControl>
      <p className="m-0 text-sm text-text-muted">
        Savdo: <span className="font-semibold text-text">{totals[period]}</span>
      </p>
    </div>
  );
}
