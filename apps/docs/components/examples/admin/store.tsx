'use client';

import { useLocalStorage } from '@akhatmirzo/hooks';
import { createContext, use, useMemo, type ReactNode } from 'react';
import {
  DEMO_NOW,
  seed,
  type AdminNotification,
  type Customer,
  type Order,
  type OrderStatus,
  type Product,
  type StoreSettings,
} from './data';

/**
 * Ilova holati: buyurtmalar, mahsulotlar, mijozlar, sozlamalar va bildirishnomalar.
 * Hammasi `localStorage` da (useLocalStorage) — sahifa yangilansa ham o'zgarishlar saqlanadi.
 * Backend yo'q: haqiqiy loyihada bu funksiyalar API so'rovlariga almashtiriladi.
 */

const KEY = 'ak-demo:admin:';

/** Mijozning hisoblangan ko'rsatkichlari (buyurtmalardan) */
export interface CustomerStats {
  orders: number;
  spent: number;
  lastOrderAt: number | null;
}

interface AdminStore {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  notifications: AdminNotification[];
  customerStats: Map<string, CustomerStats>;
  newOrdersCount: number;
  lowStockCount: number;
  lowStockThreshold: number;

  setOrderStatus: (ids: string[], status: OrderStatus, note?: string) => void;
  deleteOrders: (ids: string[]) => void;
  /** O'chirilganlarni qaytarish ("Bekor qilish" toast amali) */
  restoreOrders: (orders: Order[]) => void;
  saveProduct: (product: Product) => void;
  deleteProducts: (ids: string[]) => void;
  restoreProducts: (products: Product[]) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  saveSettings: (settings: StoreSettings) => void;
  markNotificationsRead: (ids?: string[]) => void;
  resetAll: () => void;
}

const AdminContext = createContext<AdminStore | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders, resetOrders] = useLocalStorage<Order[]>(KEY + 'orders', seed.orders);
  const [products, setProducts, resetProducts] = useLocalStorage<Product[]>(
    KEY + 'products',
    seed.products,
  );
  const [customers, setCustomers, resetCustomers] = useLocalStorage<Customer[]>(
    KEY + 'customers',
    seed.customers,
  );
  const [settings, setSettings, resetSettings] = useLocalStorage<StoreSettings>(
    KEY + 'settings',
    seed.settings,
  );
  const [notifications, setNotifications, resetNotifications] = useLocalStorage<
    AdminNotification[]
  >(KEY + 'notifications', seed.notifications);

  const store = useMemo<AdminStore>(() => {
    const customerStats = new Map<string, CustomerStats>();
    for (const o of orders) {
      const s = customerStats.get(o.customerId) ?? { orders: 0, spent: 0, lastOrderAt: null };
      s.orders += 1;
      if (o.status !== 'cancelled') s.spent += o.total;
      s.lastOrderAt = Math.max(s.lastOrderAt ?? 0, o.createdAt);
      customerStats.set(o.customerId, s);
    }
    const lowStockThreshold = settings.lowStockThreshold ?? 10;

    return {
      orders,
      products,
      customers,
      settings,
      notifications,
      customerStats,
      newOrdersCount: orders.filter((o) => o.status === 'new').length,
      lowStockCount: products.filter((p) => p.stock < lowStockThreshold).length,
      lowStockThreshold,

      setOrderStatus: (ids, status, note) => {
        // Demo vaqti qotirilgan — yangi hodisa "hozir"dan keyin turishi uchun
        const at = Math.max(Date.now(), DEMO_NOW.getTime());
        setOrders((prev) =>
          prev.map((o) =>
            ids.includes(o.id) && o.status !== status
              ? { ...o, status, history: [...o.history, { status, at, note }] }
              : o,
          ),
        );
      },
      deleteOrders: (ids) => setOrders((prev) => prev.filter((o) => !ids.includes(o.id))),
      restoreOrders: (restored) =>
        setOrders((prev) =>
          [...prev, ...restored.filter((r) => !prev.some((o) => o.id === r.id))].sort(
            (a, b) => b.createdAt - a.createdAt,
          ),
        ),
      saveProduct: (product) =>
        setProducts((prev) =>
          prev.some((p) => p.id === product.id)
            ? prev.map((p) => (p.id === product.id ? product : p))
            : [product, ...prev],
        ),
      deleteProducts: (ids) => setProducts((prev) => prev.filter((p) => !ids.includes(p.id))),
      restoreProducts: (restored) =>
        setProducts((prev) => [
          ...restored.filter((r) => !prev.some((p) => p.id === r.id)),
          ...prev,
        ]),
      updateCustomer: (id, patch) =>
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      saveSettings: setSettings,
      markNotificationsRead: (ids) =>
        setNotifications((prev) =>
          prev.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)),
        ),
      resetAll: () => {
        resetOrders();
        resetProducts();
        resetCustomers();
        resetSettings();
        resetNotifications();
      },
    };
  }, [
    orders,
    products,
    customers,
    settings,
    notifications,
    setOrders,
    setProducts,
    setCustomers,
    setSettings,
    setNotifications,
    resetOrders,
    resetProducts,
    resetCustomers,
    resetSettings,
    resetNotifications,
  ]);

  return <AdminContext value={store}>{children}</AdminContext>;
}

export function useAdmin() {
  const store = use(AdminContext);
  if (!store) throw new Error('useAdmin(): <AdminProvider> ichida ishlating');
  return store;
}
