'use client';

import { Calendar, type DateRangeValue } from '@akhatmirzo/ui';
import { useState } from 'react';

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export default function CalendarRange() {
  const today = new Date();
  const [range, setRange] = useState<DateRangeValue>({
    from: addDays(today, -3),
    to: addDays(today, 4),
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <Calendar
        mode="range"
        numberOfMonths={2}
        value={range}
        onValueChange={setRange}
        className="rounded-xl border border-border bg-surface p-3"
      />
      <span className="text-sm text-text-muted">
        {range.from && !range.to ? 'Tugash sanasini tanlang' : 'Oraliq tanlandi'}
      </span>
    </div>
  );
}
