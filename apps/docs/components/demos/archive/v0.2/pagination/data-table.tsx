'use client';

import { formatMoney } from '@akhatmirzo/core';
import { DataTable, Pagination, PaginationInfo, type DataTableColumn } from '@akhatmirzo/ui';
import { useState } from 'react';

interface Order {
  id: number;
  customer: string;
  total: number;
}

const NAMES = ['Jasur Karimov', 'Malika Rahimova', 'Nodira Saidova', 'Otabek Qodirov'];
const ORDERS: Order[] = Array.from({ length: 47 }, (_, i) => ({
  id: 3001 + i,
  customer: NAMES[i % NAMES.length]!,
  total: 120_000 + ((i * 314_159) % 2_500_000),
}));

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', width: 88 },
  { key: 'customer', header: 'Mijoz' },
  { key: 'total', header: 'Summa', numeric: true, cell: (o) => formatMoney(o.total) },
];

const PAGE_SIZE = 5;

export default function PaginationDataTable() {
  const [page, setPage] = useState(1);
  const rows = ORDERS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex w-full flex-col gap-3">
      <DataTable label="Buyurtmalar" data={rows} columns={columns} className="w-full" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PaginationInfo page={page} pageSize={PAGE_SIZE} total={ORDERS.length} />
        <Pagination
          page={page}
          onPageChange={setPage}
          total={ORDERS.length}
          pageSize={PAGE_SIZE}
          size="sm"
        />
      </div>
    </div>
  );
}
