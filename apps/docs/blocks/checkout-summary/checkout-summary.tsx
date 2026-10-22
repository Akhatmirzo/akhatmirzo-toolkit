'use client';

import { formatMoney } from '@akhatmirzo/core';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  Field,
  IconButton,
  Input,
  Stepper,
  toast,
} from '@akhatmirzo/ui';
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Shirt,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  Watch,
  Headphones,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  variant: string;
  icon: ReactNode;
  price: number;
  qty: number;
}

const INITIAL: CartItem[] = [
  {
    id: 'atlas',
    name: "Atlas ko'ylak",
    variant: "Marg'ilon atlasi · M o'lcham",
    icon: <Shirt />,
    price: 389_000,
    qty: 1,
  },
  {
    id: 'watch',
    name: 'Aqlli soat Pro',
    variant: 'Qora · 44 mm',
    icon: <Watch />,
    price: 1_249_000,
    qty: 1,
  },
  {
    id: 'buds',
    name: 'Simsiz quloqchin',
    variant: 'Oq · shovqinni yutadi',
    icon: <Headphones />,
    price: 459_000,
    qty: 2,
  },
];

const STEPS = [
  { title: 'Savat' },
  { title: 'Yetkazish', description: 'Manzil va vaqt' },
  { title: "To'lov" },
  { title: 'Tasdiqlash' },
];

/** Sinov promokodlari: kod → chegirma ulushi */
const PROMO_CODES: Record<string, number> = { TOSHKENT10: 0.1, YANGI15: 0.15 };
/** Shu summadan yuqorida yetkazish bepul */
const FREE_DELIVERY_FROM = 1_000_000;
const DELIVERY_PRICE = 25_000;

export default function CheckoutSummaryBlock() {
  const [items, setItems] = useState(INITIAL);
  const [step, setStep] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = promo ? Math.round((subtotal * (PROMO_CODES[promo] ?? 0)) / 1000) * 1000 : 0;
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_PRICE;
  const total = subtotal - discount + delivery;
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.flatMap((item) => (item.id !== id ? [item] : qty > 0 ? [{ ...item, qty }] : [])),
    );

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return setPromoError('Promokodni kiriting');
    if (!(code in PROMO_CODES)) return setPromoError("Bunday promokod yo'q yoki muddati o'tgan");
    setPromo(code);
    setPromoError('');
    setPromoInput('');
    toast.success(`${code} qo'llandi`, {
      description: `${(PROMO_CODES[code] ?? 0) * 100}% chegirma`,
    });
  };

  const stepper = (
    <>
      {/* Tor konteynerda — ixcham ko'rinish, kengida — to'liq qadamlar */}
      <div className="@2xl:hidden">
        <Stepper steps={STEPS} value={step} onValueChange={setStep} compact aria-label="Buyurtma" />
      </div>
      <div className="hidden @2xl:block">
        <Stepper
          steps={STEPS}
          value={step}
          onValueChange={setStep}
          compact={false}
          aria-label="Buyurtma"
        />
      </div>
    </>
  );

  return (
    <section className="@container w-full bg-background font-sans text-text">
      <div className="flex flex-col gap-8 p-4 @3xl:p-8">
        {stepper}

        {items.length === 0 ? (
          <Card>
            <EmptyState
              icon={<ShoppingCart />}
              title="Savatingiz bo'sh"
              description="Katalogdan mahsulot tanlang — yetkazish 1 000 000 so'mdan bepul."
              action={
                <Button variant="primary" onClick={() => setItems(INITIAL)}>
                  Xarid qilishni davom ettirish
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_380px]">
            <Card padding="none" className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <h2 className="m-0 text-lg font-semibold">Savat</h2>
                <Badge>{count} ta mahsulot</Badge>
              </div>
              <ul className="m-0 flex list-none flex-col p-0">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
                  >
                    <span
                      className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground [&_svg]:size-7"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-text-muted">{item.variant}</span>
                      <span className="text-sm font-semibold tabular-nums @xl:hidden">
                        {formatMoney(item.price * item.qty)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        role="group"
                        aria-label={`${item.name} soni`}
                        className="flex items-center rounded-lg border border-border"
                      >
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Kamaytirish"
                          disabled={item.qty <= 1}
                          onClick={() => setQty(item.id, item.qty - 1)}
                        >
                          <Minus />
                        </IconButton>
                        <span
                          className="w-8 text-center text-sm font-medium tabular-nums"
                          aria-live="polite"
                        >
                          {item.qty}
                        </span>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          aria-label="Ko'paytirish"
                          disabled={item.qty >= 9}
                          onClick={() => setQty(item.id, item.qty + 1)}
                        >
                          <Plus />
                        </IconButton>
                      </div>
                      <span className="hidden w-32 text-right font-semibold tabular-nums @xl:block">
                        {formatMoney(item.price * item.qty)}
                      </span>
                      <IconButton
                        size="sm"
                        variant="ghost"
                        aria-label={`${item.name} — o'chirish`}
                        onClick={() => setQty(item.id, 0)}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="gap-5 @4xl:sticky @4xl:top-4">
              <h2 className="m-0 text-lg font-semibold">Buyurtma xulosasi</h2>

              {promo ? (
                <div className="flex items-center justify-between gap-2 rounded-lg bg-success-soft px-3 py-2 text-sm text-success-soft-foreground">
                  <span className="flex items-center gap-2 font-medium">
                    <Tag className="size-4" aria-hidden="true" />
                    {promo} — {(PROMO_CODES[promo] ?? 0) * 100}% chegirma
                  </span>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    aria-label="Promokodni olib tashlash"
                    onClick={() => setPromo(null)}
                  >
                    <X />
                  </IconButton>
                </div>
              ) : (
                <Field
                  label="Promokod"
                  error={promoError}
                  description={!promoError ? 'Sinov uchun: TOSHKENT10' : undefined}
                >
                  <form
                    noValidate
                    onSubmit={(event) => {
                      event.preventDefault();
                      applyPromo();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        if (promoError) setPromoError('');
                      }}
                      placeholder="Masalan, YANGI15"
                      leftIcon={<Tag />}
                      className="flex-1"
                    />
                    <Button type="submit" variant="outline">
                      Qo&apos;llash
                    </Button>
                  </form>
                </Field>
              )}

              <dl className="m-0 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Mahsulotlar ({count})</dt>
                  <dd className="m-0 tabular-nums">{formatMoney(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Chegirma</dt>
                    <dd className="m-0 text-success tabular-nums">−{formatMoney(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">Yetkazib berish (Toshkent)</dt>
                  <dd className="m-0 tabular-nums">
                    {delivery === 0 ? <Badge color="success">Bepul</Badge> : formatMoney(delivery)}
                  </dd>
                </div>
              </dl>

              <Divider />

              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold">Jami</span>
                <span className="text-2xl font-bold tracking-tight tabular-nums">
                  {formatMoney(total)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight />}
                disabled={step >= STEPS.length - 1}
                onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
              >
                {step === 0 ? 'Rasmiylashtirish' : 'Davom etish'}
              </Button>

              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-xs text-text-muted">
                <li className="flex items-center gap-2">
                  <Truck className="size-4 shrink-0" aria-hidden="true" />
                  Toshkent bo&apos;ylab 1 kunda, viloyatlarga 2–3 kunda
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
                  Click, Payme, Uzcard va Humo — xavfsiz to&apos;lov
                </li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
