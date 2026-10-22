'use client';

import { formatMoney, MONTHS_UZ, MONTHS_UZ_SHORT } from '@akhatmirzo/core';
import { Card, cn, IconButton, Select } from '@akhatmirzo/ui';
import {
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  axisProps,
  chartColors,
  ChartTooltip,
  cursorProps,
  gridProps,
} from '@/components/examples/shared/chart';
import { useBank } from './bank-store';
import { categories, type CategoryId, type Transaction } from './data';
import { CategoryIcon, EmptyState, formatDateTime, Money, PageHeader } from './ui';

const MONTHS_BACK = 6;
const OTHER_COLOR = 'var(--ak-text-faint)';

interface MonthKey {
  year: number;
  month: number;
}

function monthKeys(now: Date): MonthKey[] {
  return Array.from({ length: MONTHS_BACK }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
}

const inMonth = (tx: Transaction, m: MonthKey) => {
  const d = new Date(tx.date);
  return d.getFullYear() === m.year && d.getMonth() === m.month;
};

function summarize(list: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const tx of list) {
    if (tx.amount > 0) income += tx.amount;
    else expense += -tx.amount + tx.fee;
  }
  return { income, expense };
}

/** "1,2 mln" — o'qda qisqa ko'rinish */
const compact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.', ',')} mln`
    : n >= 1000
      ? `${Math.round(n / 1000)} ming`
      : String(n);

function Delta({
  value,
  previous,
  inverse = false,
}: {
  value: number;
  previous: number;
  inverse?: boolean;
}) {
  if (!previous)
    return <span className="text-xs text-text-muted">O&apos;tgan oy ma&apos;lumoti yo&apos;q</span>;
  const pct = Math.round(((value - previous) / previous) * 100);
  const up = pct >= 0;
  const good = inverse ? !up : up;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        good ? 'text-success-soft-foreground' : 'text-danger-soft-foreground',
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {up ? '+' : ''}
      {pct}% o&apos;tgan oyga nisbatan
    </span>
  );
}

