'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Button, DataTable, type DataTableColumn } from '@akhatmirzo/ui';
import { Inbox, Plus } from 'lucide-react';
import { useState } from 'react';

interface Order {
  id: number;
  customer: string;
  total: number;
}

const orders: Order[] = [
  { id: 1042, customer: 'Jasur Karimov', total: 1_250_000 },
  { id: 1043, customer: 'Malika Rahimova', total: 480_000 },
  { id: 1044, customer: 'Aziz Normatov', total: 2_730_000 },
];

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', width: 88 },
  { key: 'customer', header: 'Mijoz' },
  { key: 'total', header: 'Summa', numeric: true, cell: (o) => formatMoney(o.total) },
];

const STATES = {
  data: "Ma'lumot",
  first: 'Birinchi yuklanish',
  refetch: 'Qayta yuklanish',
  empty: "Bo'sh",
  error: 'Xato',
} as const;

type State = keyof typeof STATES;

export default function DataTableStates() {
  const [state, setState] = useState<State>('first');

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STATES) as State[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === state ? 'primary' : 'outline'}
            aria-pressed={s === state}
            onClick={() => setState(s)}
          >
            {STATES[s]}
          </Button>
        ))}
      </div>
      <DataTable
        label="Holatlar"
        data={state === 'data' || state === 'refetch' ? orders : []}
        columns={columns}
        columnToggle={false}
        loading={state === 'first' || state === 'refetch'}
        error={
          state === 'error' ? 'Server javob bermadi. Internet aloqasini tekshiring.' : undefined
        }
        onRetry={() => setState('data')}
        empty={{
          icon: <Inbox />,
          title: "Hali buyurtmalar yo'q",
          description: "Birinchi buyurtmani qo'shing — u shu yerda ko'rinadi.",
          action: (
            <Button size="sm" variant="primary" leftIcon={<Plus />}>
              Buyurtma qo'shish
            </Button>
          ),
        }}
      />
    </div>
  );
}
