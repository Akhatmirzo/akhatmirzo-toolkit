'use client';

import { Combobox, Field } from '@akhatmirzo/ui';

const cities = ['Toshkent', 'Samarqand', 'Buxoro'].map((label) => ({
  value: label.toLowerCase(),
  label,
}));

export default function ComboboxStates() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <Field label="O'chirilgan" disabled>
        <Combobox options={cities} defaultValue="toshkent" />
      </Field>
      <Field label="Shahar" error="Shaharni tanlang" required>
        <Combobox options={cities} placeholder="Shahar tanlang" />
      </Field>
      <Field label="Yuklanmoqda">
        <Combobox options={[]} loading placeholder="Ochib ko'ring" />
      </Field>
    </div>
  );
}
