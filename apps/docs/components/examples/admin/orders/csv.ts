import { formatDate } from '@akhatmirzo/core';
import type { Order } from '../data';
import { PAYMENT_LABEL, STATUS_META } from '../meta';

const escape = (value: string | number) => {
  const text = String(value);
  return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Buyurtmalarni CSV qilib yuklab beradi (Excel o'zbekcha harflarni to'g'ri ochishi uchun BOM bilan) */
export function downloadOrdersCsv(orders: Order[]) {
  const header = [
    '№',
    'Sana',
    'Mijoz',
    'Telefon',
    'Viloyat',
    'Manzil',
    'Holat',
    "To'lov",
    'Mahsulotlar',
    'Summa',
  ];
  const rows = orders.map((o) => [
    o.id,
    formatDate(o.createdAt, 'dd.MM.yyyy HH:mm'),
    o.customerName,
    `+998${o.phone}`,
    o.region,
    o.address,
    STATUS_META[o.status].label,
    PAYMENT_LABEL[o.payment],
    o.items.map((it) => `${it.name} × ${it.qty}`).join('; '),
    o.total,
  ]);
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buyurtmalar-${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
