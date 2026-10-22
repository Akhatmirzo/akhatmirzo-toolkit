'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Badge, Divider, cn } from '@akhatmirzo/ui';
import { deliveryMethods, promoCodes } from './data';
import { ProductArt } from './product-art';
import { useCheckout } from './store';

/** Narxlar ro'yxati: oraliq summa, chegirma, yetkazib berish va jami */
export function PriceRows({
  subtotal,
  discount,
  delivery,
  total,
  count,
  promo,
  deliveryLabel,
}: {
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  count: number;
  promo: string | null;
  deliveryLabel: string;
}) {
  return (
    <dl className="flex flex-col gap-2.5 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-text-muted">Mahsulotlar ({count} dona)</dt>
        <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between gap-4">
          <dt className="flex items-center gap-1.5 whitespace-nowrap text-text-muted">
            Chegirma
            {promo && (
              <Badge size="sm" color="success" className="font-mono font-semibold">
                {promo}
              </Badge>
            )}
          </dt>
          <dd className="text-success-soft-foreground tabular-nums">−{formatMoney(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-text-muted">Yetkazish · {deliveryLabel}</dt>
        <dd className={cn('tabular-nums', delivery === 0 && 'text-success-soft-foreground')}>
          {delivery === 0 ? 'Bepul' : formatMoney(delivery)}
        </dd>
      </div>
      <Divider className="my-1" />
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-base font-semibold">Jami</dt>
        <dd className="text-xl font-bold tabular-nums">{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}

export function OrderSummary({
  showItems = true,
  bare = false,
}: {
  showItems?: boolean;
  bare?: boolean;
}) {
  const { lines, totals, promo, delivery } = useCheckout();
  const method = deliveryMethods.find((m) => m.id === delivery.method);

  return (
    <div className={cn('flex flex-col gap-4', bare && 'pt-1')}>
      {showItems && lines.length > 0 && (
        <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
          {lines.map((l) => (
            <li key={l.key} className="flex items-center gap-3">
              <div className="relative">
                <ProductArt icon={l.product.icon} tone={l.product.tone} size="sm" />
                <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-text text-[11px] font-bold text-surface tabular-nums">
                  {l.qty}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.product.name}</p>
                {l.variant && <p className="text-xs text-text-muted">{l.variant}</p>}
              </div>
              <span className="text-sm font-medium tabular-nums">{formatMoney(l.total)}</span>
            </li>
          ))}
        </ul>
      )}
      <PriceRows
        {...totals}
        promo={promo && promoCodes[promo] ? promo : null}
        deliveryLabel={method?.label ?? ''}
      />
    </div>
  );
}
