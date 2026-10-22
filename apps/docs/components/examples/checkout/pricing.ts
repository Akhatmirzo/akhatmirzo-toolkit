import {
  COURIER_FEE,
  FREE_COURIER_FROM,
  POST_FEE,
  productById,
  promoCodes,
  type CartItem,
  type DeliveryMethod,
  type Product,
} from './data';

export interface CartLine extends CartItem {
  product: Product;
  total: number;
}

export interface Totals {
  count: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  /** Bepul kuryergacha qolgan summa (0 — bepul) */
  toFreeCourier: number;
}

/** Savatcha qatorlariga mahsulot ma'lumotini biriktiradi (o'chirilgan mahsulotlar tashlanadi) */
export function toLines(cart: CartItem[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = productById.get(item.productId);
    return product ? [{ ...item, product, total: product.price * item.qty }] : [];
  });
}

export function deliveryFee(method: DeliveryMethod, amount: number) {
  if (method === 'pickup') return 0;
  if (method === 'post') return POST_FEE;
  return amount >= FREE_COURIER_FROM ? 0 : COURIER_FEE;
}

export function computeTotals(
  lines: CartLine[],
  promo: string | null,
  method: DeliveryMethod,
): Totals {
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const percent = promo ? (promoCodes[promo]?.percent ?? 0) : 0;
  // Chegirma 1 000 so'mgacha yaxlitlanadi
  const discount = Math.round((subtotal * percent) / 100 / 1000) * 1000;
  const afterDiscount = subtotal - discount;
  const delivery = count === 0 ? 0 : deliveryFee(method, afterDiscount);
  return {
    count,
    subtotal,
    discount,
    delivery,
    total: afterDiscount + delivery,
    toFreeCourier: Math.max(0, FREE_COURIER_FROM - afterDiscount),
  };
}
