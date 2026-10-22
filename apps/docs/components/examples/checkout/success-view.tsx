'use client';

import { formatDate, formatMoney, formatPhone } from '@akhatmirzo/core';
import { useCopyToClipboard } from '@akhatmirzo/hooks';
import { Badge, Button, IconButton, Skeleton, Tooltip, cn, toast } from '@akhatmirzo/ui';
import {
  Check,
  CircleCheck,
  Copy,
  CreditCard,
  MapPin,
  PackageX,
  Printer,
  RefreshCw,
  ShoppingBag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Stepper } from './checkout-shell';
import { deliveryMethods, orderStages, pickupPoints, regionById, timeSlots } from './data';
import { fromIsoDate } from './forms';
import { PriceRows } from './order-summary';
import { ProductArt } from './product-art';
import { useCheckout, type Order } from './store';
import { useCheckoutPath } from './use-checkout-path';

/** Har bosqich buyurtmadan necha daqiqa keyin bajarilgani (demo vaqt belgilari) */
const stageOffsets = [0, 1, 35, 180, 1440];

/** Naqd to'lovda ikkinchi bosqich — operator tasdig'i (pul yetkazilganda olinadi) */
const stagesOf = (order: Order) =>
  orderStages[order.delivery.method].map((s, i) =>
    i === 1 && order.payment.method === 'cash' ? 'Operator tasdiqladi' : s,
  );

export function SuccessView() {
  const { orders, hydrated } = useCheckout();
  const path = useCheckoutPath();
  const order = orders[0];

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10" aria-busy="true">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto mt-5 h-8 w-64" />
        <Skeleton className="mx-auto mt-3 h-4 w-80 max-w-full" />
        <Skeleton className="mt-10 h-72 w-full rounded-xl" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-surface-muted text-text-muted">
          <PackageX aria-hidden="true" className="size-9" strokeWidth={1.5} />
        </span>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Buyurtma topilmadi</h1>
        <p className="mt-2 max-w-sm text-sm text-text-muted">
          Hali buyurtma bermagansiz yoki demo ma&apos;lumotlari tiklangan.
        </p>
        <Button asChild variant="primary" size="lg" className="mt-6">
          <Link href={path()}>Do'konga o'tish</Link>
        </Button>
      </main>
    );
  }

  return <OrderDetails order={order} />;
}

function OrderDetails({ order }: { order: Order }) {
  const { advanceOrder } = useCheckout();
  const path = useCheckoutPath();
  const { copied, copy } = useCopyToClipboard();
  const firstName = order.delivery.name.trim().split(/\s+/)[0];

  const copyNumber = async () => {
    if (await copy(order.number)) toast.success('Buyurtma raqami nusxalandi');
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-16">
      <div className="print:hidden">
        <Stepper current={4} />
      </div>

      <section className="mt-8 flex flex-col items-center text-center" aria-labelledby="done-title">
        <span className="relative flex size-16 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-success-soft opacity-60 [animation-iteration-count:2]"
          />
          <CircleCheck aria-hidden="true" className="relative size-8" />
        </span>
        <h1 id="done-title" className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          Rahmat{firstName ? `, ${firstName}` : ''}! Buyurtmangiz qabul qilindi
        </h1>
        <p className="mt-2 max-w-lg text-sm text-text-muted">
          Tasdiq SMS orqali {formatPhone(order.delivery.phone)} raqamiga yuborildi. Holatini shu
          sahifada kuzatishingiz mumkin.
        </p>
        <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-border bg-surface py-1 pr-1 pl-4 text-sm shadow-xs">
          <span className="text-text-muted">Buyurtma</span>
          <span className="font-mono font-semibold">{order.number}</span>
          <Tooltip content={copied ? 'Nusxalandi' : 'Nusxalash'}>
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Buyurtma raqamini nusxalash"
              onClick={copyNumber}
            >
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </IconButton>
          </Tooltip>
        </div>
      </section>

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-5">
          <Tracking order={order} onAdvance={() => advanceOrder(order.id)} />
          <div className="grid gap-5 sm:grid-cols-2">
            <DeliveryCard order={order} />
            <PaymentCard order={order} />
          </div>
        </div>

        <aside
          aria-labelledby="items-title"
          className="rounded-xl border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-32"
        >
          <h2 id="items-title" className="mb-4 text-base font-semibold">
            Mahsulotlar
          </h2>
          <ul className="mb-4 flex flex-col gap-3">
            {order.items.map((i) => (
              <li key={i.key} className="flex items-center gap-3">
                <ProductArt icon={i.icon} tone={i.tone} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <p className="text-xs text-text-muted tabular-nums">
                    {i.variant ? `${i.variant} · ` : ''}
                    {i.qty} × {formatMoney(i.price)}
                  </p>
                </div>
                <span className="text-sm font-medium tabular-nums">
                  {formatMoney(i.qty * i.price)}
                </span>
              </li>
            ))}
          </ul>
          <PriceRows
            {...order.totals}
            promo={order.promo}
            deliveryLabel={deliveryMethods.find((m) => m.id === order.delivery.method)?.label ?? ''}
          />
        </aside>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <Button asChild variant="primary" size="lg" leftIcon={<ShoppingBag aria-hidden="true" />}>
          <Link href={path()}>Xaridni davom ettirish</Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          leftIcon={<Printer aria-hidden="true" />}
          onClick={() => window.print()}
        >
          Chekni chop etish
        </Button>
      </div>
    </main>
  );
}

