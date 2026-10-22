'use client';

import { formatMoney, formatNumber, formatPhone, timeAgo } from '@akhatmirzo/core';
import { Avatar, Badge, Card, DataTable, Skeleton, type DataTableColumn } from '@akhatmirzo/ui';
import { Crown, Repeat, UserPlus, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { DEMO_NOW, REGIONS, type Customer } from '../data';
import { useAdmin, type CustomerStats } from '../store';
import { PageHeader, QueryParam, useSimulatedLoading } from '../ui';
import { CustomerDrawer } from './customer-drawer';
import { SEGMENT_META, segmentOf, type Segment } from './segments';

interface Row extends Customer {
  stats: CustomerStats;
  segment: Segment;
}

const DAY = 86_400_000;

const columns: DataTableColumn<Row>[] = [
  {
    key: 'name',
    header: 'Mijoz',
    sortable: true,
    hideable: false,
    searchValue: (c) => `${c.name} ${c.email}`,
    cell: (c) => (
      <span className="flex items-center gap-3">
        <Avatar name={c.name} size="sm" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-medium">{c.name}</span>
          <span className="truncate text-xs text-text-muted">{c.email}</span>
        </span>
      </span>
    ),
  },
  {
    key: 'phone',
    header: 'Telefon',
    searchValue: (c) => `${c.phone} ${formatPhone(c.phone)}`,
    cell: (c) => <span className="whitespace-nowrap tabular-nums">{formatPhone(c.phone)}</span>,
  },
  {
    key: 'region',
    header: 'Viloyat',
    sortable: true,
    filter: 'multiselect',
    filterOptions: REGIONS.map((r) => ({ value: r, label: r })),
  },
  {
    key: 'segment',
    header: 'Segment',
    filter: 'multiselect',
    filterOptions: (Object.keys(SEGMENT_META) as Segment[]).map((s) => ({
      value: s,
      label: SEGMENT_META[s].label,
    })),
    searchValue: (c) => SEGMENT_META[c.segment].label,
    cell: (c) => (
      <Badge color={SEGMENT_META[c.segment].color}>{SEGMENT_META[c.segment].label}</Badge>
    ),
  },
  {
    key: 'orders',
    header: 'Buyurtmalar',
    accessor: (c) => c.stats.orders,
    numeric: true,
    sortable: true,
    searchable: false,
  },
  {
    key: 'spent',
    header: 'Jami xaridlar',
    accessor: (c) => c.stats.spent,
    numeric: true,
    sortable: true,
    filter: 'range',
    searchable: false,
    cell: (c) => <span className="font-semibold">{formatMoney(c.stats.spent)}</span>,
  },
  {
    key: 'lastOrder',
    header: "So'nggi buyurtma",
    accessor: (c) => (c.stats.lastOrderAt ? new Date(c.stats.lastOrderAt) : null),
    sortable: true,
    searchable: false,
    cell: (c) =>
      c.stats.lastOrderAt ? (
        <span className="whitespace-nowrap">{timeAgo(c.stats.lastOrderAt, DEMO_NOW)}</span>
      ) : (
        <span className="text-text-faint">—</span>
      ),
  },
];

function StatTile({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <Card padding="sm" className="flex-row items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-text-muted">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-5 w-20" />
        ) : (
          <p className="text-lg font-bold tabular-nums">{value}</p>
        )}
      </div>
    </Card>
  );
}

export function CustomersPage() {
  const { customers, customerStats } = useAdmin();
  const loading = useSimulatedLoading(600);
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo<Row[]>(
    () =>
      customers.map((c) => {
        const stats = customerStats.get(c.id) ?? { orders: 0, spent: 0, lastOrderAt: null };
        return { ...c, stats, segment: segmentOf(c, stats) };
      }),
    [customers, customerStats],
  );

  const summary = useMemo(() => {
    const buyers = rows.filter((r) => r.stats.orders > 0);
    return {
      total: rows.length,
      fresh: rows.filter((r) => DEMO_NOW.getTime() - r.createdAt < 30 * DAY).length,
      vip: rows.filter((r) => r.segment === 'vip').length,
      repeat: buyers.length
        ? Math.round((buyers.filter((r) => r.stats.orders > 1).length / buyers.length) * 100)
        : 0,
    };
  }, [rows]);

  const openCustomer = customers.find((c) => c.id === openId) ?? null;
  const openFromQuery = useCallback((id: string) => setOpenId(id), []);

  return (
    <>
      <QueryParam name="customer" onValue={openFromQuery} />
      <PageHeader
        title="Mijozlar"
        description="Xaridorlar bazasi, ularning xaridlari va faolligi."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={Users}
          label="Jami mijozlar"
          value={formatNumber(summary.total)}
          loading={loading}
        />
        <StatTile
          icon={UserPlus}
          label="So'nggi 30 kunda"
          value={`+${summary.fresh}`}
          loading={loading}
        />
        <StatTile icon={Crown} label="VIP mijozlar" value={String(summary.vip)} loading={loading} />
        <StatTile
          icon={Repeat}
          label="Qayta xarid qilganlar"
          value={`${summary.repeat}%`}
          loading={loading}
        />
      </div>

      <DataTable
        label="Mijozlar"
        data={rows}
        columns={columns}
        loading={loading}
        searchable
        mobileView="cards"
        pagination={{ pageSize: 10 }}
        initialState={{ sorting: [{ id: 'spent', desc: true }] }}
        labels={{ search: 'Ism, telefon yoki email' }}
        onRowClick={(c) => setOpenId(c.id)}
      />

      <CustomerDrawer customer={openCustomer} onOpenChange={(open) => !open && setOpenId(null)} />
    </>
  );
}
