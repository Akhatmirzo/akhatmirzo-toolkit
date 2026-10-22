'use client';

import { formatMoney, formatNumber, timeAgo } from '@akhatmirzo/core';
import { Avatar, Button, Card, Skeleton } from '@akhatmirzo/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { DEMO_NOW, type Order, type Product } from '../data';
import { ProductThumb, StatusBadge } from '../meta';
import { useAdminHref } from '../nav';

function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-4 w-16" />
        </li>
      ))}
    </ul>
  );
}

export interface TopProduct {
  product: Product;
  category: string;
  revenue: number;
  units: number;
}

export function TopProducts({ items, loading }: { items: TopProduct[]; loading?: boolean }) {
  const max = Math.max(1, ...items.map((i) => i.revenue));
  return (
    <Card padding="none" className="p-5">
      <h2 className="text-base font-semibold">Eng ko&apos;p sotilganlar</h2>
      <p className="mt-0.5 mb-5 text-sm text-text-muted">Tanlangan davrda tushum bo&apos;yicha</p>
      {loading ? (
        <ListSkeleton />
      ) : (
        <ol className="flex flex-col gap-4">
          {items.map(({ product, category, revenue, units }) => (
            <li key={product.id} className="flex items-center gap-3">
              <ProductThumb category={product.category} image={product.image} name={product.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatMoney(Math.round(revenue / 1000) * 1000)}
                  </p>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(revenue / max) * 100}%` }}
                    />
                  </div>
                  <p className="shrink-0 text-xs text-text-muted tabular-nums">
                    {category} · {formatNumber(units)} dona
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export function RecentOrders({ orders, loading }: { orders: Order[]; loading?: boolean }) {
  const href = useAdminHref();
  return (
    <Card padding="none" className="p-5">
      <div className="mb-5 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">So&apos;nggi buyurtmalar</h2>
          <p className="mt-0.5 text-sm text-text-muted">Hozirgina kelib tushganlar</p>
        </div>
        <Button asChild size="sm" variant="ghost" rightIcon={<ArrowRight aria-hidden="true" />}>
          <Link href={href('orders')}>Barchasi</Link>
        </Button>
      </div>
      {loading ? (
        <ListSkeleton />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`${href('orders')}?order=${o.id}`}
                className="focus-ring flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-fast hover:bg-surface-muted"
              >
                <Avatar name={o.customerName} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.customerName}</p>
                  <p className="truncate text-xs text-text-muted">
                    #{o.id} · {timeAgo(o.createdAt, DEMO_NOW)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold tabular-nums">{formatMoney(o.total)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
