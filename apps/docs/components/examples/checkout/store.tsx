'use client';

import type { CardBrand } from '@akhatmirzo/core';
import { useLocalStorage } from '@akhatmirzo/hooks';
import { createContext, use, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import {
  cartKey,
  initialCart,
  promoCodes,
  type CartItem,
  type PaymentMethod,
  type Product,
  type ProductIcon,
  type Tone,
} from './data';
import { initialDelivery, initialPayment, type DeliveryForm, type PaymentForm } from './forms';
import { computeTotals, toLines, type CartLine, type Totals } from './pricing';

export interface SavedCard {
  brand: CardBrand | null;
  last4: string;
  holder: string;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  items: {
    key: string;
    name: string;
    variant?: string;
    qty: number;
    price: number;
    icon: ProductIcon;
    tone: Tone;
  }[];
  totals: Totals;
  promo: string | null;
  delivery: DeliveryForm;
  payment: { method: PaymentMethod; card?: string };
  /** `orderStages` dagi joriy bosqich indeksi */
  stage: number;
}

interface CheckoutContextValue {
  /** localStorage o'qildimi — undan oldin yo'naltirish (guard) qilinmaydi */
  hydrated: boolean;
  cart: CartItem[];
  lines: CartLine[];
  totals: Totals;
  promo: string | null;
  delivery: DeliveryForm;
  payment: PaymentForm;
  savedCard: SavedCard | null;
  orders: Order[];
  addToCart: (product: Product, variant?: string) => { added: boolean; qty: number };
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => { item: CartItem; index: number } | null;
  restoreItem: (item: CartItem, index: number) => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  updateDelivery: (patch: Partial<DeliveryForm>) => void;
  updatePayment: (patch: Partial<PaymentForm>) => void;
  setSavedCard: (card: SavedCard | null) => void;
  placeOrder: (payment: Order['payment']) => Order;
  advanceOrder: (id: string) => void;
  resetAll: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

const KEY = 'ak-demo:checkout';
const subscribeNoop = () => () => {};

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [cart, setCart] = useLocalStorage<CartItem[]>(`${KEY}:cart`, initialCart);
  const [promo, setPromo] = useLocalStorage<string | null>(`${KEY}:promo`, null);
  const [delivery, setDelivery] = useLocalStorage<DeliveryForm>(`${KEY}:delivery`, initialDelivery);
  const [savedCard, setSavedCard] = useLocalStorage<SavedCard | null>(`${KEY}:card`, null);
  const [orders, setOrders] = useLocalStorage<Order[]>(`${KEY}:orders`, []);
  // Karta raqami xavfsizlik uchun localStorage'ga yozilmaydi — faqat sahifa xotirasida
  const [payment, setPayment] = useState<PaymentForm>(initialPayment);

  const lines = useMemo(() => toLines(cart), [cart]);
  const totals = useMemo(
    () => computeTotals(lines, promo, delivery.method),
    [lines, promo, delivery.method],
  );

  const value: CheckoutContextValue = {
    hydrated,
    cart,
    lines,
    totals,
    promo,
    delivery,
    payment,
    savedCard,
    orders,

    addToCart(product, variant) {
      const key = cartKey(product.id, variant);
      const current = cart.find((i) => i.key === key)?.qty ?? 0;
      if (current >= product.stock) return { added: false, qty: current };
      setCart((prev) =>
        current > 0
          ? prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i))
          : [...prev, { key, productId: product.id, variant, qty: 1 }],
      );
      return { added: true, qty: current + 1 };
    },

    setQty(key, qty) {
      setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
    },

    removeItem(key) {
      const index = cart.findIndex((i) => i.key === key);
      const item = cart[index];
      if (!item) return null;
      setCart((prev) => prev.filter((i) => i.key !== key));
      return { item, index };
    },

    restoreItem(item, index) {
      setCart((prev) => {
        if (prev.some((i) => i.key === item.key)) return prev;
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, item);
        return next;
      });
    },

    applyPromo(code) {
      const normalized = code.trim().toUpperCase();
      if (!promoCodes[normalized]) return false;
      setPromo(normalized);
      return true;
    },

    removePromo: () => setPromo(null),
    updateDelivery: (patch) => setDelivery((prev) => ({ ...prev, ...patch })),
    updatePayment: (patch) => setPayment((prev) => ({ ...prev, ...patch })),
    setSavedCard,

    placeOrder(paymentInfo) {
      const now = new Date();
      const order: Order = {
        id: `${now.getTime()}`,
        number: `BZ-${String(Math.floor(100000 + Math.random() * 900000))}`,
        createdAt: now.toISOString(),
        items: lines.map((l) => ({
          key: l.key,
          name: l.product.name,
          variant: l.variant,
          qty: l.qty,
          price: l.product.price,
          icon: l.product.icon,
          tone: l.product.tone,
        })),
        totals,
        promo,
        delivery,
        payment: paymentInfo,
        // Naqd to'lovda "To'lov tasdiqlandi" bosqichi yetkazilganda bajariladi
        stage: paymentInfo.method === 'cash' ? 0 : 1,
      };
      setOrders((prev) => [order, ...prev].slice(0, 10));
      setCart([]);
      setPromo(null);
      setPayment((prev) => ({ ...initialPayment, method: prev.method }));
      // Keyingi xarid uchun kontakt va manzil qoladi, sana-vaqt qayta tanlanadi
      setDelivery((prev) => ({ ...prev, date: null, slot: '' }));
      return order;
    },

    advanceOrder(id) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, stage: o.stage + 1 } : o)));
    },

    resetAll() {
      setCart(initialCart);
      setPromo(null);
      setDelivery(initialDelivery);
      setSavedCard(null);
      setOrders([]);
      setPayment(initialPayment);
    },
  };

  return <CheckoutContext value={value}>{children}</CheckoutContext>;
}

export function useCheckout() {
  const ctx = use(CheckoutContext);
  if (!ctx) throw new Error('useCheckout faqat CheckoutProvider ichida ishlaydi');
  return ctx;
}
