'use client';

import { formatMoney } from '@akhatmirzo/core';
import { VirtualList } from '@akhatmirzo/ui';
import { useCallback, useState } from 'react';

const PAGE = 40;
const TOTAL = 400;
const NAMES = ['Jasur Karimov', 'Malika Rahimova', 'Nodira Saidova', 'Otabek Qodirov'];

const makeOrders = (from: number) =>
  Array.from({ length: PAGE }, (_, i) => {
    const id = from + i + 1;
    return {
      id,
      customer: NAMES[id % NAMES.length]!,
      total: ((id * 7919) % 90) * 15_000 + 150_000,
    };
  });

export default function VirtualListInfinite() {
  const [orders, setOrders] = useState(() => makeOrders(0));
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(() => {
    if (orders.length >= TOTAL) return;
    setLoading(true);
    // Haqiqiy loyihada — fetch(`/api/orders?offset=${orders.length}`)
    setTimeout(() => {
      setOrders((prev) => [...prev, ...makeOrders(prev.length)]);
      setLoading(false);
    }, 900);
  }, [orders.length]);

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="m-0 text-sm text-text-muted">
        Yuklangan: {orders.length} / {TOTAL}
      </p>
      <VirtualList
        aria-label="Buyurtmalar"
        items={orders}
        estimateSize={52}
        height={360}
        loadingMore={loading}
        onEndReached={loadMore}
        getItemKey={(o) => o.id}
        labels={{ loadingMore: 'Buyurtmalar yuklanmoqda...' }}
        className="rounded-xl border border-border bg-surface"
        renderItem={(o) => (
          <div className="flex h-13 items-center gap-3 border-b border-border px-4 text-sm">
            <span className="w-14 shrink-0 text-text-faint tabular-nums">№{o.id}</span>
            <span className="min-w-0 flex-1 truncate">{o.customer}</span>
            <span className="shrink-0 font-medium tabular-nums">{formatMoney(o.total)}</span>
          </div>
        )}
      />
    </div>
  );
}
