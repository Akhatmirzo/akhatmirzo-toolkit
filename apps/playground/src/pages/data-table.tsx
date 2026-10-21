import { formatDate, formatMoney } from '@akhatmirzo/core';
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  IconButton,
  toast,
  type BadgeColor,
  type DataTableColumn,
  type DataTableState,
} from '@akhatmirzo/ui';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Code, DemoPage, DemoRow, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'DataTable', group: "Ma'lumotlar", order: 1 };

/* ---------- Namuna ma'lumotlar ---------- */

type Status = 'paid' | 'pending' | 'shipped' | 'cancelled';

interface Order {
  id: number;
  customer: string;
  phone: string;
  region: string;
  date: Date;
  status: Status;
  items: number;
  total: number;
}

const STATUS: Record<Status, { label: string; color: BadgeColor }> = {
  paid: { label: "To'langan", color: 'success' },
  pending: { label: 'Kutilmoqda', color: 'warning' },
  shipped: { label: "Yo'lda", color: 'info' },
  cancelled: { label: 'Bekor qilingan', color: 'danger' },
};
const STATUS_KEYS = Object.keys(STATUS) as Status[];

const NAMES = [
  'Sarvar Abduxoliqov',
  'Jasur Karimov',
  'Malika Rahimova',
  'Farhod Tursunov',
  'Dilnoza Yusupova',
  "Bekzod G'aniyev",
  'Nodira Saidova',
  'Otabek Qodirov',
  'Shahnoza Ergasheva',
  'Aziz Normatov',
  "Gulnora O'rinova",
  'Rustam Xolmatov',
  "Zilola Sh'ukurova",
  'Javohir Ismoilov',
  'Mohira Nazarova',
];
const REGIONS = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Andijon',
  "Farg'ona",
  'Namangan',
  'Xorazm',
  'Navoiy',
];

function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => ({
    id: 1042 + i,
    customer: NAMES[(i * 7) % NAMES.length] as string,
    phone: `+998 9${i % 10} ${String(100 + ((i * 37) % 900))} ${String(10 + (i % 90))} ${String(10 + ((i * 3) % 90))}`,
    region: REGIONS[(i * 3 + Math.floor(i / 4)) % REGIONS.length] as string,
    date: new Date(2026, 9, 21 - (i % 60), 9 + (i % 9), (i * 13) % 60),
    status: STATUS_KEYS[(i * 7 + Math.floor(i / 5)) % 4] as Status,
    items: 1 + ((i * 11) % 7),
    total: 85_000 + ((i * 377_311) % 4_800_000),
  }));
}

const ORDERS = makeOrders(248);

/* ---------- Ikonkalar ---------- */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
const MoreIcon = () => (
  <Icon>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </Icon>
);
const DownloadIcon = () => (
  <Icon>
    <path d="M12 4v12M6 10l6 6 6-6M5 20h14" />
  </Icon>
);
const TrashIcon = () => (
  <Icon>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icon>
);
const PlusIcon = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
const EyeIcon = () => (
  <Icon>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);
const BoxIcon = () => (
  <Icon>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </Icon>
);

/* ---------- Ustunlar ---------- */

const statusCell = (o: Order) => (
  <Badge dot color={STATUS[o.status].color}>
    {STATUS[o.status].label}
  </Badge>
);

const COLUMNS: DataTableColumn<Order>[] = [
  {
    key: 'id',
    header: '№',
    width: 88,
    sortable: true,
    hideable: false,
    cell: (o) => <span className="text-text-muted">#{o.id}</span>,
  },
  {
    key: 'customer',
    header: 'Mijoz',
    sortable: true,
    cell: (o) => (
      <span className="flex items-center gap-2.5">
        <Avatar name={o.customer} size="sm" />
        {o.customer}
      </span>
    ),
  },
  {
    key: 'phone',
    header: 'Telefon',
    hidden: true,
    cell: (o) => <span className="tabular-nums">{o.phone}</span>,
  },
  { key: 'region', header: 'Viloyat', sortable: true, filter: 'select' },
  {
    key: 'date',
    header: 'Sana',
    sortable: true,
    filter: 'date',
    searchable: false,
    cell: (o) => <span className="text-text-muted">{formatDate(o.date, 'dd.MM.yyyy, HH:mm')}</span>,
  },
  {
    key: 'status',
    header: 'Holat',
    filter: 'multiselect',
    filterOptions: STATUS_KEYS.map((s) => ({ value: s, label: STATUS[s].label })),
    searchValue: (o) => STATUS[o.status].label,
    cell: statusCell,
  },
  { key: 'items', header: 'Mahsulot', numeric: true, sortable: true },
  {
    key: 'total',
    header: 'Summa',
    numeric: true,
    sortable: true,
    filter: 'range',
    filterLabel: 'Summa',
    cell: (o) => formatMoney(o.total),
  },
];

