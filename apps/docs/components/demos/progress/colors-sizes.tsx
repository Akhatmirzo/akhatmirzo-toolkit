'use client';

import { Progress } from '@akhatmirzo/ui';

export default function ProgressColorsSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <Progress value={40} size="sm" aria-label="Kichik chiziq" />
      <Progress value={55} color="success" aria-label="O'rta chiziq" />
      <Progress value={80} size="lg" color="warning" aria-label="Katta chiziq" />
      <Progress value={95} color="danger" label="Disk to'lib bormoqda" showValue />
    </div>
  );
}
