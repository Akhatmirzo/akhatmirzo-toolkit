'use client';

import { Pagination } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function PaginationLinks() {
  // Haqiqiy loyihada sahifa URL'dan o'qiladi: ?page=3
  const [page, setPage] = useState(1);

  return (
    <Pagination page={page} onPageChange={setPage} pageCount={8} getHref={(p) => `#sahifa-${p}`} />
  );
}
