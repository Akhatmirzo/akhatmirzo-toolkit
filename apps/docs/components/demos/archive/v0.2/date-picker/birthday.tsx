'use client';

import { DatePicker, Field } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function DatePickerBirthday() {
  const [birthday, setBirthday] = useState<Date | null>(new Date(1995, 4, 17));

  return (
    <div className="w-full max-w-xs">
      <Field label="Tug'ilgan sana" description="Sarlavhani bosing — oy va yilni tanlash">
        <DatePicker
          value={birthday}
          onValueChange={setBirthday}
          minDate={new Date(1920, 0, 1)}
          maxDate={new Date()}
        />
      </Field>
    </div>
  );
}
