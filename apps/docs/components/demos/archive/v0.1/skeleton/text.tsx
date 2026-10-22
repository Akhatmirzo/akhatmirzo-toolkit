'use client';

import { Skeleton } from '@akhatmirzo/ui';

export default function SkeletonTextDemo() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-6 sm:grid-cols-2">
      <Skeleton.Text lines={1} />
      <Skeleton.Text lines={4} />
    </div>
  );
}
