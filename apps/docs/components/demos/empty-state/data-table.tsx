'use client';

import { Button, DataTable, type DataTableColumn } from '@akhatmirzo/ui';
import { Inbox, Plus } from 'lucide-react';

interface Order {
  id: number;
  customer: string;
  total: string;
}

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№' },
  { key: 'customer', header: 'Mijoz' },
  { key: 'total', header: 'Summa' },
];

const orders: Order[] = [];

export default function EmptyStateDataTable() {
  return (
    <DataTable
      className="w-full"
      label="Buyurtmalar"
      data={orders}
      columns={columns}
      empty={{
        icon: <Inbox />,
        title: "Buyurtmalar hali yo'q",
        description: "Birinchi buyurtma kelganda shu yerda ko'rinadi.",
        action: (
          <Button size="sm" variant="primary" leftIcon={<Plus />}>
            Buyurtma qo'shish
          </Button>
        ),
      }}
    />
  );
}
