'use client';

import { DateRangePicker, Field, type DateRangeValue } from '@akhatmirzo/ui';
import { useState } from 'react';

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export default function DateRangePickerPresets() {
  const [vacation, setVacation] = useState<DateRangeValue | null>(null);

  return (
    <div className="w-full max-w-sm">
      <Field label="Ta'til" description="Yakshanbalar yopiq">
        <DateRangePicker
          value={vacation}
          onValueChange={setVacation}
          minDate={new Date()}
          disabledDates={(d) => d.getDay() === 0}
          clearable
          name="tatil"
          presets={[
            { label: 'Bir hafta', range: (t) => ({ from: addDays(t, 1), to: addDays(t, 7) }) },
            { label: 'Ikki hafta', range: (t) => ({ from: addDays(t, 1), to: addDays(t, 14) }) },
          ]}
        />
      </Field>
    </div>
  );
}
