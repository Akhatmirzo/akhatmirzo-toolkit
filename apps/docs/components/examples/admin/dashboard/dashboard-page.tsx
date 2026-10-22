'use client';

import { formatMoney, formatNumber } from '@akhatmirzo/core';
import { DateRangePicker, type DateRangePreset, type DateRangeValue } from '@akhatmirzo/ui';
import { Banknote, ReceiptText, ShoppingCart, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HISTORY_DAYS } from '../data';
import { useAdmin } from '../store';
import { PageHeader, useSimulatedLoading } from '../ui';
import { CURRENT_USER } from '../shell/user-menu';
import { TODAY, analyze, daysAgo, formatCompact, percentChange } from './analytics';
import { CategoryChart } from './category-chart';
import { KpiCard } from './kpi-card';
import { RecentOrders, TopProducts } from './lists';
import { SalesChart } from './sales-chart';

const PRESETS: DateRangePreset[] = [
  { label: 'Bugun', range: { from: TODAY, to: TODAY } },
  { label: 'Kecha', range: { from: daysAgo(1), to: daysAgo(1) } },
  { label: 'Oxirgi 7 kun', range: { from: daysAgo(6), to: TODAY } },
  { label: 'Oxirgi 30 kun', range: { from: daysAgo(29), to: TODAY } },
  { label: 'Oxirgi 90 kun', range: { from: daysAgo(HISTORY_DAYS - 1), to: TODAY } },
  {
    label: 'Shu oy',
    range: { from: new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), to: TODAY },
  },
];

/** Katta summa kartaga sig'ishi uchun: 456 mln so'm (to'liq qiymat — title va ekran o'quvchida) */
const moneyShort = (n: number) => (n >= 100_000_000 ? `${formatCompact(n)} so'm` : formatMoney(n));

export function DashboardPage() {
  const { orders, products } = useAdmin();
  const [range, setRange] = useState<DateRangeValue>({ from: daysAgo(29), to: TODAY });
  const initialLoading = useSimulatedLoading(700);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loading = initialLoading || refreshing;

  useEffect(() => () => clearTimeout(timer.current), []);

  const changeRange = (next: DateRangeValue | null) => {
    if (!next?.from || !next.to) return;
    setRange(next);
    // Soxta so'rov: davr almashganda qisqa yuklanish
    setRefreshing(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setRefreshing(false), 450);
  };

  const stats = useMemo(() => analyze(range, products), [range, products]);
  const recent = useMemo(
    () => [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    [orders],
  );

  const { cur, prev, series } = stats;
  const single = stats.length === 1;

  return (
    <>
      <PageHeader
        title={`Xush kelibsiz, ${CURRENT_USER.name.split(' ')[0]}!`}
        description="Do'koningizdagi savdo va buyurtmalar bo'yicha qisqacha ma'lumot."
        actions={
          <DateRangePicker
            value={range}
            onValueChange={changeRange}
            presets={PRESETS}
            today={TODAY}
            minDate={daysAgo(HISTORY_DAYS - 1)}
            maxDate={TODAY}
            className="w-full sm:w-auto"
            triggerClassName="w-full sm:w-64"
          />
        }
      />

      <section
        aria-label="Asosiy ko'rsatkichlar"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0"
      >
        <KpiCard
          title={single ? 'Kunlik savdo' : 'Savdo'}
          value={moneyShort(cur.revenue)}
          fullValue={formatMoney(cur.revenue)}
          change={percentChange(cur.revenue, prev.revenue)}
          icon={Banknote}
          trend={series.map((d) => d.revenue)}
          loading={loading}
        />
        <KpiCard
          title="Buyurtmalar"
          value={`${formatNumber(cur.orders)} ta`}
          change={percentChange(cur.orders, prev.orders)}
          icon={ShoppingCart}
          trend={series.map((d) => d.orders)}
          loading={loading}
        />
        <KpiCard
          title="O'rtacha chek"
          value={formatMoney(cur.avgCheck)}
          change={percentChange(cur.avgCheck, prev.avgCheck)}
          icon={ReceiptText}
          trend={series.map((d) => d.avgCheck)}
          loading={loading}
        />
        <KpiCard
          title="Yangi mijozlar"
          value={`${formatNumber(cur.newCustomers)} ta`}
          change={percentChange(cur.newCustomers, prev.newCustomers)}
          icon={UserPlus}
          trend={series.map((d) => d.newCustomers)}
          loading={loading}
        />
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-w-0">
        <SalesChart data={series} loading={loading} />
        <CategoryChart data={stats.categories} loading={loading} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <TopProducts items={stats.topProducts} loading={loading} />
        <RecentOrders orders={recent} loading={initialLoading} />
      </div>
    </>
  );
}
