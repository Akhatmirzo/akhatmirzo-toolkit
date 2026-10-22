'use client';

import { searchMatch } from '@akhatmirzo/core';
import { Combobox, Field, type ComboboxOption } from '@akhatmirzo/ui';
import { useRef, useState } from 'react';

const all: ComboboxOption[] = ['Toshkent', 'Samarqand', 'Buxoro', 'Xiva', 'Nukus', 'Termiz'].map(
  (label) => ({ value: label.toLowerCase(), label }),
);

export default function ComboboxServer() {
  const [options, setOptions] = useState(all.slice(0, 3));
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Server so'rovini taqlid qiladi: javob 700ms dan keyin keladi
  const search = (query: string) => {
    clearTimeout(timer.current);
    setLoading(true);
    timer.current = setTimeout(() => {
      setOptions(query ? all.filter((o) => searchMatch(o.label, query).match) : all.slice(0, 3));
      setLoading(false);
    }, 700);
  };

  return (
    <Field label="Shahar (serverdan)" className="w-full max-w-xs">
      <Combobox
        options={options}
        loading={loading}
        onSearch={search}
        placeholder="Qidirib tanlang"
        searchPlaceholder="Shahar nomi..."
        emptyText="Server hech narsa qaytarmadi"
      />
    </Field>
  );
}
