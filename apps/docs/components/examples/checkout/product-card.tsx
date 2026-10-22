'use client';

import { formatMoney, formatNumber } from '@akhatmirzo/core';
import { Badge, Button, cn, toast } from '@akhatmirzo/ui';
import { Check, ShoppingCart, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { cartKey, type Product } from './data';
import { ProductArt } from './product-art';
import { useCheckout } from './store';
import { useCheckoutPath } from './use-checkout-path';

export function ProductCard({ product }: { product: Product }) {
  const { cart, addToCart } = useCheckout();
  const router = useRouter();
  const path = useCheckoutPath();
  const titleId = useId();
  const [variant, setVariant] = useState(product.variants?.[0]);
  const inCart = cart.find((i) => i.key === cartKey(product.id, variant))?.qty ?? 0;
  const off = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : undefined;

  const add = () => {
    const res = addToCart(product, variant);
    if (!res.added) {
      toast.warning(`Omborda faqat ${product.stock} dona qolgan`, {
        description: 'Savatchadagi miqdor maksimal darajada.',
      });
      return;
    }
    toast.success("Savatchaga qo'shildi", {
      description: `${product.name}${variant ? ` · ${variant}` : ''} — ${res.qty} dona`,
      action: { label: 'Savatcha', onClick: () => router.push(path('/cart')) },
    });
  };

  return (
    <article
      aria-labelledby={titleId}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-xs transition-[box-shadow,border-color] duration-base ease-out hover:border-border-strong hover:shadow-md"
    >
      <div className="relative">
        <ProductArt icon={product.icon} tone={product.tone} size="lg" />
        <div className="absolute top-2 left-2 flex gap-1">
          {off !== undefined && (
            <Badge variant="solid" color="danger" size="sm">
              −{off}%
            </Badge>
          )}
          {product.tag && (
            <Badge variant="outline" size="sm">
              {product.tag}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-1 pt-3">
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <Star aria-hidden="true" className="size-3.5 fill-current text-warning" />
          <span className="font-semibold text-text">{product.rating.toFixed(1)}</span>
          <span>({formatNumber(product.reviews)} sharh)</span>
          {product.stock <= 5 && (
            <span className="ml-auto font-medium text-danger-soft-foreground">
              {product.stock} dona qoldi
            </span>
          )}
        </div>

        <h3 id={titleId} className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">
          {product.name}
        </h3>

        {product.variants && (
          <div role="group" aria-label={product.variantLabel} className="flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={variant === v}
                onClick={() => setVariant(v)}
                className={cn(
                  'focus-ring h-7 min-w-8 cursor-pointer rounded-md border px-2 text-xs font-medium transition-colors duration-fast',
                  variant === v
                    ? 'border-primary bg-primary-soft text-primary-soft-foreground'
                    : 'border-border text-text-subtle hover:border-border-strong',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-1">
          <div className="flex flex-col">
            {product.oldPrice && (
              <span className="text-xs whitespace-nowrap text-text-muted tabular-nums line-through">
                {formatMoney(product.oldPrice)}
              </span>
            )}
            <span className="text-base font-bold whitespace-nowrap tabular-nums">
              {formatMoney(product.price)}
            </span>
          </div>
          <Button
            size="sm"
            className="max-sm:w-full"
            variant={inCart > 0 ? 'soft' : 'primary'}
            onClick={add}
            aria-label={`${product.name} — savatchaga qo'shish`}
            leftIcon={
              inCart > 0 ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />
            }
          >
            {inCart > 0 ? `${inCart} ta` : "Qo'shish"}
          </Button>
        </div>
      </div>
    </article>
  );
}
