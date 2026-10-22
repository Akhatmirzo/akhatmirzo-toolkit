'use client';

import { Input } from '@akhatmirzo/ui';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function InputClearable() {
  const [query, setQuery] = useState('Samarqand');

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Input
        leftIcon={<Search />}
        clearable
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Shahar qidirish"
        aria-label="Shahar qidirish"
      />
      <p className="text-xs text-text-muted">Qiymat: {query || '—'}</p>
    </div>
  );
}
