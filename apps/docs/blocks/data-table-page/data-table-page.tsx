'use client';

import { formatDate, formatMoney, formatPhone } from '@akhatmirzo/core';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  EmptyState,
  IconButton,
  Input,
  Pagination,
  PaginationInfo,
  Select,
  toast,
  type BadgeColor,
  type DataTableColumn,
} from '@akhatmirzo/ui';
import {
  Ban,
  Download,
  Ellipsis,
  Eye,
  FilterX,
  Plus,
  Printer,
  Search,
  SearchX,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Status = 'new' | 'packing' | 'shipping' | 'delivered' | 'cancelled';

interface Order {
  id: number;
  customer: string;
  phone: string;
  region: string;
  date: Date;
  status: Status;
  total: number;
}

const STATUS: Record<Status, { label: string; color: BadgeColor }> = {
  new: { label: 'Yangi', color: 'info' },
  packing: { label: "Yig'ilmoqda", color: 'warning' },
  shipping: { label: "Yo'lda", color: 'primary' },
  delivered: { label: 'Yetkazildi', color: 'success' },
  cancelled: { label: 'Bekor qilindi', color: 'danger' },
};

const CUSTOMERS = [
  'Dilnoza Yusupova',
  'Otabek Qodirov',
  'Malika Rahimova',
  'Jasur Karimov',
  'Nodira Saidova',
  'Rustam Xolmatov',
  'Shahnoza Ergasheva',
  'Sardor Aliyev',
];
const REGIONS = ['Toshkent', 'Samarqand', 'Buxoro', "Farg'ona", 'Andijon', 'Namangan'];
const OPERATORS = ['90', '91', '93', '94', '97', '99', '88', '33'];
const STATUSES: Status[] = ['delivered', 'shipping', 'new', 'delivered', 'packing', 'cancelled'];

const ORDERS: Order[] = Array.from({ length: 46 }, (_, i) => ({
  id: 10482 - i,
  customer: CUSTOMERS[(i * 5) % CUSTOMERS.length]!,
  phone: `${OPERATORS[i % OPERATORS.length]}${String(1_234_567 + i * 104_729).slice(-7)}`,
  region: REGIONS[(i * 3 + (i >> 2)) % REGIONS.length]!,
  date: new Date(2026, 9, 22 - Math.floor(i / 3)),
  status: STATUSES[(i * 7) % STATUSES.length]!,
  total: 85_000 + ((i * 271_828) % 4_200_000),
}));

const PAGE_SIZE = 8;

const columns: DataTableColumn<Order>[] = [
  { key: 'id', header: '№', width: 96, cell: (o) => <span className="font-medium">#{o.id}</span> },
  {
    key: 'customer',
    header: 'Mijoz',
    cell: (o) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={o.customer} size="sm" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{o.customer}</span>
          <span className="text-xs text-text-muted tabular-nums">{formatPhone(o.phone)}</span>
        </span>
      </span>
    ),
  },
  { key: 'region', header: 'Hudud' },
  { key: 'date', header: 'Sana', cell: (o) => formatDate(o.date) },
  {
    key: 'status',
    header: 'Holat',
    cell: (o) => (
      <Badge color={STATUS[o.status].color} dot>
        {STATUS[o.status].label}
      </Badge>
    ),
  },
  { key: 'total', header: 'Summa', numeric: true, cell: (o) => formatMoney(o.total) },
];

export default function DataTablePageBlock() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [region, setRegion] = useState('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ORDERS.filter(
      (o) =>
        (status === 'all' || o.status === status) &&
        (region === 'all' || o.region === region) &&
        (!q || o.customer.toLowerCase().includes(q) || String(o.id).includes(q)),
    );
  }, [query, status, region]);

  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = query !== '' || status !== 'all' || region !== 'all';

  // Filtr o'zgarsa — birinchi sahifaga qaytamiz
  const search = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const reset = () => {
    setQuery('');
    setStatus('all');
    setRegion('all');
    setPage(1);
  };

  return (
    <section className="@container w-full bg-background font-sans text-text">
      <div className="flex flex-col gap-6 p-4 @3xl:p-8">
        <div className="flex flex-col gap-4 @2xl:flex-row @2xl:items-end @2xl:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-2xl font-bold tracking-tight">Buyurtmalar</h2>
            <p className="m-0 text-sm text-text-muted">
              Oxirgi 30 kundagi {ORDERS.length} ta buyurtma — holat va hudud bo&apos;yicha saralang
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<Download />}
              onClick={() => toast(`${filtered.length} ta buyurtma Excel'ga eksport qilindi`)}
            >
              Eksport
            </Button>
            <Button variant="primary" leftIcon={<Plus />}>
              Yangi buyurtma
            </Button>
          </div>
        </div>

        <div className="grid gap-3 @2xl:grid-cols-[minmax(0,1fr)_200px_200px] @4xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
          <Input
            aria-label="Qidirish"
            placeholder="Mijoz yoki buyurtma raqami"
            leftIcon={<Search />}
            clearable
            value={query}
            onChange={(e) => search(e.target.value)}
            onClear={() => search('')}
          />
          <Select
            aria-label="Holat"
            value={status}
            onValueChange={(value) => {
              setStatus(value as Status | 'all');
              setPage(1);
            }}
          >
            <Select.Item value="all">Barcha holatlar</Select.Item>
            {(Object.keys(STATUS) as Status[]).map((key) => (
              <Select.Item key={key} value={key}>
                {STATUS[key].label}
              </Select.Item>
            ))}
          </Select>
          <Select
            aria-label="Hudud"
            value={region}
            onValueChange={(value) => {
              setRegion(value);
              setPage(1);
            }}
          >
            <Select.Item value="all">Barcha hududlar</Select.Item>
            {REGIONS.map((name) => (
              <Select.Item key={name} value={name}>
                {name}
              </Select.Item>
            ))}
          </Select>
          {hasFilters && (
            <Button variant="ghost" leftIcon={<FilterX />} onClick={reset}>
              Tozalash
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border">
            <EmptyState
              icon={<SearchX />}
              title="Hech narsa topilmadi"
              description="Tanlangan filtrlarga mos buyurtma yo'q. Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring."
              action={
                <Button variant="outline" leftIcon={<FilterX />} onClick={reset}>
                  Filtrlarni tozalash
                </Button>
              }
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <DataTable
              label="Buyurtmalar"
              data={rows}
              columns={columns}
              getRowId={(o) => String(o.id)}
              className="w-full"
              rowActions={(o) => (
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <IconButton variant="ghost" size="sm" aria-label={`#${o.id} amallari`}>
                      <Ellipsis />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item icon={<Eye />}>Batafsil</DropdownMenu.Item>
                    <DropdownMenu.Item
                      icon={<Printer />}
                      onSelect={() => toast(`#${o.id} uchun chek chop etilmoqda`)}
                    >
                      Chek chiqarish
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      icon={<Ban />}
                      variant="danger"
                      disabled={o.status === 'delivered' || o.status === 'cancelled'}
                      onSelect={() => toast.error(`#${o.id} bekor qilindi`)}
                    >
                      Bekor qilish
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu>
              )}
            />
            <div className="flex flex-col items-center gap-3 @2xl:flex-row @2xl:justify-between">
              <PaginationInfo page={page} pageSize={PAGE_SIZE} total={filtered.length} />
              <Pagination
                page={page}
                onPageChange={setPage}
                total={filtered.length}
                pageSize={PAGE_SIZE}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
