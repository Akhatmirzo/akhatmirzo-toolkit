'use client';

import { formatDate } from '@akhatmirzo/core';
import { Calendar } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function CalendarInline() {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <div className="flex flex-col items-center gap-2">
      <Calendar
        value={date}
        onValueChange={setDate}
        disabledDates={(d) => d.getDay() === 0}
        className="rounded-xl border border-border bg-surface p-3"
      />
      <span className="text-sm text-text-muted">
        {date ? formatDate(date, 'd MMMM yyyy, EEEE') : 'Sana tanlanmagan'}
      </span>
    </div>
  );
}
