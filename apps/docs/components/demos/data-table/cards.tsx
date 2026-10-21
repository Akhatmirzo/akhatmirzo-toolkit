'use client';

import { formatMoney } from '@akhatmirzo/core';
import { DataTable, toast, type DataTableColumn } from '@akhatmirzo/ui';

interface Order {
  id: number;
  customer: string;
  region: string;
  total: number;
}

const orders: Order[] = [
  { id: 1042, customer: 'Jasur Karimov', region: 'Toshkent', total: 1_250_000 },
  { id: 1043, customer: 'Malika Rahimova', region: 'Samarqand', total: 480_000 },
  { id: 1044, customer: 'Aziz Normatov', region: "Farg'ona", total: 2_730_000 },
];

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№' },
  { key: 'customer', header: 'Mijoz' },
  { key: 'region', header: 'Viloyat' },
  { key: 'total', header: 'Summa', numeric: true, cell: (o) => formatMoney(o.total) },
];

export default function DataTableCards() {
  return (
    <DataTable
      label="Buyurtmalar"
      data={orders}
      columns={columns}
      mobileView="cards"
      selectable
      onRowClick={(o) => toast(`Buyurtma #${o.id}`)}
      className="w-full"
    />
  );
}
