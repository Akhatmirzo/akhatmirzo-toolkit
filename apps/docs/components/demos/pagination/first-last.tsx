'use client';

import { Pagination } from '@akhatmirzo/ui';

export default function PaginationFirstLast() {
  return <Pagination defaultPage={10} pageCount={40} siblings={2} showFirstLast compact={false} />;
}
