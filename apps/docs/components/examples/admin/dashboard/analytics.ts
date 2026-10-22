import { formatDate } from '@akhatmirzo/core';
import type { DateRangeValue } from '@akhatmirzo/ui';
import {
  CATEGORIES,
  DEMO_NOW,
  categoryLabel,
  dailyStats,
  startOfDay,
  type CategoryId,
  type DailyStat,
  type Product,
} from '../data';

const DAY = 86_400_000;

export const TODAY = new Date(startOfDay(DEMO_NOW));
export const daysAgo = (n: number) => new Date(TODAY.getTime() - n * DAY);

/** Qisqa summa: 12,5 mln · 840 ming */
export function formatCompact(n: number) {
  const fmt = (v: number) =>
    v
      .toFixed(v >= 100 ? 0 : 1)
      .replace('.', ',')
      .replace(/,0$/, '');
  if (n >= 1e9) return `${fmt(n / 1e9)} mlrd`;
  if (n >= 1e6) return `${fmt(n / 1e6)} mln`;
  if (n >= 1e3) return `${fmt(n / 1e3)} ming`;
  return String(Math.round(n));
}

export interface PeriodTotals {
  revenue: number;
  orders: number;
  avgCheck: number;
  newCustomers: number;
}

function totals(days: DailyStat[]): PeriodTotals {
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  return {
    revenue,
    orders,
    avgCheck: orders ? Math.round(revenue / orders) : 0,
    newCustomers: days.reduce((s, d) => s + d.newCustomers, 0),
  };
}

/** Foizdagi o'zgarish; oldingi davr bo'sh bo'lsa — null */
export const percentChange = (cur: number, prev: number) =>
  prev > 0 ? ((cur - prev) / prev) * 100 : null;

/** Tanlangan davr va undan oldingi xuddi shu uzunlikdagi davr bo'yicha hisob-kitob */
export function analyze(range: DateRangeValue, products: Product[]) {
  const from = startOfDay(range.from ?? TODAY);
  const to = startOfDay(range.to ?? range.from ?? TODAY);
  const length = Math.round((to - from) / DAY) + 1;
  const prevFrom = from - length * DAY;

  const current = dailyStats.filter((d) => d.date >= from && d.date <= to);
  const previous = dailyStats.filter((d) => d.date >= prevFrom && d.date < from);

  const cur = totals(current);
  const prev = totals(previous);

  const series = current.map((d, i) => {
    const p = previous[i];
    return {
      date: d.date,
      label: formatDate(d.date, 'd MMM'),
      revenue: d.revenue,
      orders: d.orders,
      avgCheck: d.orders ? Math.round(d.revenue / d.orders) : 0,
      newCustomers: d.newCustomers,
      prevRevenue: p?.revenue,
      prevOrders: p?.orders,
    };
  });

  // Toifalar bo'yicha: eng kattasi 4 ta + "Boshqalar"
  const byCategory = CATEGORIES.map((c) => ({
    id: c.id,
    name: c.label,
    value: current.reduce((s, d) => s + d.byCategory[c.id], 0),
  })).sort((a, b) => b.value - a.value);
  const head = byCategory.slice(0, 4);
  const rest = byCategory.slice(4).reduce((s, c) => s + c.value, 0);
  const categories = [...head, { id: 'other' as const, name: 'Boshqalar', value: rest }];

  return {
    length,
    cur,
    prev,
    series,
    categories,
    topProducts: topProducts(byCategory, products),
  };
}

/** Mahsulot tushumi = toifa tushumi × mahsulotning toifadagi ulushi (ommaboplik × narx) */
function topProducts(byCategory: { id: CategoryId; value: number }[], products: Product[]) {
  const weight = (p: Product) => p.popularity * Math.sqrt(p.price);
  const sums = new Map<CategoryId, number>();
  for (const p of products) sums.set(p.category, (sums.get(p.category) ?? 0) + weight(p));
  return products
    .map((p) => {
      const catRevenue = byCategory.find((c) => c.id === p.category)?.value ?? 0;
      const revenue = (catRevenue * weight(p)) / (sums.get(p.category) || 1);
      return {
        product: p,
        category: categoryLabel(p.category),
        revenue,
        units: Math.max(1, Math.round(revenue / p.price)),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}
