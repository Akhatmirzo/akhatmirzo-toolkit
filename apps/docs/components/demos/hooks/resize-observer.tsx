'use client';

import { useResizeObserver } from '@akhatmirzo/hooks';
import { Badge } from '@akhatmirzo/ui';
import { useRef } from 'react';

export default function HooksResizeObserver() {
  const ref = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(ref, { box: 'border-box' });
  const compact = size !== null && size.width < 240;

  return (
    <div
      ref={ref}
      className="flex h-40 w-72 min-w-40 max-w-full resize flex-col items-center justify-center gap-2 overflow-auto rounded-xl border border-border bg-surface p-4 text-sm text-text"
    >
      <Badge color={compact ? 'warning' : 'success'} dot>
        {compact ? 'Ixcham' : 'Keng'}
      </Badge>
      <span className="font-mono text-text-muted">
        {size ? `${Math.round(size.width)} × ${Math.round(size.height)}` : '…'}
      </span>
      <span className="text-xs text-text-muted">O'ng pastki burchakdan torting</span>
    </div>
  );
}
