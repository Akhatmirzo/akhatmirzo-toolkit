'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Badge, Button, Card, SegmentedControl, cn } from '@akhatmirzo/ui';
import { Building2, Check, Rocket, Sparkles } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type Period = 'month' | 'year';

interface Plan {
  id: string;
  name: string;
  icon: ReactNode;
  description: string;
  /** Oylik narx, so'mda (0 — bepul, null — kelishiladi) */
  monthly: number | null;
  features: string[];
  cta: string;
  popular?: boolean;
}

/** Yillik to'lovda chegirma */
const YEARLY_DISCOUNT = 0.2;

const plans: Plan[] = [
  {
    id: 'start',
    name: "Boshlang'ich",
    icon: <Sparkles />,
    description: "Yangi ochilgan kichik do'kon uchun",
    monthly: 0,
    features: ['50 tagacha mahsulot', '1 ta xodim', "Click va Payme orqali to'lov", 'Email yordam'],
    cta: 'Bepul boshlash',
  },
  {
    id: 'business',
    name: 'Biznes',
    icon: <Rocket />,
    description: "O'sib borayotgan savdo uchun hamma narsa",
    monthly: 349_000,
    features: [
      'Cheksiz mahsulot',
      '10 tagacha xodim',
      'Uzcard, Humo va Visa',
      'Ombor va yetkazib berish',
      'Telegram bot orqali bildirishnoma',
      'Ustuvor yordam 24/7',
    ],
    cta: "Biznesga o'tish",
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Korporativ',
    icon: <Building2 />,
    description: "Filiallar tarmog'i va katta jamoalar",
    monthly: null,
    features: [
      'Biznesdagi hamma imkoniyat',
      'Cheksiz xodim va filial',
      '1C va soliq integratsiyasi',
      'Shaxsiy menejer',
      'SLA 99,9%',
    ],
    cta: "Bog'lanish",
  },
];

export default function PricingBlock() {
  const [period, setPeriod] = useState<Period>('month');

  const priceOf = (plan: Plan) => {
    if (plan.monthly == null || plan.monthly === 0) return plan.monthly;
    // Yillikda ham oyiga narx ko'rsatiladi; 1 000 so'mgacha yaxlitlanadi
    return period === 'year'
      ? Math.round((plan.monthly * (1 - YEARLY_DISCOUNT)) / 1000) * 1000
      : plan.monthly;
  };

  return (
    <section className="@container w-full bg-background font-sans text-text">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-14 @3xl:px-8 @3xl:py-20">
        <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
          <Badge color="primary">Tariflar</Badge>
          <h2 className="m-0 text-3xl font-bold tracking-tight @3xl:text-4xl">
            Biznesingizga mos tarifni tanlang
          </h2>
          <p className="m-0 text-text-muted">
            Istalgan vaqtda tarifni almashtiring yoki bekor qiling. Narxlar QQS bilan, so&apos;mda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
            aria-label="To'lov davri"
          >
            <SegmentedControl.Item value="month">Oylik</SegmentedControl.Item>
            <SegmentedControl.Item value="year">Yillik</SegmentedControl.Item>
          </SegmentedControl>
          <Badge color="success" variant={period === 'year' ? 'solid' : 'soft'}>
            −{YEARLY_DISCOUNT * 100}%
          </Badge>
        </div>

        <div className="grid w-full max-w-md gap-6 @3xl:max-w-none @3xl:grid-cols-3 @3xl:items-stretch">
          {plans.map((plan) => {
            const price = priceOf(plan);
            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative gap-6',
                  plan.popular &&
                    'border-primary shadow-lg ring-1 ring-primary @3xl:-my-3 @3xl:py-9',
                )}
              >
                {plan.popular && (
                  <Badge variant="solid" color="primary" className="absolute -top-3 left-6">
                    Eng ommabop
                  </Badge>
                )}

                <div className="flex flex-col gap-3">
                  <span
                    className={cn(
                      'grid size-10 place-items-center rounded-xl [&_svg]:size-5',
                      plan.popular
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary-soft text-primary-soft-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {plan.icon}
                  </span>
                  <div>
                    <h3 className="m-0 text-lg font-semibold">{plan.name}</h3>
                    <p className="m-0 text-sm text-text-muted">{plan.description}</p>
                  </div>
                </div>

                <div className="flex min-h-16 flex-col justify-end">
                  {price == null ? (
                    <p className="m-0 text-3xl font-bold tracking-tight">Kelishiladi</p>
                  ) : price === 0 ? (
                    <p className="m-0 text-3xl font-bold tracking-tight">Bepul</p>
                  ) : (
                    <>
                      <p className="m-0 flex flex-wrap items-baseline gap-x-1.5">
                        <span className="text-3xl font-bold tracking-tight tabular-nums">
                          {formatMoney(price, { currency: false })}
                        </span>
                        <span className="text-sm text-text-muted">so&apos;m / oy</span>
                      </p>
                      <p className="m-0 h-5 text-xs text-text-muted tabular-nums">
                        {period === 'year' && plan.monthly
                          ? `Yiliga ${formatMoney(price * 12)} — ${formatMoney((plan.monthly - price) * 12)} tejaysiz`
                          : ''}
                      </p>
                    </>
                  )}
                </div>

                <Button variant={plan.popular ? 'primary' : 'outline'} fullWidth>
                  {plan.cta}
                </Button>

                <ul className="m-0 flex list-none flex-col gap-2.5 border-t border-border p-0 pt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
