'use client';

import { Skeleton } from '@akhatmirzo/ui';

export default function SkeletonShapes() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Skeleton variant="circle" className="size-12" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-28 rounded-lg" />
    </div>
  );
}
