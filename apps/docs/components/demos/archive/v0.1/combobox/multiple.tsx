'use client';

import { Combobox, Field } from '@akhatmirzo/ui';
import { useState } from 'react';

const branches = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Namangan',
  'Andijon',
  "Farg'ona",
  'Nukus',
].map((label) => ({ value: label.toLowerCase().replace(/'/g, ''), label }));

export default function ComboboxMultiple() {
  const [selected, setSelected] = useState<string[]>(['toshkent', 'samarqand']);

  return (
    <Field
      label="Filiallar"
      description={`${selected.length} ta tanlangan`}
      className="w-full max-w-sm"
    >
      <Combobox
        multiple
        options={branches}
        value={selected}
        onValueChange={setSelected}
        placeholder="Filiallarni tanlang"
      />
    </Field>
  );
}
