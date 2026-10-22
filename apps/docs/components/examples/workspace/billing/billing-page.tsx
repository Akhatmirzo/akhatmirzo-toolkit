'use client';

import { formatDate, formatMoney } from '@akhatmirzo/core';
import { Badge, Button, confirm, toast } from '@akhatmirzo/ui';
import { CreditCard, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { plans, planPrice } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { PageHeader, useMounted } from '../ui';
import { CardDialog } from './card-dialog';
import { InvoicesSection } from './invoices-section';
import { PlansSection } from './plans-section';
import { UsageSection } from './usage-section';

/** Keyingi oyning 1-kuni — keyingi to'lov sanasi */
function nextBillingDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export function BillingPage() {
  const { billing, setBilling } = useWorkspace();
  const [cardOpen, setCardOpen] = useState(false);
  const mounted = useMounted();
  const plan = plans.find((p) => p.id === billing.plan) ?? plans[1]!;
  const price = planPrice(plan, billing.cycle);
  const free = price === 0;

  const cancel = async () => {
    const ok = await confirm({
      title: 'Obunani bekor qilasizmi?',
      description:
        "Joriy davr oxirigacha hamma narsa ishlaydi, so'ng Boshlang'ich (bepul) tarifga o'tasiz.",
      confirmText: 'Obunani bekor qilish',
      cancelText: 'Qolish',
      variant: 'danger',
      onConfirm: () => fakeRequest(900),
    });
    if (!ok) return;
    setBilling((prev) => ({ ...prev, plan: 'starter' }));
    toast('Obuna bekor qilindi', { description: "Boshlang'ich tarifga o'tdingiz." });
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Tarif va to'lov"
        description="Obunangiz, foydalanish ko'rsatkichlari va to'lovlar tarixi."
      />

      <div className="flex flex-col gap-6">
        {/* Joriy tarif */}
        <section
          aria-labelledby="current-plan"
          className="grid overflow-hidden rounded-2xl border border-border bg-surface shadow-xs md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        >
          <div className="p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Sparkles aria-hidden="true" className="size-4 text-primary" />
              Joriy tarif
            </p>
            <h2
              id="current-plan"
              className="mt-2 flex flex-wrap items-center gap-2 text-2xl font-bold"
            >
              {plan.name}
              <Badge color={free ? 'neutral' : 'primary'}>
                {free ? 'Bepul' : billing.cycle === 'yearly' ? 'Yillik' : 'Oylik'}
              </Badge>
            </h2>
            <p className="mt-1 text-sm text-text-muted">{plan.description}</p>
            <p className="mt-5 text-3xl font-bold tracking-tight tabular-nums">
              {free ? "0 so'm" : formatMoney(price)}
              <span className="ml-1 text-base font-normal text-text-muted">/ oy</span>
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {free
                ? "To'lov talab qilinmaydi"
                : `Keyingi to'lov: ${mounted ? formatDate(nextBillingDate(), 'd MMMM yyyy') : '…'}${billing.cycle === 'yearly' ? ` · yiliga ${formatMoney(price * 12)}` : ''}`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="primary" asChild>
                <a href="#plans">Tarifni o&apos;zgartirish</a>
              </Button>
              {!free && (
                <Button variant="ghost" onClick={cancel}>
                  Obunani bekor qilish
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 border-t border-border bg-surface-muted/50 p-5 sm:p-6 md:border-t-0 md:border-l">
            <p className="text-sm font-medium">To&apos;lov usuli</p>
            <div className="relative aspect-[1.6] w-full max-w-72 overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary-hover p-4 text-primary-foreground shadow-md">
              <span
                aria-hidden="true"
                className="absolute -top-10 -right-10 size-32 rounded-full bg-primary-foreground/10"
              />
              <span
                aria-hidden="true"
                className="absolute -bottom-12 -left-6 size-28 rounded-full bg-primary-foreground/10"
              />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <CreditCard aria-hidden="true" className="size-6" />
                  <span className="text-sm font-semibold tracking-wide">{billing.card.brand}</span>
                </div>
                <p className="font-mono text-lg tracking-widest tabular-nums">
                  •••• •••• •••• {billing.card.last4}
                </p>
                <p className="text-xs opacity-80">Amal qiladi: {billing.card.expires}</p>
              </div>
            </div>
            <Button variant="soft" className="self-start" onClick={() => setCardOpen(true)}>
              Kartani o&apos;zgartirish
            </Button>
          </div>
        </section>

        <UsageSection />
        <PlansSection />
        <InvoicesSection />
      </div>

      <CardDialog open={cardOpen} onOpenChange={setCardOpen} />
    </div>
  );
}
