'use client';

import { formatDate, formatMoney, formatPhone, timeAgo } from '@akhatmirzo/core';
import { Avatar, Badge, Button, Drawer, Field, Textarea, toast } from '@akhatmirzo/ui';
import { Mail, MapPin, MessageCircle, Phone, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DEMO_NOW, type Customer } from '../data';
import { StatusBadge } from '../meta';
import { useAdminHref } from '../nav';
import { useAdmin } from '../store';
import { EmptyState } from '../ui';
import { SEGMENT_META, segmentOf } from './segments';

export function CustomerDrawer({
  customer,
  onOpenChange,
}: {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Drawer open={customer !== null} onOpenChange={onOpenChange}>
      {customer && (
        <Drawer.Content size="lg" title="Mijoz kartasi" hideTitle>
          <CustomerCard key={customer.id} customer={customer} />
        </Drawer.Content>
      )}
    </Drawer>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  const { orders, customerStats, updateCustomer } = useAdmin();
  const href = useAdminHref();
  const [note, setNote] = useState(customer.note ?? '');
  const stats = customerStats.get(customer.id);
  const segment = SEGMENT_META[segmentOf(customer, stats)];
  const history = orders
    .filter((o) => o.customerId === customer.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const saveNote = () => {
    updateCustomer(customer.id, { note: note.trim() || undefined });
    toast.success('Izoh saqlandi');
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Avatar name={customer.name} size="xl" />
        <div>
          <h2 className="text-xl font-semibold">{customer.name}</h2>
          <p className="mt-1 text-sm text-text-muted">
            Mijoz {formatDate(customer.createdAt, 'd MMMM yyyy')} dan beri
          </p>
        </div>
        <Badge color={segment.color}>{segment.label}</Badge>
        <div className="mt-1 flex gap-2">
          <Button asChild size="sm" variant="soft" leftIcon={<Phone aria-hidden="true" />}>
            <a href={`tel:+998${customer.phone}`} data-autofocus="">
              Qo&apos;ng&apos;iroq
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<MessageCircle aria-hidden="true" />}
            onClick={() =>
              toast.success('SMS yuborildi', { description: formatPhone(customer.phone) })
            }
          >
            SMS yuborish
          </Button>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[
          ['Buyurtmalar', String(stats?.orders ?? 0)],
          ['Jami xarid', formatMoney(stats?.spent ?? 0, { currency: false })],
          [
            "O'rtacha chek",
            formatMoney(stats?.orders ? Math.round(stats.spent / stats.orders) : 0, {
              currency: false,
            }),
          ],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-surface-muted px-2 py-3">
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="mt-1 text-sm font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 flex flex-col gap-3 text-sm">
        <li className="flex items-center gap-3">
          <Phone aria-hidden="true" className="size-4 text-text-muted" />
          {formatPhone(customer.phone)}
        </li>
        <li className="flex items-center gap-3">
          <Mail aria-hidden="true" className="size-4 text-text-muted" />
          <a
            href={`mailto:${customer.email}`}
            className="focus-ring rounded text-link hover:underline"
          >
            {customer.email}
          </a>
        </li>
        <li className="flex items-center gap-3">
          <MapPin aria-hidden="true" className="size-4 text-text-muted" />
          {customer.region}, {customer.city}
        </li>
      </ul>

      <section className="mt-6">
        <h3 className="mb-3 text-xs font-semibold tracking-wide text-text-muted uppercase">
          Buyurtmalar tarixi
        </h3>
        {history.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag aria-hidden="true" />}
            title="Hali buyurtma yo'q"
            className="py-8"
          />
        ) : (
          <ul className="-mx-2 flex flex-col">
            {history.map((o) => (
              <li key={o.id}>
                <Link
                  href={`${href('orders')}?order=${o.id}`}
                  className="focus-ring flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-fast hover:bg-surface-muted"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">#{o.id}</p>
                    <p className="text-xs text-text-muted">{timeAgo(o.createdAt, DEMO_NOW)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                  <span className="w-28 text-right text-sm font-semibold tabular-nums">
                    {formatMoney(o.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <Field label="Ichki izoh" description="Faqat xodimlar ko'radi">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Masalan: faqat kechqurun qo'ng'iroq qilish kerak"
            autoResize
            minRows={2}
            maxLength={300}
          />
        </Field>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={saveNote} disabled={note === (customer.note ?? '')}>
            Izohni saqlash
          </Button>
        </div>
      </section>
    </>
  );
}
