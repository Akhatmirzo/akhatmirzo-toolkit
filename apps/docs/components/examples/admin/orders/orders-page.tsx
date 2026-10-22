'use client';

import { formatDate, formatMoney, formatPhone, formatNumber } from '@akhatmirzo/core';
import {
  Avatar,
  Button,
  DataTable,
  DropdownMenu,
  IconButton,
  Tabs,
  confirm,
  toast,
  type DataTableColumn,
} from '@akhatmirzo/ui';
import { Download, Eye, MoreHorizontal, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { PAYMENT_METHODS, REGIONS, STATUS_ORDER, type Order, type OrderStatus } from '../data';
import { PAYMENT_LABEL, STATUS_META, StatusBadge } from '../meta';
import { useAdmin } from '../store';
import { PageHeader, QueryParam, useSimulatedLoading, wait } from '../ui';
import { downloadOrdersCsv } from './csv';
import { OrderDrawer } from './order-drawer';

type StatusTab = 'all' | OrderStatus;

const columns: DataTableColumn<Order>[] = [
  {
    key: 'id',
    header: '№',
    width: 96,
    sortable: true,
    hideable: false,
    cell: (o) => <span className="font-semibold tabular-nums">#{o.id}</span>,
  },
  {
    key: 'customer',
    header: 'Mijoz',
    accessor: (o) => o.customerName,
    searchValue: (o) => `${o.customerName} ${o.phone}`,
    sortable: true,
    cell: (o) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={o.customerName} size="sm" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate font-medium">{o.customerName}</span>
          <span className="truncate text-xs text-text-muted">{formatPhone(o.phone)}</span>
        </span>
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Sana',
    accessor: (o) => new Date(o.createdAt),
    sortable: true,
    filter: 'date',
    searchable: false,
    cell: (o) => (
      <span className="tabular-nums">
        {formatDate(o.createdAt, 'dd.MM.yyyy')}
        <span className="text-text-muted"> {formatDate(o.createdAt, 'HH:mm')}</span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Holat',
    searchValue: (o) => STATUS_META[o.status].label,
    cell: (o) => <StatusBadge status={o.status} />,
  },
  {
    key: 'payment',
    header: "To'lov",
    filter: 'multiselect',
    filterOptions: PAYMENT_METHODS.map((p) => ({ value: p, label: PAYMENT_LABEL[p] })),
    searchValue: (o) => PAYMENT_LABEL[o.payment],
    cell: (o) => PAYMENT_LABEL[o.payment],
  },
  {
    key: 'region',
    header: 'Viloyat',
    filter: 'multiselect',
    filterOptions: REGIONS.map((r) => ({ value: r, label: r })),
    sortable: true,
  },
  {
    key: 'items',
    header: 'Mahsulot',
    accessor: (o) => o.items.reduce((s, it) => s + it.qty, 0),
    numeric: true,
    hidden: true,
    searchValue: (o) => o.items.map((it) => it.name).join(' '),
    cell: (o) => `${o.items.reduce((s, it) => s + it.qty, 0)} dona`,
  },
  {
    key: 'total',
    header: 'Summa',
    numeric: true,
    sortable: true,
    filter: 'range',
    cell: (o) => <span className="font-semibold">{formatMoney(o.total)}</span>,
  },
];

export function OrdersPage() {
  const { orders, setOrderStatus, deleteOrders, restoreOrders } = useAdmin();
  const loading = useSimulatedLoading(600);
  const [tab, setTab] = useState<StatusTab>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { all: orders.length } as Record<StatusTab, number>;
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const o of orders) c[o.status] += 1;
    return c;
  }, [orders]);

  const visible = useMemo(
    () => (tab === 'all' ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );
  const openOrder = orders.find((o) => o.id === openId) ?? null;

  const openFromQuery = useCallback(
    (id: string) => {
      if (orders.some((o) => o.id === id)) setOpenId(id);
      else toast.error(`#${id} buyurtma topilmadi`);
    },
    [orders],
  );

  const removeOrders = async (list: Order[]) => {
    const one = list.length === 1;
    const ok = await confirm({
      title: one
        ? `#${list[0]?.id} buyurtmani o'chirasizmi?`
        : `${list.length} ta buyurtmani o'chirasizmi?`,
      description: "O'chirilgan buyurtmalar hisobotlarda ko'rinmaydi.",
      confirmText: "O'chirish",
      variant: 'danger',
      onConfirm: () => wait(500),
    });
    if (!ok) return false;
    deleteOrders(list.map((o) => o.id));
    if (openId && list.some((o) => o.id === openId)) setOpenId(null);
    toast.success(one ? "Buyurtma o'chirildi" : `${list.length} ta buyurtma o'chirildi`, {
      action: { label: 'Qaytarish', onClick: () => restoreOrders(list) },
    });
    return true;
  };

  const changeStatus = (list: Order[], status: OrderStatus) => {
    setOrderStatus(
      list.map((o) => o.id),
      status,
      'Ommaviy amal',
    );
    toast.success(`${list.length} ta buyurtma: «${STATUS_META[status].label}»`);
  };

  const exportCsv = (list: Order[]) => {
    downloadOrdersCsv(list);
    toast.success('CSV fayl yuklab olindi', { description: `${list.length} ta buyurtma` });
  };

  return (
    <>
      <QueryParam name="order" onValue={openFromQuery} />
      <QueryParam name="status" onValue={(v) => setTab(v as StatusTab)} />

      <PageHeader
        title="Buyurtmalar"
        description={`Jami ${formatNumber(orders.length)} ta buyurtma, ${counts.new} tasi yangi.`}
        actions={
          <Button
            variant="outline"
            leftIcon={<Download aria-hidden="true" />}
            disabled={visible.length === 0}
            onClick={() => exportCsv(visible)}
          >
            Eksport
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as StatusTab)}>
        <Tabs.List aria-label="Holat bo'yicha">
          <Tabs.Trigger value="all" badge={counts.all}>
            Hammasi
          </Tabs.Trigger>
          {STATUS_ORDER.map((s) => (
            <Tabs.Trigger key={s} value={s} badge={counts[s]}>
              {STATUS_META[s].label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>

      <DataTable
        className="mt-4"
        label="Buyurtmalar"
        data={visible}
        columns={columns}
        loading={loading}
        searchable
        selectable
        mobileView="cards"
        pagination={{ pageSize: 10 }}
        initialState={{ sorting: [{ id: 'createdAt', desc: true }] }}
        labels={{
          search: '№, mijoz, telefon yoki mahsulot',
          selected: (n) => `${n} ta buyurtma tanlandi`,
        }}
        onRowClick={(o) => setOpenId(o.id)}
        empty={{
          icon: <ShoppingBag aria-hidden="true" />,
          title: "Bu holatda buyurtma yo'q",
          description: 'Boshqa holatni tanlang yoki keyinroq qayta tekshiring.',
          action:
            tab !== 'all' ? (
              <Button size="sm" onClick={() => setTab('all')}>
                Barcha buyurtmalar
              </Button>
            ) : undefined,
        }}
        rowActions={(o) => (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <IconButton size="sm" variant="ghost" aria-label={`#${o.id} amallari`}>
                <MoreHorizontal aria-hidden="true" />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item icon={<Eye />} onSelect={() => setOpenId(o.id)}>
                Ko&apos;rish
              </DropdownMenu.Item>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger icon={<RefreshCw />}>Holat</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.RadioGroup
                    value={o.status}
                    onValueChange={(v) => changeStatus([o], v as OrderStatus)}
                  >
                    {STATUS_ORDER.map((s) => (
                      <DropdownMenu.RadioItem key={s} value={s}>
                        {STATUS_META[s].label}
                      </DropdownMenu.RadioItem>
                    ))}
                  </DropdownMenu.RadioGroup>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                variant="danger"
                icon={<Trash2 />}
                onSelect={() => void removeOrders([o])}
              >
                O&apos;chirish
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )}
        bulkActions={(rows, clear) => (
          <>
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button size="sm" variant="outline" leftIcon={<RefreshCw aria-hidden="true" />}>
                  Holatni o&apos;zgartirish
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start">
                {STATUS_ORDER.map((s) => (
                  <DropdownMenu.Item
                    key={s}
                    onSelect={() => {
                      changeStatus(rows, s);
                      clear();
                    }}
                  >
                    {STATUS_META[s].label}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download aria-hidden="true" />}
              onClick={() => exportCsv(rows)}
            >
              CSV
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 aria-hidden="true" />}
              onClick={async () => {
                if (await removeOrders(rows)) clear();
              }}
            >
              O&apos;chirish
            </Button>
          </>
        )}
      />

      <OrderDrawer
        order={openOrder}
        onOpenChange={(open) => !open && setOpenId(null)}
        onDelete={(o) => void removeOrders([o])}
      />
    </>
  );
}
