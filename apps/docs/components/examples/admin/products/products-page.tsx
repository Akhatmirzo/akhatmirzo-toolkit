'use client';

import { formatMoney, formatNumber, searchMatch } from '@akhatmirzo/core';
import { useLocalStorage } from '@akhatmirzo/hooks';
import {
  Badge,
  Button,
  Card,
  DataTable,
  DropdownMenu,
  IconButton,
  Input,
  Select,
  SelectItem,
  Skeleton,
  Tabs,
  confirm,
  toast,
  type DataTableColumn,
} from '@akhatmirzo/ui';
import {
  Copy,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  MoreHorizontal,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { CATEGORIES, categoryLabel, type CategoryId, type Product } from '../data';
import { ProductThumb } from '../meta';
import { useAdmin } from '../store';
import { EmptyState, PageHeader, QueryParam, useSimulatedLoading, wait } from '../ui';
import { ProductFormDialog } from './product-form-dialog';

type StockFilter = 'all' | 'low' | 'out' | 'inactive';
type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name' | 'popular';

const SORTERS: Record<SortKey, { label: string; fn: (a: Product, b: Product) => number }> = {
  newest: { label: 'Avval yangilari', fn: (a, b) => b.createdAt - a.createdAt },
  popular: { label: "Ko'p sotilgan", fn: (a, b) => b.sold - a.sold },
  'price-asc': { label: 'Arzonroq', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Qimmatroq', fn: (a, b) => b.price - a.price },
  name: { label: 'Nomi (A–Z)', fn: (a, b) => a.name.localeCompare(b.name, 'uz') },
};

/** Ombor holati badge'i */
function StockBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock === 0) return <Badge color="danger">Tugagan</Badge>;
  if (stock < threshold) return <Badge color="warning">Kam qoldi: {stock}</Badge>;
  return <Badge color="neutral">{formatNumber(stock)} dona</Badge>;
}

