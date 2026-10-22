'use client';

import { DatePicker, Field } from '@akhatmirzo/ui';

export default function DatePickerStates() {
  const today = new Date();
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="O'chirilgan" disabled>
        <DatePicker defaultValue={today} />
      </Field>
      <Field label="Faqat o'qish">
        <DatePicker defaultValue={today} readOnly />
      </Field>
      <Field label="Muddat" error="Sanani tanlang" required>
        <DatePicker />
      </Field>
      <Field label="Boshqa format" description="d MMMM yyyy">
        <DatePicker format="d MMMM yyyy" defaultValue={today} />
      </Field>
    </div>
  );
}
