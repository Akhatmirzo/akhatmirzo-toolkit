'use client';

import { formatDate, formatMoney, formatPhone } from '@akhatmirzo/core';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Field,
  Select,
  SelectItem,
  cn,
  toast,
} from '@akhatmirzo/ui';
import { MapPin, MessageSquareText, Phone, Trash2, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { STATUS_ORDER, type Order, type OrderStatus } from '../data';
import { PAYMENT_LABEL, ProductThumb, STATUS_META, StatusBadge } from '../meta';
import { useAdminHref } from '../nav';
import { useAdmin } from '../store';

const TIMELINE_DOT: Record<OrderStatus, string> = {
  new: 'bg-info',
  processing: 'bg-warning',
  shipped: 'bg-primary',
  delivered: 'bg-success',
  cancelled: 'bg-danger',
};

export function OrderDrawer({
  order,
  onOpenChange,
  onDelete,
}: {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (order: Order) => void;
}) {
  return (
    <Drawer open={order !== null} onOpenChange={onOpenChange}>
      {order && (
        <Drawer.Content
          size="lg"
          title={`Buyurtma #${order.id}`}
          description={formatDate(order.createdAt, 'd MMMM yyyy, HH:mm')}
        >
          <OrderDetails order={order} onDelete={onDelete} onClose={() => onOpenChange(false)} />
        </Drawer.Content>
      )}
    </Drawer>
  );
}

/** To'lov holati: bekor qilingan buyurtmada pul qaytariladi yoki umuman olinmagan */
function paymentState(order: Order): {
  label: string;
  color: 'success' | 'warning' | 'danger' | 'neutral';
} {
  const wasPaid = order.payment !== 'cash' || order.history.some((e) => e.status === 'delivered');
  if (order.status === 'cancelled') {
    return wasPaid
      ? { label: 'Qaytarilgan', color: 'danger' }
      : { label: 'Bekor qilingan', color: 'neutral' };
  }
  return wasPaid
    ? { label: "To'langan", color: 'success' }
    : { label: "Yetkazilganda to'lanadi", color: 'warning' };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-xs font-semibold tracking-wide text-text-muted uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function OrderDetails({
  order,
  onDelete,
  onClose,
}: {
  order: Order;
  onDelete: (order: Order) => void;
  onClose: () => void;
}) {
  const { setOrderStatus } = useAdmin();
  const href = useAdminHref();
  const payment = paymentState(order);
  const current = STATUS_ORDER.indexOf(order.status);

  const changeStatus = (value: string) => {
    const status = value as OrderStatus;
    setOrderStatus([order.id], status, "Administrator tomonidan o'zgartirildi");
    toast.success(`#${order.id} holati yangilandi`, {
      description: `Yangi holat: ${STATUS_META[status].label}`,
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-surface-muted p-4">
        <div className="flex-1">
          <p className="text-xs text-text-muted">Joriy holat</p>
          <div className="mt-1.5">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <Field label="Holatni o'zgartirish" className="w-full sm:w-52">
          <Select value={order.status} onValueChange={changeStatus} size="sm">
            {STATUS_ORDER.map((s) => (
              <SelectItem
                key={s}
                value={s}
                // Orqaga qaytib bo'lmaydi; bekor qilinganni esa qayta tiklash mumkin
                disabled={
                  order.status !== 'cancelled' &&
                  s !== 'cancelled' &&
                  STATUS_ORDER.indexOf(s) < current
                }
              >
                {STATUS_META[s].label}
              </SelectItem>
            ))}
          </Select>
        </Field>
      </div>

      <Section title="Mijoz">
        <div className="flex items-start gap-3">
          <Avatar name={order.customerName} size="md" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{order.customerName}</p>
            <a
              href={`tel:+998${order.phone}`}
              className="focus-ring mt-1 inline-flex items-center gap-1.5 rounded text-text-muted hover:text-text"
            >
              <Phone aria-hidden="true" className="size-3.5" />
              {formatPhone(order.phone)}
            </a>
            <p className="mt-1 flex items-start gap-1.5 text-text-muted">
              <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              {order.region}, {order.address}
            </p>
          </div>
          <Button asChild size="sm" variant="ghost" leftIcon={<UserRound aria-hidden="true" />}>
            <Link href={`${href('customers')}?customer=${order.customerId}`}>Kartasi</Link>
          </Button>
        </div>
        {order.comment && (
          <p className="mt-3 flex gap-2 rounded-lg bg-warning-soft px-3 py-2 text-sm text-warning-soft-foreground">
            <MessageSquareText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {order.comment}
          </p>
        )}
      </Section>

      <Section title={`Mahsulotlar (${order.items.length})`}>
        <ul className="flex flex-col gap-3">
          {order.items.map((it) => (
            <li key={it.productId} className="flex items-center gap-3 text-sm">
              <ProductThumb category={it.category} name={it.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{it.name}</p>
                <p className="text-xs text-text-muted tabular-nums">
                  {it.qty} × {formatMoney(it.price)}
                </p>
              </div>
              <p className="font-semibold tabular-nums">{formatMoney(it.price * it.qty)}</p>
            </li>
          ))}
        </ul>
        <Divider className="my-4" />
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-muted">Mahsulotlar</dt>
            <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-muted">Yetkazib berish</dt>
            <dd className="tabular-nums">
              {order.delivery ? formatMoney(order.delivery) : <Badge color="success">Bepul</Badge>}
            </dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Jami</dt>
            <dd className="tabular-nums">{formatMoney(order.total)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-text-muted">To&apos;lov usuli</dt>
            <dd className="flex items-center gap-2">
              {PAYMENT_LABEL[order.payment]}
              <Badge size="sm" color={payment.color}>
                {payment.label}
              </Badge>
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Holat tarixi">
        <ol className="relative flex flex-col gap-4">
          {[...order.history].reverse().map((event, i) => (
            <li key={`${event.status}-${event.at}`} className="relative flex gap-3 pl-1">
              {i < order.history.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-4 bottom-[-1rem] left-[0.6875rem] w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative mt-1 size-3 shrink-0 rounded-full ring-4 ring-surface',
                  TIMELINE_DOT[event.status],
                )}
              />
              <div className="text-sm">
                <p className="font-medium">{STATUS_META[event.status].label}</p>
                {event.note && <p className="text-text-muted">{event.note}</p>}
                <p className="text-xs text-text-faint tabular-nums">
                  {formatDate(event.at, 'd MMMM, HH:mm')}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Drawer.Footer className="justify-between">
        <Button
          variant="ghost"
          className="text-danger"
          leftIcon={<Trash2 aria-hidden="true" />}
          onClick={() => onDelete(order)}
        >
          O&apos;chirish
        </Button>
        <Button variant="soft" onClick={onClose}>
          Yopish
        </Button>
      </Drawer.Footer>
    </>
  );
}
