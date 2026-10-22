'use client';

import { Spinner } from '@akhatmirzo/ui';

export default function SpinnerColors() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Spinner className="text-text" />
      <Spinner className="text-primary" />
      <Spinner className="text-success" />
      <Spinner className="text-danger" />
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Spinner size="sm" />
      </span>
    </div>
  );
}