/* Kichik jadvallar uchun qisqaroq ustunlar */
const SHORT_COLUMNS = COLUMNS.filter((c) =>
  ['id', 'customer', 'date', 'status', 'total'].includes(c.key),
);

function RowMenu({ order, onDelete }: { order: Order; onDelete?: (o: Order) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="ghost" size="sm" aria-label={`#${order.id} amallari`}>
          <MoreIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item
          icon={<EyeIcon />}
          onSelect={() => toast(`Buyurtma #${order.id} ochildi`)}
        >
          Ko'rish
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<DownloadIcon />}>Chekni yuklab olish</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="danger" icon={<TrashIcon />} onSelect={() => onDelete?.(order)}>
          O'chirish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

/* ---------- Bo'limlar ---------- */

function FullExample() {
  const [orders, setOrders] = useState(ORDERS);
  const remove = (ids: Set<number>) => setOrders((prev) => prev.filter((o) => !ids.has(o.id)));

  return (
    <DataTable
      label="Buyurtmalar"
      data={orders}
      columns={COLUMNS}
      searchable
      selectable
      pagination={{ pageSize: 10 }}
      labels={{ search: "Mijoz, № yoki viloyat bo'yicha" }}
      onRowClick={(o) => toast(`Buyurtma #${o.id} ochildi`)}
      rowActions={(o) => (
        <RowMenu
          order={o}
          onDelete={(x) => {
            remove(new Set([x.id]));
            toast.success(`#${x.id} o'chirildi`);
          }}
        />
      )}
      bulkActions={(rows, clear) => (
        <>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<DownloadIcon />}
            onClick={() => toast(`${rows.length} ta buyurtma eksport qilindi`)}
          >
            Eksport
          </Button>
          <Button
            variant="soft"
            size="sm"
            leftIcon={<TrashIcon />}
            className="bg-danger-soft text-danger-soft-foreground not-data-disabled:hover:bg-danger-soft"
            onClick={() => {
              remove(new Set(rows.map((r) => r.id)));
              clear();
              toast.success(`${rows.length} ta buyurtma o'chirildi`);
            }}
          >
            O'chirish
          </Button>
        </>
      )}
      toolbar={
        <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => toast('Yangi buyurtma')}>
          Qo'shish
        </Button>
      }
      empty={{
        icon: <BoxIcon />,
        title: "Hali buyurtmalar yo'q",
        description: "Yangi buyurtmalar shu yerda paydo bo'ladi.",
      }}
    />
  );
}

type DemoState = 'data' | 'first' | 'refetch' | 'empty' | 'error';

const STATE_LABELS: Record<DemoState, string> = {
  data: "Ma'lumot",
  first: 'Birinchi yuklanish',
  refetch: 'Qayta yuklanish',
  empty: "Bo'sh",
  error: 'Xato',
};

function StatesExample() {
  const [state, setState] = useState<DemoState>('first');
  const data = state === 'data' || state === 'refetch' ? ORDERS.slice(0, 5) : [];
  return (
    <div className="flex flex-col gap-4">
      <DemoRow>
        {(Object.keys(STATE_LABELS) as DemoState[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={s === state ? 'primary' : 'outline'}
            aria-pressed={s === state}
            onClick={() => setState(s)}
          >
            {STATE_LABELS[s]}
          </Button>
        ))}
      </DemoRow>
      <DataTable
        label="Holatlar namoyishi"
        data={data}
        columns={SHORT_COLUMNS}
        pagination={{ pageSize: 5 }}
        columnToggle={false}
        loading={state === 'first' || state === 'refetch'}
        error={
          state === 'error' ? 'Server javob bermadi. Internet aloqasini tekshiring.' : undefined
        }
        onRetry={() => setState('data')}
        empty={{
          icon: <BoxIcon />,
          title: "Hali buyurtmalar yo'q",
          description: 'Birinchi buyurtmani qo‘shing — u shu yerda ko‘rinadi.',
          action: (
            <Button size="sm" variant="primary" leftIcon={<PlusIcon />}>
              Buyurtma qo'shish
            </Button>
          ),
        }}
      />
    </div>
  );
}