function Tracking({ order, onAdvance }: { order: Order; onAdvance: () => void }) {
  const stages = stagesOf(order);
  const created = new Date(order.createdAt);
  const finished = order.stage >= stages.length - 1;
  const date = fromIsoDate(order.delivery.date);
  const slot = timeSlots.find((s) => s.id === order.delivery.slot);
  const eta =
    order.delivery.method === 'post'
      ? '3–5 ish kuni ichida'
      : date
        ? `${formatDate(date, 'd MMMM, EEEE')}${slot ? `, ${slot.label}` : ''}`
        : '';

  const advance = () => {
    onAdvance();
    const next = stages[order.stage + 1];
    if (next) toast.info(next, { description: `Buyurtma ${order.number}` });
  };

  return (
    <section
      aria-labelledby="track-title"
      className="rounded-xl border border-border bg-surface p-5 shadow-xs sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="track-title" className="text-base font-semibold">
            Buyurtmani kuzatish
          </h2>
          {eta && (
            <p className="mt-0.5 text-sm text-text-muted">
              {finished ? 'Yakunlandi' : `Kutilayotgan vaqt: ${eta}`}
            </p>
          )}
        </div>
        {finished ? (
          <Badge color="success">Yakunlandi</Badge>
        ) : (
          <Button
            size="sm"
            variant="soft"
            leftIcon={<RefreshCw aria-hidden="true" />}
            onClick={advance}
            className="print:hidden"
          >
            Holatni yangilash (demo)
          </Button>
        )}
      </div>

      <ol className="mt-6 flex flex-col">
        {stages.map((label, i) => {
          const done = i <= order.stage;
          const current = i === order.stage + 1 && !finished;
          const at = new Date(created.getTime() + (stageOffsets[i] ?? 0) * 60_000);
          const last = i === stages.length - 1;
          return (
            <li
              key={label}
              aria-current={current ? 'step' : undefined}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-8 bottom-0 left-[15px] w-0.5 rounded-full',
                    i < order.stage ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-moderate',
                  done && 'border-primary bg-primary text-primary-foreground',
                  current && 'border-primary bg-surface',
                  !done && !current && 'border-border bg-surface',
                )}
              >
                {done ? (
                  <Check className="size-4" strokeWidth={3} />
                ) : current ? (
                  <span className="size-2.5 animate-pulse rounded-full bg-primary" />
                ) : null}
              </span>
              <div className="pt-1">
                <p className={cn('text-sm font-medium', !done && !current && 'text-text-muted')}>
                  {label}
                  <span className="sr-only">
                    {done ? ' — bajarildi' : current ? ' — jarayonda' : ' — kutilmoqda'}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-text-muted tabular-nums">
                  {done
                    ? formatDate(at, 'd MMMM, HH:mm')
                    : current
                      ? 'Jarayonda'
                      : last && eta
                        ? eta
                        : 'Kutilmoqda'}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-xs">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground [&>svg]:size-4">
          {icon}
        </span>
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-1 text-sm">{children}</div>
    </section>
  );
}

function DeliveryCard({ order }: { order: Order }) {
  const d = order.delivery;
  const method = deliveryMethods.find((m) => m.id === d.method);
  const point = pickupPoints.find((p) => p.id === d.pickupPoint);
  return (
    <InfoCard
      icon={d.method === 'pickup' ? <MapPin aria-hidden="true" /> : <User aria-hidden="true" />}
      title="Yetkazib berish"
    >
      <p className="font-medium">{d.name}</p>
      <p className="text-text-muted tabular-nums">{formatPhone(d.phone)}</p>
      <p className="mt-2 text-text-muted">
        {d.method === 'pickup'
          ? `${point?.name} — ${point?.address}`
          : [regionById.get(d.region)?.name, d.district, d.address].filter(Boolean).join(', ')}
      </p>
      {d.note && d.method !== 'pickup' && <p className="text-xs text-text-muted">Izoh: {d.note}</p>}
      <p className="mt-2">
        <Badge size="sm">{method?.label}</Badge>
      </p>
    </InfoCard>
  );
}

const paymentNames = { card: 'Bank kartasi', click: 'Click', payme: 'Payme', cash: 'Naqd pul' };

function PaymentCard({ order }: { order: Order }) {
  const cash = order.payment.method === 'cash';
  const paid = !cash || order.stage >= stagesOf(order).length - 1;
  return (
    <InfoCard icon={<CreditCard aria-hidden="true" />} title="To'lov">
      <p className="font-medium">{paymentNames[order.payment.method]}</p>
      {order.payment.card && <p className="text-text-muted tabular-nums">{order.payment.card}</p>}
      <p className="text-text-muted">
        {formatDate(new Date(order.createdAt), 'd MMMM yyyy, HH:mm')}
      </p>
      <p className="mt-2 flex items-center gap-2">
        <Badge size="sm" color={paid ? 'success' : 'warning'} dot>
          {paid ? "To'langan" : "Qabul qilganda to'lanadi"}
        </Badge>
        <span className="font-semibold tabular-nums">{formatMoney(order.totals.total)}</span>
      </p>
    </InfoCard>
  );
}
