'use client';

import { formatMoney, formatNumber } from '@akhatmirzo/core';
import { Badge, Button, Tabs, cn, confirm, toast } from '@akhatmirzo/ui';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { plans, planPrice, YEARLY_DISCOUNT, type BillingCycle, type Plan } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { SettingsSection } from '../ui';

export function PlansSection() {
  const { billing, setBilling, employees } = useWorkspace();
  const seats = employees.filter((e) => e.status !== 'left').length;
  const currentIndex = plans.findIndex((p) => p.id === billing.plan);
  // Ko'rinish (oylik/yillik narxlar) — obunani o'zgartirmaydi
  const [view, setView] = useState<BillingCycle | null>(null);

  const choose = async (plan: Plan, cycle: BillingCycle) => {
    if (seats > plan.seats) {
      toast.error(`"${plan.name}" tarifiga o'tib bo'lmaydi`, {
        description: `Unda ${plan.seats} tagacha xodim, sizda esa ${seats} ta faol xodim bor.`,
      });
      return;
    }
    const samePlan = plan.id === billing.plan;
    const upgrade = plans.indexOf(plan) >= currentIndex;
    const price = planPrice(plan, cycle);
    const ok = await confirm({
      title: samePlan
        ? `${cycle === 'yearly' ? 'Yillik' : 'Oylik'} to'lovga o'tasizmi?`
        : `"${plan.name}" tarifiga o'tasizmi?`,
      description: upgrade
        ? `Yangi narx: ${formatMoney(price)} / oy${cycle === 'yearly' ? " (yillik to'lov)" : ''}. Farq joriy davr uchun hisoblab yechiladi.`
        : `Tarif keyingi hisob davridan boshlab o'zgaradi. Ba'zi imkoniyatlar o'chadi.`,
      confirmText: upgrade ? "O'tish" : 'Pasaytirish',
      variant: upgrade ? 'default' : 'danger',
      onConfirm: () => fakeRequest(900),
    });
    if (!ok) return;
    setBilling((prev) => ({ ...prev, plan: plan.id, cycle }));
    toast.success(`Tarif o'zgardi: ${plan.name}`);
  };

  return (
    <SettingsSection
      id="plans"
      title="Tariflar"
      description="Istalgan vaqtda o'zgartirish mumkin. Yillik to'lovda 2,4 oy bepul."
    >
      <Tabs
        value={view ?? billing.cycle}
        onValueChange={(v) => setView(v as BillingCycle)}
        variant="segmented"
      >
        <Tabs.List aria-label="To'lov davri" className="mb-5 w-full sm:w-auto">
          <Tabs.Trigger value="monthly" className="flex-1 sm:flex-none">
            Oylik
          </Tabs.Trigger>
          <Tabs.Trigger value="yearly" className="flex-1 sm:flex-none">
            Yillik
            <Badge size="sm" color="success">
              −{YEARLY_DISCOUNT * 100}%
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>

        {(['monthly', 'yearly'] as const).map((cycle) => (
          <Tabs.Content key={cycle} value={cycle}>
            <ul className="grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const current = plan.id === billing.plan && cycle === billing.cycle;
                const samePlan = plan.id === billing.plan;
                const price = planPrice(plan, cycle);
                return (
                  <li
                    key={plan.id}
                    className={cn(
                      'relative flex flex-col rounded-2xl border p-5',
                      plan.popular
                        ? 'border-primary shadow-md ring-1 ring-primary'
                        : 'border-border',
                    )}
                  >
                    {plan.popular && (
                      <Badge variant="solid" color="primary" className="absolute -top-2.5 left-5">
                        Mashhur
                      </Badge>
                    )}
                    <h3 className="text-base font-semibold">{plan.name}</h3>
                    <p className="mt-1 min-h-10 text-sm text-text-muted">{plan.description}</p>
                    <p className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight tabular-nums">
                        {price === 0 ? 'Bepul' : formatNumber(price)}
                      </span>
                      {price > 0 && <span className="text-sm text-text-muted">so&apos;m / oy</span>}
                    </p>
                    <p className="min-h-5 text-xs text-text-muted">
                      {cycle === 'yearly' && price > 0
                        ? `Yiliga ${formatMoney(price * 12)} — ${formatMoney((plan.monthly - price) * 12)} tejaysiz`
                        : ' '}
                    </p>
                    <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-success"
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-5"
                      fullWidth
                      variant={current ? 'outline' : plan.popular ? 'primary' : 'soft'}
                      disabled={current}
                      onClick={() => choose(plan, cycle)}
                    >
                      {current
                        ? 'Joriy tarif'
                        : samePlan
                          ? cycle === 'yearly'
                            ? "Yillikka o'tish"
                            : "Oylikka o'tish"
                          : plans.indexOf(plan) > currentIndex
                            ? "Shu tarifga o'tish"
                            : 'Pasaytirish'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Tabs.Content>
        ))}
      </Tabs>
    </SettingsSection>
  );
}
