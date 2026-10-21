'use client';

import {
  DataTable,
  DropdownMenu,
  IconButton,
  toast,
  type DataTableColumn,
  Button,
} from '@akhatmirzo/ui';
import { Download, Ellipsis, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

const initial: Product[] = [
  { id: 'p1', name: "Paxta ko'ylak", sku: 'KY-001', stock: 42 },
  { id: 'p2', name: "Atlas ro'mol", sku: 'RM-014', stock: 8 },
  { id: 'p3', name: 'Choynak (1.5 l)', sku: 'CH-203', stock: 0 },
  { id: 'p4', name: "Do'ppi", sku: 'DP-077', stock: 120 },
  { id: 'p5', name: 'Sopol lagan', sku: 'LG-310', stock: 15 },
];

const columns: DataTableColumn<Product>[] = [
  { key: 'name', header: 'Mahsulot', sortable: true },
  { key: 'sku', header: 'Artikul' },
  { key: 'stock', header: 'Qoldiq', numeric: true, sortable: true },
];

export default function DataTableSelection() {
  const [products, setProducts] = useState(initial);
  const remove = (ids: string[]) => setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));

  return (
    <DataTable
      label="Mahsulotlar"
      data={products}
      columns={columns}
      selectable
      className="w-full"
      onRowClick={(p) => toast(`${p.name} ochildi`)}
      bulkActions={(rows, clear) => (
        <>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download />}
            onClick={() => toast(`${rows.length} ta eksport qilindi`)}
          >
            Eksport
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 />}
            onClick={() => {
              remove(rows.map((r) => r.id));
              clear();
            }}
          >
            O'chirish
          </Button>
        </>
      )}
      rowActions={(p) => (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <IconButton variant="ghost" size="sm" aria-label={`${p.name}: amallar`}>
              <Ellipsis />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Item icon={<Eye />} onSelect={() => toast(p.name)}>
              Ko'rish
            </DropdownMenu.Item>
            <DropdownMenu.Item variant="danger" icon={<Trash2 />} onSelect={() => remove([p.id])}>
              O'chirish
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    />
  );
}
