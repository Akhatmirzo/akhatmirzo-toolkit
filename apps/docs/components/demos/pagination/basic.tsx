'use client';

import { Pagination, PaginationInfo } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function PaginationBasic() {
  const [page, setPage] = useState(3);

  return (
    <div className="flex flex-col items-center gap-3">
      <Pagination page={page} onPageChange={setPage} total={230} pageSize={10} />
      <PaginationInfo page={page} pageSize={10} total={230} />
    </div>
  );
}
