'use client';

import { useIntersection } from '@akhatmirzo/hooks';
import { Spinner } from '@akhatmirzo/ui';
import { useEffect, useState } from 'react';

const MAX = 60;

export default function HooksIntersection() {
  const [count, setCount] = useState(12);
  const done = count >= MAX;
  const [sentinelRef, entry] = useIntersection<HTMLDivElement>({
    rootMargin: '40px',
    enabled: !done,
  });
  const visible = entry?.isIntersecting ?? false;

  useEffect(() => {
    if (!visible || done) return;
    // Haqiqiy ilovada — keyingi sahifani serverdan yuklash
    const timer = setTimeout(() => setCount((n) => Math.min(MAX, n + 12)), 500);
    return () => clearTimeout(timer);
  }, [visible, done, count]);

  return (
    <div className="h-64 w-full max-w-sm overflow-auto rounded-xl border border-border bg-surface">
      <ul className="divide-y divide-border text-sm text-text">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="px-4 py-2">
            Buyurtma #{1000 + i}
          </li>
        ))}
      </ul>
      <div
        ref={sentinelRef}
        className="flex items-center justify-center gap-2 p-3 text-sm text-text-muted"
      >
        {done ? (
          'Hammasi yuklandi'
        ) : (
          <>
            <Spinner size="sm" /> Yuklanmoqda…
          </>
        )}
      </div>
    </div>
  );
}
