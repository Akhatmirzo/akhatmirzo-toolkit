'use client';

import { Pagination } from '@akhatmirzo/ui';

export default function PaginationCompact() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Pagination defaultPage={3} pageCount={24} compact />
      <Pagination defaultPage={3} pageCount={24} compact size="sm" showFirstLast />
    </div>
  );
}