export function ProductsPage() {
  const { products, saveProduct, deleteProducts, restoreProducts, lowStockThreshold } = useAdmin();
  const loading = useSimulatedLoading(600);
  const [view, setView] = useLocalStorage<'grid' | 'list'>('ak-demo:admin:products-view', 'grid');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | CategoryId>('all');
  const [stock, setStock] = useState<StockFilter>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(
    () =>
      products
        .filter((p) => category === 'all' || p.category === category)
        .filter((p) =>
          stock === 'low'
            ? p.stock < lowStockThreshold
            : stock === 'out'
              ? p.stock === 0
              : stock === 'inactive'
                ? !p.active
                : true,
        )
        .filter(
          (p) => !query || searchMatch(`${p.name} ${p.sku} ${categoryLabel(p.category)}`, query),
        )
        .sort(SORTERS[sort].fn),
    [products, category, stock, query, sort, lowStockThreshold],
  );

  const hasFilters = query !== '' || category !== 'all' || stock !== 'all';
  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setStock('all');
  };

  const openNew = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);
  const openEdit = useCallback((p: Product) => {
    setEditing(p);
    setFormOpen(true);
  }, []);

  const onSave = (product: Product) => {
    const isNew = !products.some((p) => p.id === product.id);
    saveProduct(product);
    setFormOpen(false);
    toast.success(isNew ? "Mahsulot qo'shildi" : "O'zgarishlar saqlandi", {
      description: product.name,
    });
  };

  const remove = async (p: Product) => {
    const ok = await confirm({
      title: "Mahsulotni o'chirasizmi?",
      description: `«${p.name}» katalogdan o'chiriladi.`,
      confirmText: "O'chirish",
      variant: 'danger',
      onConfirm: () => wait(400),
    });
    if (!ok) return;
    deleteProducts([p.id]);
    toast.success("Mahsulot o'chirildi", {
      description: p.name,
      action: { label: 'Qaytarish', onClick: () => restoreProducts([p]) },
    });
  };

  const duplicate = (p: Product) => {
    const copy = { ...p, id: `p${Date.now().toString(36)}`, name: `${p.name} (nusxa)`, sold: 0 };
    saveProduct(copy);
    toast.success('Nusxa yaratildi', { description: copy.name });
  };

  const toggleActive = (p: Product) => {
    saveProduct({ ...p, active: !p.active });
    toast(p.active ? 'Mahsulot sotuvdan olindi' : "Mahsulot sotuvga qo'yildi", {
      description: p.name,
    });
  };

  const actions = (p: Product) => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton size="sm" variant="ghost" aria-label={`${p.name} amallari`}>
          <MoreHorizontal aria-hidden="true" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item icon={<Pencil />} onSelect={() => openEdit(p)}>
          Tahrirlash
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Copy />} onSelect={() => duplicate(p)}>
          Nusxa olish
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={p.active ? <EyeOff /> : <Eye />} onSelect={() => toggleActive(p)}>
          {p.active ? 'Sotuvdan olish' : "Sotuvga qo'yish"}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item variant="danger" icon={<Trash2 />} onSelect={() => void remove(p)}>
          O&apos;chirish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );

  const columns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Mahsulot',
      sortable: true,
      hideable: false,
      cell: (p) => (
        <span className="flex items-center gap-3">
          <ProductThumb category={p.category} image={p.image} name={p.name} />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-medium">{p.name}</span>
            <span className="text-xs text-text-muted">{p.sku}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Toifa',
      sortable: true,
      accessor: (p) => categoryLabel(p.category),
    },
    {
      key: 'price',
      header: 'Narx',
      numeric: true,
      sortable: true,
      cell: (p) => <span className="font-semibold">{formatMoney(p.price)}</span>,
    },
    {
      key: 'stock',
      header: 'Ombor',
      sortable: true,
      cell: (p) => <StockBadge stock={p.stock} threshold={lowStockThreshold} />,
    },
    {
      key: 'sold',
      header: 'Sotilgan',
      numeric: true,
      sortable: true,
      cell: (p) => formatNumber(p.sold),
    },
    {
      key: 'active',
      header: 'Holat',
      cell: (p) =>
        p.active ? (
          <Badge color="success" dot>
            Sotuvda
          </Badge>
        ) : (
          <Badge dot>Nofaol</Badge>
        ),
    },
  ];

  return (
    <>
      <QueryParam name="new" onValue={openNew} />
      <QueryParam
        name="edit"
        onValue={(id) => {
          const p = products.find((x) => x.id === id);
          if (p) openEdit(p);
        }}
      />
      <QueryParam name="q" onValue={setQuery} />
      <QueryParam name="stock" onValue={(v) => setStock(v as StockFilter)} />

      <PageHeader
        title="Mahsulotlar"
        description={`Katalogda ${products.length} ta mahsulot, ${CATEGORIES.length} ta toifa.`}
        actions={
          <Button variant="primary" leftIcon={<Plus aria-hidden="true" />} onClick={openNew}>
            Mahsulot qo&apos;shish
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          aria-label="Mahsulot qidirish"
          placeholder="Nomi yoki SKU bo'yicha qidirish..."
          leftIcon={<Search aria-hidden="true" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          clearable
          onClear={() => setQuery('')}
          className="lg:max-w-xs lg:flex-1"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-1 sm:flex-wrap lg:flex-nowrap">
          <Select
            aria-label="Toifa"
            value={category}
            onValueChange={(v) => setCategory(v as 'all' | CategoryId)}
            className="sm:w-44"
          >
            <SelectItem value="all">Barcha toifalar</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            aria-label="Ombor holati"
            value={stock}
            onValueChange={(v) => setStock(v as StockFilter)}
            className="sm:w-40"
          >
            <SelectItem value="all">Barcha holatlar</SelectItem>
            <SelectItem value="low">Kam qolganlar</SelectItem>
            <SelectItem value="out">Tugaganlar</SelectItem>
            <SelectItem value="inactive">Nofaollar</SelectItem>
          </Select>
          <Select
            aria-label="Saralash"
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
            className="col-span-2 sm:col-span-1 sm:w-40"
          >
            {Object.entries(SORTERS).map(([key, s]) => (
              <SelectItem key={key} value={key}>
                {s.label}
              </SelectItem>
            ))}
          </Select>
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as 'grid' | 'list')}
            variant="segmented"
            className="hidden sm:ml-auto sm:block"
          >
            <Tabs.List aria-label="Ko'rinish">
              <Tabs.Trigger value="grid" aria-label="Katak ko'rinishi">
                <LayoutGrid aria-hidden="true" className="size-4" />
              </Tabs.Trigger>
              <Tabs.Trigger value="list" aria-label="Ro'yxat ko'rinishi">
                <List aria-hidden="true" className="size-4" />
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </div>
      </div>

      {hasFilters && !loading && (
        <p className="mb-4 text-sm text-text-muted" role="status">
          {filtered.length} ta natija ·{' '}
          <Button variant="link" size="sm" onClick={clearFilters}>
            Filtrlarni tozalash
          </Button>
        </p>
      )}

      {loading ? (
        <div
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <Card key={i} padding="none" className="overflow-hidden">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="mt-2 h-5 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<PackageSearch aria-hidden="true" />}
          title={products.length ? 'Hech narsa topilmadi' : "Katalog bo'sh"}
          description={
            products.length
              ? "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring."
              : "Birinchi mahsulotingizni qo'shing — u shu yerda paydo bo'ladi."
          }
          action={
            products.length ? (
              <Button onClick={clearFilters}>Filtrlarni tozalash</Button>
            ) : (
              <Button variant="primary" leftIcon={<Plus aria-hidden="true" />} onClick={openNew}>
                Mahsulot qo&apos;shish
              </Button>
            )
          }
        />
      ) : view === 'grid' ? (
        <>
          <h2 className="sr-only">Mahsulotlar ro&apos;yxati</h2>
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <li key={p.id}>
                <ProductCard
                  product={p}
                  threshold={lowStockThreshold}
                  onOpen={() => openEdit(p)}
                  actions={actions(p)}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <DataTable
          label="Mahsulotlar"
          data={filtered}
          columns={columns}
          onRowClick={openEdit}
          rowActions={actions}
          mobileView="cards"
          pagination={{ pageSize: 10 }}
        />
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSave={onSave}
      />
    </>
  );
}

function ProductCard({
  product: p,
  threshold,
  onOpen,
  actions,
}: {
  product: Product;
  threshold: number;
  onOpen: () => void;
  actions: ReactNode;
}) {
  return (
    <Card
      padding="none"
      className="group relative h-full overflow-hidden transition-shadow duration-base hover:shadow-md"
    >
      <div className="relative">
        <ProductThumb
          category={p.category}
          image={p.image}
          name={p.name}
          className="aspect-[4/3] w-full"
          iconClassName="size-12 transition-transform duration-slow ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          {!p.active && <Badge variant="solid">Nofaol</Badge>}
          {p.stock < threshold && <StockBadge stock={p.stock} threshold={threshold} />}
        </div>
        <div className="absolute top-2 right-2 z-10 rounded-lg bg-surface/80 backdrop-blur">
          {actions}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <p className="text-xs font-medium text-text-muted">{categoryLabel(p.category)}</p>
        <h3 className="text-sm leading-snug font-semibold">
          {/* Butun karta bosiladigan: tugma ko'rinmas qatlam bilan kengaytirilgan */}
          <button
            type="button"
            onClick={onOpen}
            className="focus-ring rounded text-left after:absolute after:inset-0 after:content-['']"
          >
            {p.name}
          </button>
        </h3>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-0.5 pt-3">
          <p className="text-sm font-bold whitespace-nowrap tabular-nums sm:text-base">
            {formatMoney(p.price)}
          </p>
          <p className="text-xs text-text-muted tabular-nums">{formatNumber(p.sold)} sotilgan</p>
        </div>
      </div>
    </Card>
  );
}
