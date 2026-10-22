'use client';

import { DatePicker } from '@akhatmirzo/ui';

export default function DatePickerSizes() {
  const today = new Date();
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <DatePicker size="sm" aria-label="Kichik" defaultValue={today} />
      <DatePicker size="md" aria-label="O'rta" defaultValue={today} />
      <DatePicker size="lg" aria-label="Katta" defaultValue={today} />
    </div>
  );
}
