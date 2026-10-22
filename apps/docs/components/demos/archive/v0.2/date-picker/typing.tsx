'use client';

import { formatDate } from '@akhatmirzo/core';
import { DatePicker, Field, type DatePickerError } from '@akhatmirzo/ui';
import { useState } from 'react';

const errorText: Record<DatePickerError, string> = {
  invalid: "Bunday sana yo'q",
  unavailable: "O'tgan sanani tanlab bo'lmaydi",
};

export default function DatePickerTyping() {
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState<DatePickerError | null>(null);

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Field
        label="Uchrashuv sanasi"
        required
        error={error ? errorText[error] : undefined}
        description="Sinab ko'ring: 31022026"
      >
        <DatePicker
          value={date}
          onValueChange={setDate}
          onErrorChange={setError}
          minDate={new Date()}
        />
      </Field>
      <p className="text-sm text-text-muted">
        Qiymat: <code>{date ? formatDate(date, 'yyyy-MM-dd') : 'null'}</code>
      </p>
    </div>
  );
}
