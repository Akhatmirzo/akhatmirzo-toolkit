'use client';

import { formatMoney } from '@akhatmirzo/core';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  confirm,
  toast,
} from '@akhatmirzo/ui';
import { Ellipsis, PackageCheck, RotateCcw, ShoppingBag, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckoutPath } from './use-checkout-path';
import { useCheckout } from './store';

/** Do'kon sarlavhasi: logotip, savatcha (soni va summasi) va demo menyusi */
export function StoreHeader() {
  const { totals, orders, hydrated, resetAll } = useCheckout();
  const path = useCheckoutPath();
  const router = useRouter();
  const count = hydrated ? totals.count : 0;
  const lastOrder = hydrated ? orders[0] : undefined;

  const reset = async () => {
    const ok = await confirm({
      title: "Ma'lumotlarni tiklaysizmi?",
      description:
        'Savatcha, manzil, saqlangan karta va buyurtmalar tarixi demo boshidagi holatga qaytadi.',
      confirmText: 'Tiklash',
      variant: 'danger',
    });
    if (!ok) return;
    resetAll();
    router.push(path());
    toast.success("Demo ma'lumotlari tiklandi");
  };

  return (
    <header className="sticky top-11 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link
          href={path()}
          className="focus-ring flex items-center gap-2 rounded-lg pr-1 text-lg font-bold tracking-tight"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ShoppingBag aria-hidden="true" className="size-5" />
          </span>
          Bozorcha
        </Link>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href={path('/cart')}
            aria-label={`Savatcha: ${count} ta mahsulot`}
            className="focus-ring relative inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium shadow-xs transition-colors duration-base hover:border-border-strong"
          >
            <ShoppingCart aria-hidden="true" className="size-[18px]" />
            <span className="hidden tabular-nums sm:inline">
              {count > 0 ? formatMoney(totals.subtotal) : 'Savatcha'}
            </span>
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground tabular-nums ring-2 ring-background"
              >
                {count}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton variant="ghost" aria-label="Demo menyusi">
                <Ellipsis aria-hidden="true" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-60">
              <DropdownMenuLabel>Demo</DropdownMenuLabel>
              {lastOrder && (
                <DropdownMenuItem
                  icon={<PackageCheck aria-hidden="true" />}
                  onSelect={() => router.push(path('/success'))}
                >
                  Oxirgi buyurtma {lastOrder.number}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="danger"
                icon={<RotateCcw aria-hidden="true" />}
                onSelect={reset}
              >
                Ma&apos;lumotlarni tiklash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
