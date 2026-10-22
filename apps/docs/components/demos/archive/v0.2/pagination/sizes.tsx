'use client';

import { Pagination } from '@akhatmirzo/ui';

export default function PaginationSizes() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Pagination defaultPage={4} pageCount={12} size="sm" compact={false} />
      <Pagination defaultPage={4} pageCount={12} compact={false} />
    </div>
  );
}
