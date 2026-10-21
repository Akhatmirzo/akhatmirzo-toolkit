'use client';

import { VirtualList } from '@akhatmirzo/ui';

export default function VirtualListEmpty() {
  return (
    <VirtualList
      aria-label="Bildirishnomalar"
      items={[]}
      estimateSize={48}
      height={160}
      renderItem={() => null}
      emptyState="Hali bildirishnomalar yo'q"
      className="w-full max-w-md rounded-xl border border-border bg-surface"
    />
  );
}
