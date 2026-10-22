'use client';

import { searchMatch, splitByRanges } from '@akhatmirzo/core';
import { Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

const CITIES = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  "Farg'ona",
  'Qo‘qon',
  'Shahrisabz',
  'Chirchiq',
  'Ғузор',
  'Ўрта Чирчиқ',
  'Шаҳрихон',
];

export default function CoreSearch() {
  const [query, setQuery] = useState('шаҳ');
  const results = CITIES.map((city) => ({ city, ...searchMatch(city, query) })).filter(
    (r) => r.match,
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Field label="Shahar qidirish" description="Sinab ko'ring: chir, ғуз, fargona, qo'qon">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} clearable />
      </Field>
      <ul className="flex flex-wrap gap-2">
        {results.map(({ city, ranges }) => (
          <li key={city} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm">
            {splitByRanges(city, ranges).map((part, i) =>
              part.match ? (
                <mark key={i} className="rounded-sm bg-primary-soft text-primary-soft-foreground">
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </li>
        ))}
        {results.length === 0 && <li className="text-sm text-text-muted">Hech narsa topilmadi</li>}
      </ul>
    </div>
  );
}