export function AnalyticsView() {
  const { transactions } = useBank();
  const months = useMemo(() => monthKeys(new Date()), []);
  const [index, setIndex] = useState(0);
  const selected = months[index]!;
  const done = useMemo(() => transactions.filter((t) => t.status === 'success'), [transactions]);

  const monthTxs = useMemo(() => done.filter((t) => inMonth(t, selected)), [done, selected]);
  const current = summarize(monthTxs);
  const previous = summarize(
    months[index + 1] ? done.filter((t) => inMonth(t, months[index + 1]!)) : [],
  );

  // Toifalar bo'yicha xarajat: 5 ta eng kattasi + "Boshqalar"
  const pie = useMemo(() => {
    const sums = new Map<CategoryId, number>();
    for (const t of monthTxs) {
      if (t.amount >= 0) continue;
      sums.set(t.category, (sums.get(t.category) ?? 0) - t.amount + t.fee);
    }
    const sorted = [...sums].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5).map(([id, value], i) => ({
      id: id as CategoryId | 'other',
      name: categories[id].label,
      value,
      color: chartColors[i] ?? OTHER_COLOR,
    }));
    const rest = sorted.slice(5).reduce((s, [, v]) => s + v, 0);
    if (rest) top.push({ id: 'other', name: 'Boshqalar', value: rest, color: OTHER_COLOR });
    return top;
  }, [monthTxs]);

  const bars = useMemo(
    () =>
      [...months].reverse().map((m) => ({
        key: `${m.year}-${m.month}`,
        label: MONTHS_UZ_SHORT[m.month],
        ...summarize(done.filter((t) => inMonth(t, m))),
      })),
    [months, done],
  );

  const topMerchants = useMemo(() => {
    const sums = new Map<string, { value: number; count: number; category: CategoryId }>();
    for (const t of monthTxs) {
      if (t.amount >= 0) continue;
      const prev = sums.get(t.title) ?? { value: 0, count: 0, category: t.category };
      sums.set(t.title, { ...prev, value: prev.value - t.amount, count: prev.count + 1 });
    }
    return [...sums].sort((a, b) => b[1].value - a[1].value).slice(0, 5);
  }, [monthTxs]);

  const monthLabel = `${MONTHS_UZ[selected.month]} ${selected.year}`;
  const isCurrent = index === 0;
  const days = isCurrent
    ? new Date().getDate()
    : new Date(selected.year, selected.month + 1, 0).getDate();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Xarajatlar tahlili"
        description="Pul qayerga ketayotganini toifalar va oylar kesimida ko'ring"
        actions={
          <div className="flex items-center gap-1">
            <IconButton
              variant="ghost"
              aria-label="Oldingi oy"
              disabled={index >= MONTHS_BACK - 1}
              onClick={() => setIndex(index + 1)}
            >
              <ChevronLeft aria-hidden="true" />
            </IconButton>
            <Select
              value={String(index)}
              onValueChange={(v) => setIndex(Number(v))}
              aria-label="Oyni tanlash"
              className="w-44"
            >
              {months.map((m, i) => (
                <Select.Item key={i} value={String(i)}>
                  {MONTHS_UZ[m.month]} {m.year}
                </Select.Item>
              ))}
            </Select>
            <IconButton
              variant="ghost"
              aria-label="Keyingi oy"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
            >
              <ChevronRight aria-hidden="true" />
            </IconButton>
          </div>
        }
      />

      <section aria-label="Oy ko'rsatkichlari" className="grid gap-3 sm:grid-cols-3">
        <Card padding="sm" className="gap-1">
          <p className="text-sm text-text-muted">Kirim</p>
          <Money
            value={current.income}
            className="text-xl font-bold text-success-soft-foreground"
          />
          <Delta value={current.income} previous={previous.income} />
        </Card>
        <Card padding="sm" className="gap-1">
          <p className="text-sm text-text-muted">Chiqim</p>
          <Money value={current.expense} className="text-xl font-bold text-text" />
          <Delta value={current.expense} previous={previous.expense} inverse />
        </Card>
        <Card padding="sm" className="gap-1">
          <p className="text-sm text-text-muted">Kunlik o&apos;rtacha xarajat</p>
          <Money
            value={Math.round(current.expense / days)}
            className="text-xl font-bold text-text"
          />
          <span className="text-xs text-text-muted">
            Sof natija:{' '}
            <Money
              value={current.income - current.expense}
              signed
              className={cn(
                'font-medium',
                current.income >= current.expense
                  ? 'text-success-soft-foreground'
                  : 'text-danger-soft-foreground',
              )}
            />
          </span>
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Card padding="sm" className="gap-4">
          <div>
            <h2 className="text-base font-semibold text-text">Toifalar bo&apos;yicha</h2>
            <p className="text-xs text-text-muted">{monthLabel}</p>
          </div>
          {pie.length === 0 ? (
            <EmptyState icon={PieIcon} title="Bu oyda xarajat yo'q" />
          ) : (
            <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
              <div className="relative size-56 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="68%"
                      outerRadius="100%"
                      paddingAngle={2}
                      cornerRadius={6}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {pie.map((p) => (
                        <Cell key={p.id} fill={p.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip format={(v) => formatMoney(v)} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-text-muted">Jami</span>
                  <span className="text-base font-bold text-text tabular-nums">
                    {compact(current.expense)}
                  </span>
                  <span className="text-xs text-text-muted">so&apos;m</span>
                </div>
              </div>
              <ul className="flex w-full flex-col gap-2.5">
                {pie.map((p) => (
                  <li key={p.id} className="flex items-center gap-2.5 text-sm">
                    <span
                      aria-hidden="true"
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: p.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-text">{p.name}</span>
                    <span className="text-xs text-text-muted tabular-nums">
                      {Math.round((p.value / current.expense) * 100)}%
                    </span>
                    <Money value={p.value} className="w-28 text-right font-medium text-text" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card padding="sm" className="gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-text">Kirim va chiqim</h2>
              <p className="text-xs text-text-muted">Oxirgi {MONTHS_BACK} oy</p>
            </div>
            <div className="flex gap-4 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ background: chartColors[2] }}
                />
                Kirim
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full"
                  style={{ background: chartColors[0] }}
                />
                Chiqim
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} barGap={4} margin={{ left: -8, right: 4, top: 8 }}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={compact} width={56} />
                <Tooltip
                  cursor={cursorProps}
                  content={<ChartTooltip format={(v) => formatMoney(v)} />}
                />
                <Bar
                  dataKey="income"
                  name="Kirim"
                  fill={chartColors[2]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                >
                  {bars.map((b) => (
                    <Cell
                      key={b.key}
                      fillOpacity={b.key === `${selected.year}-${selected.month}` ? 1 : 0.45}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="expense"
                  name="Chiqim"
                  fill={chartColors[0]}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={28}
                >
                  {bars.map((b) => (
                    <Cell
                      key={b.key}
                      fillOpacity={b.key === `${selected.year}-${selected.month}` ? 1 : 0.45}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="sr-only">
            {bars
              .map(
                (b) =>
                  `${b.label}: kirim ${formatMoney(b.income)}, chiqim ${formatMoney(b.expense)}`,
              )
              .join('; ')}
          </p>
        </Card>
      </div>

      <Card padding="sm" className="gap-3">
        <div>
          <h2 className="text-base font-semibold text-text">
            Eng ko&apos;p xarajat qilingan joylar
          </h2>
          <p className="text-xs text-text-muted">{monthLabel}</p>
        </div>
        {topMerchants.length === 0 ? (
          <p className="text-sm text-text-muted">Ma&apos;lumot yo&apos;q</p>
        ) : (
          <ol className="flex flex-col">
            {topMerchants.map(([title, info], i) => (
              <li
                key={title}
                className="flex items-center gap-3 border-b border-border py-2.5 last:border-0"
              >
                <span className="w-4 text-sm font-semibold text-text-faint tabular-nums">
                  {i + 1}
                </span>
                <CategoryIcon category={info.category} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text">{title}</span>
                  <span className="block text-xs text-text-muted">
                    {categories[info.category].label} · {info.count} ta operatsiya
                  </span>
                </span>
                <Money value={info.value} className="text-sm font-semibold text-text" />
              </li>
            ))}
          </ol>
        )}
        <p className="text-xs text-text-faint">
          Hisobot {formatDateTime(new Date().toISOString())} holatiga ko&apos;ra
        </p>
      </Card>
    </div>
  );
}
