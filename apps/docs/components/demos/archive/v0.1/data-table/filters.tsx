'use client';

import { formatDate, formatMoney } from '@akhatmirzo/core';
import { DataTable, type DataTableColumn } from '@akhatmirzo/ui';

interface Payment {
  id: number;
  client: string;
  method: string;
  region: string;
  date: Date;
  amount: number;
}

const METHODS = ['Click', 'Payme', 'Uzcard', 'Naqd'];
const REGIONS = ['Toshkent', 'Samarqand', 'Andijon', 'Namangan'];
const CLIENTS = ['Dilnoza Yusupova', 'Otabek Qodirov', 'Shahnoza Ergasheva', 'Rustam Xolmatov'];

const payments: Payment[] = Array.from({ length: 40 }, (_, i) => ({
  id: 501 + i,
  client: CLIENTS[(i * 3) % CLIENTS.length]!,
  method: METHODS[(i * 5) % METHODS.length]!,
  region: REGIONS[(i + (i >> 2)) % REGIONS.length]!,
  date: new Date(2026, 9, 25 - i),
  amount: 50_000 + ((i * 213_457) % 3_000_000),
}));

const columns: DataTableColumn<Payment>[] = [
  { key: 'id', header: '№', width: 72, cell: (p) => `#${p.id}` },
  { key: 'client', header: 'Mijoz' },
  { key: 'method', header: "To'lov turi", filter: 'select' },
  { key: 'region', header: 'Viloyat', filter: 'multiselect' },
  { key: 'date', header: 'Sana', filter: 'date', sortable: true, cell: (p) => formatDate(p.date) },
  {
    key: 'amount',
    header: 'Summa',
    numeric: true,
    sortable: true,
    filter: 'range',
    cell: (p) => formatMoney(p.amount),
  },
];

export default function DataTableFilters() {
  return (
    <DataTable
      label="To'lovlar"
      data={payments}
      columns={columns}
      searchable
      pagination={{ pageSize: 5 }}
      initialState={{ filters: { method: 'Click' } }}
      className="w-full"
    />
  );
}
