'use client';

import { useEventListener } from '@akhatmirzo/hooks';
import { Badge, Kbd } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksEventListener() {
  const [width, setWidth] = useState<number | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Qisqa shakl — window uchun, SSR-xavfsiz
  useEventListener('resize', () => setWidth(window.innerWidth));
  useEventListener('keydown', (event) => setLastKey(event.key));

  return (
    <div className="flex flex-col items-center gap-3 text-sm text-text">
      <p className="text-text-muted">Oyna o'lchamini o'zgartiring yoki istalgan tugmani bosing</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="outline">Kenglik: {width === null ? '—' : `${width}px`}</Badge>
        <span className="flex items-center gap-1">
          Oxirgi tugma: {lastKey ? <Kbd>{lastKey === ' ' ? 'Space' : lastKey}</Kbd> : '—'}
        </span>
      </div>
    </div>
  );
}
