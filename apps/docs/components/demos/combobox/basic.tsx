'use client';

import { Combobox, Field } from '@akhatmirzo/ui';
import { useState } from 'react';

const cities = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Xiva',
  'Namangan',
  'Andijon',
  "Farg'ona",
  "Qo'qon",
  "Marg'ilon",
  'Nukus',
  'Qarshi',
  'Termiz',
].map((label) => ({ value: label.toLowerCase().replace(/'/g, ''), label }));

export default function ComboboxBasic() {
  const [city, setCity] = useState<string | null>(null);

  return (
    <Field
      label="Shahar"
      description={city ? `Qiymat: ${city}` : 'Hali tanlanmagan'}
      className="w-full max-w-xs"
    >
      <Combobox
        options={cities}
        value={city}
        onValueChange={setCity}
        placeholder="Shahar tanlang"
        clearable
      />
    </Field>
  );
}
