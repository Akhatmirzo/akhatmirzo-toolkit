'use client';

import { Combobox } from '@akhatmirzo/ui';

const cities = ['Toshkent', 'Samarqand', 'Buxoro'].map((label) => ({
  value: label.toLowerCase(),
  label,
}));

export default function ComboboxSizes() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
      <Combobox size="sm" options={cities} aria-label="Shahar" placeholder="sm — 32px" />
      <Combobox size="md" options={cities} aria-label="Shahar" placeholder="md — 40px" />
      <Combobox size="lg" options={cities} aria-label="Shahar" placeholder="lg — 48px" />
    </div>
  );
}
