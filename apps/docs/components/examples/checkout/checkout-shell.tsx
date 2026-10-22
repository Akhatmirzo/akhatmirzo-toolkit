'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Accordion, cn } from '@akhatmirzo/ui';
import { Check, ChevronLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { OrderSummary } from './order-summary';
import { useCheckout } from './store';
import { useCheckoutPath } from './use-checkout-path';

export type StepId = 1 | 2 | 3 | 4;

const steps: { id: StepId; label: string; path: string }[] = [
  { id: 1, label: 'Savatcha', path: '/cart' },
  { id: 2, label: 'Yetkazish', path: '/delivery' },
  { id: 3, label: "To'lov", path: '/payment' },
  { id: 4, label: 'Tasdiq', path: '/success' },
];

/** Bosqichlar ko'rsatkichi: o'tilgan bosqichlarga qaytish mumkin, keyingilariga — yo'q */
export function Stepper({ current }: { current: StepId }) {
  const path = useCheckoutPath();
  return (
    <nav aria-label="Xarid bosqichlari">
      <ol className="flex items-center gap-2">
        {steps.map((s, i) => {
          const done = s.id < current || current === 4;
          const active = s.id === current;
          const content = (
            <>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors duration-base',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && !done && 'border-primary bg-primary-soft text-primary-soft-foreground',
                  !done && !active && 'border-border-strong text-text-muted',
                )}
              >
                {done ? <Check aria-hidden="true" className="size-4" strokeWidth={3} /> : s.id}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  active ? 'text-text' : 'text-text-muted',
                  !active && 'hidden sm:inline',
                )}
              >
                {s.label}
              </span>
            </>
          );
          return (
            <li key={s.id} className={cn('flex items-center gap-2', i < 3 && 'flex-1')}>
              {done && current !== 4 ? (
                <Link
                  href={path(s.path)}
                  className="focus-ring flex items-center gap-2 rounded-full pr-1 hover:[&>span:last-child]:text-text"
                >
                  {content}
                  <span className="sr-only"> (bajarilgan, qaytish)</span>
                </Link>
              ) : (
                <span
                  aria-current={active ? 'step' : undefined}
                  className="flex items-center gap-2"
                >
                  {content}
                </span>
              )}
              {i < 3 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-0.5 min-w-4 flex-1 rounded-full',
                    s.id < current ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface CheckoutShellProps {
  step: Exclude<StepId, 4>;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Xulosada mahsulotlar ro'yxati (savatcha bosqichida kerak emas — ular asosiy qismda) */
  summaryItems?: boolean;
  /** Kompyuterda xulosa ostidagi tugma (masalan "Rasmiylashtirish") */
  summaryAction?: ReactNode;
}

/**
 * Checkout sahifasi: chapda bosqichlar va forma, o'ngda doimiy buyurtma xulosasi.
 * Telefonda xulosa forma ustida Accordion'ga yig'iladi.
 */
export function CheckoutShell({
  step,
  title,
  description,
  children,
  summaryItems = true,
  summaryAction,
}: CheckoutShellProps) {
  const { totals } = useCheckout();
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-10 lg:pb-16">
      <Stepper current={step} />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <div className="min-w-0">
          <header className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
          </header>

          {totals.count > 0 && (
            // Accordion sarlavhasi h3 — ierarxiya buzilmasligi uchun yashirin h2
            <section aria-labelledby="mobile-summary-title" className="mb-5 lg:hidden">
              <h2 id="mobile-summary-title" className="sr-only">
                Buyurtma xulosasi
              </h2>
              <Accordion type="single" collapsible variant="separated">
                <Accordion.Item
                  value="summary"
                  title={
                    <span className="flex w-full items-center justify-between gap-3 pr-2">
                      <span>Buyurtma xulosasi</span>
                      <span className="font-bold tabular-nums">{formatMoney(totals.total)}</span>
                    </span>
                  }
                >
                  <OrderSummary showItems={summaryItems} bare />
                </Accordion.Item>
              </Accordion>
            </section>
          )}

          {children}
        </div>

        <aside aria-label="Buyurtma xulosasi" className="hidden lg:sticky lg:top-32 lg:block">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Buyurtma xulosasi</h2>
            <OrderSummary showItems={summaryItems} />
            {summaryAction && <div className="mt-5">{summaryAction}</div>}
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-text-muted">
            <Lock aria-hidden="true" className="size-3.5" />
            Ma&apos;lumotlaringiz shifrlangan holda uzatiladi
          </p>
        </aside>
      </div>
    </main>
  );
}

/**
 * Bosqich tugmalari. Telefonda ekran pastiga yopishadi va jami summani ko'rsatadi.
 */
export function StepActions({
  backHref,
  backLabel = 'Orqaga',
  children,
}: {
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  const { totals } = useCheckout();
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      {backHref && (
        <Link
          href={backHref}
          className="focus-ring hidden h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-text-subtle hover:text-text sm:inline-flex"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col sm:hidden">
        <span className="text-xs text-text-muted">Jami</span>
        <span className="text-base font-bold tabular-nums">{formatMoney(totals.total)}</span>
      </div>
      <div className="ml-auto flex">{children}</div>
    </div>
  );
}
