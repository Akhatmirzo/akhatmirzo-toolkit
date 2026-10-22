'use client';

import { Combobox, Field } from '@akhatmirzo/ui';

const districts = [
  'Gʻuzor',
  "G'allaorol",
  'Oʻrta Chirchiq',
  "Qo'shrabot",
  'Shahrisabz',
  'Chilonzor',
  'Yunusobod',
  "Mirzo Ulug'bek",
  'Toshkent tumani',
].map((label, i) => ({ value: String(i), label }));

export default function ComboboxUzbekSearch() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Field label="Tuman">
        <Combobox options={districts} placeholder="Tumanni tanlang" />
      </Field>
      <p className="text-sm text-text-muted">
        Yozib ko'ring: <span className="font-medium text-text">guzor</span>,{' '}
        <span className="font-medium text-text">g‘allaorol</span>,{' '}
        <span className="font-medium text-text">Чилонзор</span>,{' '}
        <span className="font-medium text-text">ulugbek</span>
      </p>
    </div>
  );
}
