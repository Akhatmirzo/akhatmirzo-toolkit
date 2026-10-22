'use client';

import { formatMoney } from '@akhatmirzo/core';
import { Button, Field, IconButton, Input, Tooltip, toast } from '@akhatmirzo/ui';
import { ArrowRight, Minus, Plus, ShoppingCart, Tag, Trash2, Truck, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CheckoutShell, StepActions } from './checkout-shell';
import { FREE_COURIER_FROM, promoCodes } from './data';
import { ProductArt } from './product-art';
import type { CartLine } from './pricing';
import { useCheckout } from './store';
import { useCheckoutPath } from './use-checkout-path';

export function CartStep() {
  const { lines, totals, hydrated } = useCheckout();
  const path = useCheckoutPath();
  const router = useRouter();

  if (hydrated && lines.length === 0) return <EmptyCart />;

  return (
    <CheckoutShell
      step={1}
      title="Savatcha"
      description={`${totals.count} dona mahsulot`}
      summaryItems={false}
      summaryAction={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight aria-hidden="true" />}
          onClick={() => router.push(path('/delivery'))}
        >
          Rasmiylashtirish
        </Button>
      }
    >
      <FreeShippingProgress left={totals.toFreeCourier} />

      <h2 id="cart-items-title" className="sr-only">
        Savatchadagi mahsulotlar
      </h2>
      <ul
        aria-labelledby="cart-items-title"
        className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-surface shadow-xs"
      >
        {lines.map((line) => (
          <CartRow key={line.key} line={line} />
        ))}
      </ul>

      <PromoForm />

      {/* Kompyuterda asosiy tugma xulosada — bu yerda faqat telefon/planshet uchun */}
      <StepActions backHref={path()} backLabel="Xaridni davom ettirish">
        <Button
          variant="primary"
          size="lg"
          rightIcon={<ArrowRight aria-hidden="true" />}
          onClick={() => router.push(path('/delivery'))}
          className="lg:hidden"
        >
          Rasmiylashtirish
        </Button>
      </StepActions>
    </CheckoutShell>
  );
}

function FreeShippingProgress({ left }: { left: number }) {
  const percent = Math.min(100, Math.round(((FREE_COURIER_FROM - left) / FREE_COURIER_FROM) * 100));
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <p className="flex items-center gap-2 text-sm">
        <Truck aria-hidden="true" className="size-4 shrink-0 text-primary" />
        {left > 0 ? (
          <span>
            Bepul kuryergacha yana <strong className="tabular-nums">{formatMoney(left)}</strong>{' '}
            xarid qiling
          </span>
        ) : (
          <span className="font-medium text-success-soft-foreground">
            Ajoyib! Kuryer orqali yetkazib berish bepul
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Bepul yetkazib berishgacha"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={left > 0 ? 'h-full rounded-full bg-primary' : 'h-full rounded-full bg-success'}
          style={{ width: `${percent}%`, transition: 'width 300ms var(--ak-ease-out)' }}
        />
      </div>
    </div>
  );
}

function CartRow({ line }: { line: CartLine }) {
  const { setQty, removeItem, restoreItem } = useCheckout();
  const { product } = line;

  const remove = () => {
    const removed = removeItem(line.key);
    if (!removed) return;
    toast('Savatchadan olib tashlandi', {
      description: product.name,
      duration: 8000,
      action: {
        label: 'Qaytarish',
        altText: 'Mahsulotni savatchaga qaytarish',
        onClick: () => restoreItem(removed.item, removed.index),
      },
    });
  };

  const increase = () => {
    if (line.qty >= product.stock) {
      toast.warning(`Omborda faqat ${product.stock} dona bor`);
      return;
    }
    setQty(line.key, line.qty + 1);
  };

  return (
    <li className="flex gap-3 p-4 sm:gap-4">
      <ProductArt icon={product.icon} tone={product.tone} className="size-16 sm:size-20" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-5 sm:text-base">{product.name}</h3>
            <p className="mt-0.5 text-xs text-text-muted">
              {line.variant ? `${product.variantLabel}: ${line.variant} · ` : ''}
              {formatMoney(product.price)} / dona
            </p>
          </div>
          <Tooltip content="O'chirish">
            <IconButton
              size="sm"
              variant="ghost"
              aria-label={`${product.name} — savatchadan o'chirish`}
              onClick={remove}
              className="-mt-1 -mr-1 shrink-0 hover:text-danger"
            >
              <Trash2 aria-hidden="true" />
            </IconButton>
          </Tooltip>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <div
            role="group"
            aria-label={`${product.name} miqdori`}
            className="inline-flex items-center rounded-lg border border-border"
          >
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="Kamaytirish"
              disabled={line.qty <= 1}
              onClick={() => setQty(line.key, line.qty - 1)}
            >
              <Minus aria-hidden="true" />
            </IconButton>
            <output
              aria-live="polite"
              className="w-8 text-center text-sm font-semibold tabular-nums"
            >
              {line.qty}
            </output>
            <IconButton size="sm" variant="ghost" aria-label="Ko'paytirish" onClick={increase}>
              <Plus aria-hidden="true" />
            </IconButton>
          </div>
          <span className="text-base font-bold tabular-nums">{formatMoney(line.total)}</span>
        </div>
      </div>
    </li>
  );
}

function PromoForm() {
  const { promo, applyPromo, removePromo, totals } = useCheckout();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Promokodni kiriting');
      return;
    }
    setChecking(true);
    // Promokod "serverda" tekshirilayotgandek
    setTimeout(() => {
      setChecking(false);
      if (applyPromo(code)) {
        setError(null);
        setCode('');
        toast.success("Promokod qo'llandi", {
          description: promoCodes[code.trim().toUpperCase()]?.label,
        });
      } else {
        setError('Bunday promokod topilmadi yoki muddati tugagan');
      }
    }, 600);
  };

  if (promo) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
          <Tag aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold">
            <span className="font-mono">{promo}</span> promokodi qo'llandi
          </p>
          <p className="mt-0.5 text-text-muted">
            {promoCodes[promo]?.label} — {formatMoney(totals.discount)} tejadingiz
          </p>
        </div>
        <Tooltip content="Promokodni olib tashlash">
          <IconButton
            size="sm"
            variant="ghost"
            aria-label="Promokodni olib tashlash"
            onClick={removePromo}
          >
            <X aria-hidden="true" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-4 rounded-xl border border-border bg-surface p-4 shadow-xs"
    >
      <Field
        label="Promokod"
        description={
          error ? undefined : (
            <>
              Sinab ko'ring: <span className="font-mono font-semibold">SALOM10</span>
            </>
          )
        }
        error={error}
      >
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="Masalan, SALOM10"
            autoComplete="off"
            leftIcon={<Tag aria-hidden="true" />}
            className="flex-1"
            inputClassName="font-mono uppercase"
          />
          <Button type="submit" loading={checking}>
            Qo'llash
          </Button>
        </div>
      </Field>
    </form>
  );
}

function EmptyCart() {
  const path = useCheckoutPath();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground">
        <ShoppingCart aria-hidden="true" className="size-9" strokeWidth={1.5} />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Savatcha bo'sh</h1>
      <p className="mt-2 max-w-sm text-sm text-text-muted">
        Hali hech narsa qo'shmadingiz. Katalogdan yoqqan mahsulotni tanlang — u shu yerda paydo
        bo'ladi.
      </p>
      <Button asChild variant="primary" size="lg" className="mt-6">
        <Link href={path()}>Xaridni boshlash</Link>
      </Button>
    </main>
  );
}