/* Server rejimi: "server" saralaydi, filtrlaydi va sahifalaydi (600ms kechikish) */
function fakeServer(state: DataTableState): { rows: Order[]; total: number } {
  const q = state.search.toLowerCase();
  let rows = ORDERS.filter(
    (o) => !q || o.customer.toLowerCase().includes(q) || String(o.id).includes(q),
  );
  const status = state.filters.status;
  if (Array.isArray(status) && status.length) rows = rows.filter((o) => status.includes(o.status));
  for (const s of [...state.sorting].reverse()) {
    const k = s.id as keyof Order;
    rows = [...rows].sort((a, b) => (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * (s.desc ? -1 : 1));
  }
  const { pageIndex, pageSize } = state.pagination;
  return { rows: rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: rows.length };
}

function ServerExample() {
  const initial: DataTableState = {
    sorting: [],
    search: '',
    filters: {},
    pagination: { pageIndex: 0, pageSize: 10 },
  };
  const [query, setQuery] = useState(initial);
  const [result, setResult] = useState(() => fakeServer(initial));
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState('—');

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(fakeServer(query));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <DataTable
        label="Server buyurtmalari"
        data={result.rows}
        rowCount={result.total}
        columns={SHORT_COLUMNS}
        manual
        searchable
        pagination={{ pageSize: 10 }}
        loading={loading}
        onStateChange={(s) => {
          setLoading(true);
          setQuery(s);
          setLog(JSON.stringify({ ...s, filters: Object.keys(s.filters) }));
        }}
      />
      <p className="text-xs break-all text-text-muted">
        onStateChange: <Code>{log}</Code>
      </p>
    </div>
  );
}

function VirtualExample() {
  const many = useMemo(() => makeOrders(10_000), []);
  return (
    <DataTable
      label="10 000 buyurtma"
      data={many}
      columns={SHORT_COLUMNS}
      virtual
      maxHeight={420}
      density="compact"
      searchable
      columnToggle={false}
    />
  );
}

export default function Page() {
  const few = ORDERS.slice(0, 6);
  return (
    <DemoPage
      title="DataTable"
      description={
        <>
          TanStack Table asosidagi ma'lumotlar jadvali: saralash (Shift — bir nechta ustun),
          o'zbekcha qidiruv (300ms debounce, kirill/lotin farqsiz), filtrlar Popover'da va Badge
          sifatida, tanlash va ommaviy amallar, sahifalash, ustunlarni yashirish, server rejimi va
          virtual scroll.
        </>
      }
    >
      <DemoSection
        title="To'liq misol — 248 ta buyurtma"
        description="Qidirib ko'ring: «gʻaniyev», «жасур», «samarqand». Sarlavhani bosing — o'sish → kamayish → o'chiq; Shift bilan ikkinchi ustun qo'shiladi. Qatorni belgilang — ommaviy amallar paneli chiqadi."
        className="p-3 sm:p-6"
      >
        <FullExample />
      </DemoSection>

      <DemoSection
        title="Holatlar"
        description="Birinchi yuklanish — Skeleton qatorlar; qayta yuklanish — ma'lumot 60% shaffof + yuqorida ingichka progress; bo'sh; xato."
      >
        <StatesExample />
      </DemoSection>

      <DemoSection
        title="Server rejimi (manual)"
        description={
          <>
            Saralash, qidiruv, filtr va sahifa holati <Code>onStateChange</Code> orqali tashqariga
            beriladi; jadval ma'lumotni o'zi qayta ishlamaydi. Jami soni — <Code>rowCount</Code>.
          </>
        }
      >
        <ServerExample />
      </DemoSection>

      <DemoSection
        title="Virtual scroll — 10 000 qator"
        description={
          <>
            <Code>virtual</Code> — sahifalash o'rniga faqat ko'rinadigan qatorlar chiziladi;
            sarlavha yopishqoq (faqat <Code>maxHeight</Code> yoki <Code>virtual</Code> bilan).{' '}
            <Code>density="compact"</Code> — 40px qatorlar.
          </>
        }
      >
        <VirtualExample />
      </DemoSection>

      <DemoSection
        title="Zichlik va yopishqoq birinchi ustun"
        description="compact (40px) va comfortable (52px). Tor ekranda gorizontal scroll — birinchi ustun joyida qoladi."
      >
        <DataTable
          label="Zich jadval"
          data={few}
          columns={COLUMNS}
          density="compact"
          stickyFirstColumn
          selectable
          tableClassName="min-w-[900px]"
        />
        <DataTable label="Oddiy jadval" data={few} columns={SHORT_COLUMNS} columnToggle={false} />
      </DemoSection>

      <DemoSection
        title="Telefonda kartalar"
        description={
          <>
            <Code>mobileView="cards"</Code> — 640px dan tor ekranda har bir qator karta ko'rinishida
            (oynani toraytirib ko'ring).
          </>
        }
      >
        <DataTable
          label="Kartalar"
          data={few}
          columns={SHORT_COLUMNS}
          mobileView="cards"
          selectable
          onRowClick={(o) => toast(`Buyurtma #${o.id}`)}
        />
      </DemoSection>
    </DemoPage>
  );
}
