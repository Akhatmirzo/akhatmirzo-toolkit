'use client';

import { formatMoney } from '@akhatmirzo/core';
import { DataTable, type DataTableColumn, type DataTableState } from '@akhatmirzo/ui';
import { useEffect, useState } from 'react';

interface Order {
  id: number;
  customer: string;
  total: number;
}

interface Page {
  rows: Order[];
  total: number;
}

const NAMES = ['Jasur Karimov', 'Malika Rahimova', 'Nodira Saidova', 'Otabek Qodirov'];
const DB: Order[] = Array.from({ length: 137 }, (_, i) => ({
  id: 2001 + i,
  customer: NAMES[i % NAMES.length]!,
  total: 90_000 + ((i * 271_828) % 3_500_000),
}));

/** "Server": qidiradi, saralaydi, sahifalaydi. Haqiqiy loyihada — fetch('/api/orders?...') */
function fetchOrders({ search, sorting, pagination }: DataTableState): Promise<Page> {
  let rows = DB.filter((o) => o.customer.toLowerCase().includes(search.toLowerCase()));
  const sort = sorting[0];
  if (sort) {
    const key = sort.id as keyof Order;
    rows = [...rows].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (sort.desc ? -1 : 1));
  }
  const start = pagination.pageIndex * pagination.pageSize;
  const page = { rows: rows.slice(start, start + pagination.pageSize), total: rows.length };
  return new Promise((resolve) => setTimeout(() => resolve(page), 600));
}

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', width: 88, sortable: true },
  { key: 'customer', header: 'Mijoz', sortable: true },
  {
    key: 'total',
    header: 'Summa',
    numeric: true,
    sortable: true,
    cell: (o) => formatMoney(o.total),
  },
];

export default function DataTableServer() {
  const [query, setQuery] = useState<DataTableState>({
    sorting: [],
    search: '',
    filters: {},
    pagination: { pageIndex: 0, pageSize: 10 },
  });
  const [result, setResult] = useState<Page>({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchOrders(query).then((page) => {
      if (!active) return;
      setResult(page);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [query]);

  return (
    <DataTable
      label="Server buyurtmalari"
      data={result.rows}
      rowCount={result.total}
      columns={columns}
      manual
      searchable
      pagination={{ pageSize: 10 }}
      loading={loading}
      onStateChange={(state) => {
        setLoading(true);
        setQuery(state);
      }}
      className="w-full"
    />
  );
}
