'use client';

import { formatDate, formatMoney } from '@akhatmirzo/core';
import { Badge, Button, DataTable, toast, type DataTableColumn } from '@akhatmirzo/ui';
import { Plus } from 'lucide-react';

type Status = 'paid' | 'pending' | 'shipped' | 'cancelled';

interface Order {
  id: number;
  customer: string;
  region: string;
  date: Date;
  status: Status;
  total: number;
}

const STATUS = {
  paid: { label: "To'langan", color: 'success' },
  pending: { label: 'Kutilmoqda', color: 'warning' },
  shipped: { label: "Yo'lda", color: 'info' },
  cancelled: { label: 'Bekor qilingan', color: 'danger' },
} as const;

const NAMES = [
  'Jasur Karimov',
  'Malika Rahimova',
  "Bekzod G'aniyev",
  'Nodira Saidova',
  'Aziz Normatov',
];
const REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', "Farg'ona", 'Xorazm'];
const STATUSES = Object.keys(STATUS) as Status[];

const orders: Order[] = Array.from({ length: 48 }, (_, i) => ({
  id: 1042 + i,
  customer: NAMES[(i * 3) % NAMES.length]!,
  region: REGIONS[(i * 7) % REGIONS.length]!,
  date: new Date(2026, 9, 21 - (i % 30)),
  status: STATUSES[(i * 5 + (i >> 2)) % 4]!,
  total: 85_000 + ((i * 377_311) % 4_800_000),
}));

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', width: 88, sortable: true, cell: (o) => `#${o.id}` },
  { key: 'customer', header: 'Mijoz', sortable: true },
  { key: 'region', header: 'Viloyat', sortable: true, filter: 'select' },
  { key: 'date', header: 'Sana', sortable: true, cell: (o) => formatDate(o.date) },
  {
    key: 'status',
    header: 'Holat',
    filter: 'multiselect',
    filterOptions: STATUSES.map((s) => ({ value: s, label: STATUS[s].label })),
    searchValue: (o) => STATUS[o.status].label,
    cell: (o) => (
      <Badge dot color={STATUS[o.status].color}>
        {STATUS[o.status].label}
      </Badge>
    ),
  },
  {
    key: 'total',
    header: 'Summa',
    numeric: true,
    sortable: true,
    cell: (o) => formatMoney(o.total),
  },
];

export default function DataTableBasic() {
  return (
    <DataTable
      label="Buyurtmalar"
      data={orders}
      columns={columns}
      searchable
      pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 25] }}
      className="w-full"
      toolbar={
        <Button variant="primary" leftIcon={<Plus />} onClick={() => toast('Yangi buyurtma')}>
          Qo'shish
        </Button>
      }
    />
  );
}
