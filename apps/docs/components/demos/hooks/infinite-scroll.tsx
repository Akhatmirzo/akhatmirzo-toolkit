'use client';

import { useInfiniteScroll } from '@akhatmirzo/hooks';
import { Spinner } from '@akhatmirzo/ui';
import { useState } from 'react';

const TOTAL = 60;
const PAGE = 12;

export default function HooksInfiniteScroll() {
  const [items, setItems] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const hasMore = items < TOTAL;

  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    loading,
    rootMargin: '40px',
    onLoadMore: () => {
      // Haqiqiy ilovada — keyingi sahifani serverdan yuklash
      setLoading(true);
      setTimeout(() => {
        setItems((n) => Math.min(TOTAL, n + PAGE));
        setLoading(false);
      }, 600);
    },
  });

  return (
    <div className="h-64 w-full max-w-sm overflow-auto rounded-xl border border-border bg-surface">
      <ul className="divide-y divide-border text-sm text-text">
        {Array.from({ length: items }, (_, i) => (
          <li key={i} className="px-4 py-2">
            Buyurtma #{1000 + i}
          </li>
        ))}
      </ul>
      <div
        ref={sentinelRef}
        className="flex items-center justify-center gap-2 p-3 text-sm text-text-muted"
      >
        {hasMore ? (
          <>
            <Spinner size="sm" /> Yuklanmoqda…
          </>
        ) : (
          'Hammasi yuklandi'
        )}
      </div>
    </div>
  );
}
