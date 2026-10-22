'use client';

import { Tabs } from '@akhatmirzo/ui';
import { useState } from 'react';

const totals: Record<string, string> = {
  day: "1 250 000 so'm",
  week: "8 740 000 so'm",
  month: "36 900 000 so'm",
  year: "412 500 000 so'm",
};

export default function TabsControlled() {
  const [period, setPeriod] = useState('week');

  return (
    <div className="flex flex-col items-start gap-3">
      <Tabs value={period} onValueChange={setPeriod} variant="segmented">
        <Tabs.List aria-label="Davr">
          <Tabs.Trigger value="day">Kun</Tabs.Trigger>
          <Tabs.Trigger value="week">Hafta</Tabs.Trigger>
          <Tabs.Trigger value="month">Oy</Tabs.Trigger>
          <Tabs.Trigger value="year">Yil</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
      <p className="m-0 text-sm text-text-muted">
        Savdo: <span className="font-semibold text-text">{totals[period]}</span>
      </p>
    </div>
  );
}
