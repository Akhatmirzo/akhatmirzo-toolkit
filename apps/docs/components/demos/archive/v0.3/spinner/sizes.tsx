'use client';

import { Spinner } from '@akhatmirzo/ui';

export default function SpinnerSizes() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-text-muted">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  );
}
