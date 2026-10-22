'use client';

import { Button, EmptyState, Input } from '@akhatmirzo/ui';
import { SearchX } from 'lucide-react';
import { useState } from 'react';

export default function EmptyStateSearch() {
  const [query, setQuery] = useState('Namangan');

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Input
        aria-label="Shahar qidirish"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Shahar nomi"
      />
      <EmptyState
        size="sm"
        bordered
        icon={<SearchX />}
        title="Hech narsa topilmadi"
        description={`"${query}" bo'yicha natija yo'q. So'zni o'zgartirib ko'ring.`}
        action={
          <Button size="sm" onClick={() => setQuery('')}>
            Qidiruvni tozalash
          </Button>
        }
      />
    </div>
  );
}
