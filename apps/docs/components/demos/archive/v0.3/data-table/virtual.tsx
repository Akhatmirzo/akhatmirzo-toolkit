'use client';

import { formatMoney } from '@akhatmirzo/core';
import { DataTable, type DataTableColumn } from '@akhatmirzo/ui';
import { useMemo } from 'react';

interface Order {
  id: number;
  customer: string;
  region: string;
  total: number;
}

const NAMES = ['Jasur Karimov', 'Malika Rahimova', 'Farhod Tursunov', 'Mohira Nazarova'];
const REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', 'Navoiy', 'Xorazm'];

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', width: 96, sortable: true },
  { key: 'customer', header: 'Mijoz', sortable: true },
  { key: 'region', header: 'Viloyat', filter: 'select' },
  {
    key: 'total',
    header: 'Summa',
    numeric: true,
    sortable: true,
    cell: (o) => formatMoney(o.total),
  },
];

export default function DataTableVirtual() {
  const orders = useMemo<Order[]>(
    () =>
      Array.from({ length: 10_000 }, (_, i) => ({
        id: i + 1,
        customer: NAMES[i % NAMES.length]!,
        region: REGIONS[(i * 3) % REGIONS.length]!,
        total: 50_000 + ((i * 377_311) % 4_800_000),
      })),
    [],
  );

  return (
    <DataTable
      label="10 000 buyurtma"
      data={orders}
      columns={columns}
      virtual
      maxHeight={400}
      density="compact"
      searchable
      columnToggle={false}
      className="w-full"
    />
  );
}
