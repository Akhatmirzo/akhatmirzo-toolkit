'use client';

import { useLongPress } from '@akhatmirzo/hooks';
import { Badge } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksLongPress() {
  const [status, setStatus] = useState<'idle' | 'pressing' | 'done' | 'cancelled'>('idle');
  const handlers = useLongPress<HTMLButtonElement>(() => setStatus('done'), {
    delay: 700,
    onStart: () => setStatus('pressing'),
    onCancel: () => setStatus('cancelled'),
  });

  const label = {
    idle: 'Kutilmoqda',
    pressing: 'Bosib turibsiz…',
    done: "Buyurtma o'chirishga tanlandi",
    cancelled: 'Bekor qilindi',
  }[status];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        {...handlers}
        className="w-64 touch-none select-none rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-text transition-colors active:bg-surface-muted"
      >
        <span className="font-medium">Buyurtma #1024</span>
        <span className="block text-text-muted">1 250 000 so'm · 0,7 s bosib turing</span>
      </button>
      <Badge
        color={status === 'done' ? 'success' : status === 'cancelled' ? 'warning' : 'neutral'}
        dot
      >
        {label}
      </Badge>
    </div>
  );
}
