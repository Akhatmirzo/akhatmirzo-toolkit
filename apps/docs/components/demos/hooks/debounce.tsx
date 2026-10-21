'use client';

import { useDebounce } from '@akhatmirzo/hooks';
import { Badge, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const CITIES = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Xiva',
  'Namangan',
  'Andijon',
  'Nukus',
  'Termiz',
];

export default function HooksDebounce() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);
  const results = CITIES.filter((c) => c.toLowerCase().includes(debounced.trim().toLowerCase()));

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Shahar qidirish" description="Natija yozishni to'xtatganingizdan 400 ms keyin">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} clearable />
      </Field>
      <Badge color={query === debounced ? 'success' : 'warning'} dot className="self-start">
        {query === debounced ? 'Yangilangan' : 'Kutilmoqda…'}
      </Badge>
      <div className="flex flex-wrap gap-2">
        {results.map((city) => (
          <Badge key={city} variant="outline">
            {city}
          </Badge>
        ))}
        {results.length === 0 && (
          <span className="text-sm text-text-muted">Hech narsa topilmadi</span>
        )}
      </div>
    </div>
  );
}
