'use client';

import { formatDate } from '@akhatmirzo/core';
import { DateRangePicker, Field, type DateRangeValue } from '@akhatmirzo/ui';
import { useState } from 'react';

const daysAgo = (n: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - n);
};

export default function DateRangePickerBasic() {
  const [range, setRange] = useState<DateRangeValue | null>({ from: daysAgo(6), to: daysAgo(0) });

  return (
    <div className="w-full max-w-sm">
      <Field
        label="Hisobot davri"
        description={
          range?.from && range.to
            ? `${formatDate(range.from, 'd MMM')} – ${formatDate(range.to, 'd MMM yyyy')}`
            : 'Davr tanlanmagan'
        }
      >
        <DateRangePicker value={range} onValueChange={setRange} presets maxDate={new Date()} />
      </Field>
    </div>
  );
}
