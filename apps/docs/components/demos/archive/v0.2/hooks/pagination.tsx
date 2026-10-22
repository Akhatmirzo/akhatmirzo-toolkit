'use client';

import { usePagination } from '@akhatmirzo/hooks';
import { Button } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksPagination() {
  const [page, setPage] = useState(5);
  const { pages, hasPrev, hasNext, from, to } = usePagination({ total: 200, pageSize: 10, page });

  return (
    <div className="flex flex-col items-center gap-3">
      <nav aria-label="Sahifalar" className="flex flex-wrap items-center justify-center gap-1">
        <Button size="sm" variant="ghost" disabled={!hasPrev} onClick={() => setPage(page - 1)}>
          Oldingi
        </Button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="px-2 text-text-muted">
              …
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? 'primary' : 'ghost'}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ),
        )}
        <Button size="sm" variant="ghost" disabled={!hasNext} onClick={() => setPage(page + 1)}>
          Keyingi
        </Button>
      </nav>
      <p className="text-sm text-text-muted">
        {from}–{to} / 200 ta yozuv
      </p>
    </div>
  );
}
