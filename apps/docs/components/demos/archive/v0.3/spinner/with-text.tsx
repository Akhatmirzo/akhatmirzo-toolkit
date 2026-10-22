'use client';

import { Spinner } from '@akhatmirzo/ui';

export default function SpinnerWithText() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <span className="inline-flex items-center gap-2 text-sm text-text-muted">
        <Spinner size="sm" aria-hidden="true" />
        Buyurtmalar yuklanmoqda...
      </span>
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-surface text-text-muted">
        <Spinner size="lg" label="Jadval yuklanmoqda" />
      </div>
    </div>
  );
}
