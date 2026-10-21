'use client';

import { formatDate } from '@akhatmirzo/core';
import { DatePicker, Field } from '@akhatmirzo/ui';
import { useState } from 'react';

const isSunday = (date: Date) => date.getDay() === 0;

export default function DatePickerBasic() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <div className="w-full max-w-xs">
      <Field
        label="Yetkazish sanasi"
        description={date ? formatDate(date, 'd MMMM yyyy, EEEE') : 'Yakshanba — dam olish kuni'}
      >
        <DatePicker
          value={date}
          onValueChange={setDate}
          minDate={new Date()}
          disabledDates={isSunday}
          presets
          clearable
        />
      </Field>
    </div>
  );
}
