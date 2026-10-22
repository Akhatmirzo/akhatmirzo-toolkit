'use client';

import { formatDate, formatMoney } from '@akhatmirzo/core';
import { Badge, cn } from '@akhatmirzo/ui';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bus,
  Coffee,
  HeartPulse,
  Lightbulb,
  Popcorn,
  ShoppingBag,
  ShoppingBasket,
  Smartphone,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { toLang } from '@/lib/i18n';
import type { CategoryId, Transaction, TxStatus } from './data';

/* ---------- Marshrutlar ---------- */

export const BANK_BASE = '/examples/bank';

/** Ilova ichidagi havola: `href('/history')` → `/uz/examples/bank/history` */
export function useBankHref() {
  const lang = toLang(String(useParams().lang ?? 'uz'));
  return (path = '') => `/${lang}${BANK_BASE}${path}`;
}

/* ---------- Toifalar: ikonka va rang ---------- */

export const categoryIcons: Record<CategoryId, LucideIcon> = {
  food: ShoppingBasket,
  cafe: Coffee,
  transport: Bus,
  shopping: ShoppingBag,
  utilities: Lightbulb,
  mobile: Smartphone,
  health: HeartPulse,
  entertainment: Popcorn,
  transfers: ArrowUpRight,
  income: ArrowDownLeft,
};

export const categoryTone: Record<CategoryId, string> = {
  food: 'bg-success-soft text-success-soft-foreground',
  cafe: 'bg-warning-soft text-warning-soft-foreground',
  transport: 'bg-info-soft text-info-soft-foreground',
  shopping: 'bg-primary-soft text-primary-soft-foreground',
  utilities: 'bg-warning-soft text-warning-soft-foreground',
  mobile: 'bg-info-soft text-info-soft-foreground',
  health: 'bg-danger-soft text-danger-soft-foreground',
  entertainment: 'bg-primary-soft text-primary-soft-foreground',
  transfers: 'bg-surface-muted text-text-subtle',
  income: 'bg-success-soft text-success-soft-foreground',
};

export function CategoryIcon({
  category,
  size = 'md',
  className,
}: {
  category: CategoryId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const Icon = categoryIcons[category] ?? Wallet;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        size === 'sm' && 'size-8 [&_svg]:size-4',
        size === 'md' && 'size-10 [&_svg]:size-[18px]',
        size === 'lg' && 'size-14 rounded-2xl [&_svg]:size-6',
        categoryTone[category],
        className,
      )}
    >
      <Icon />
    </span>
  );
}

/* ---------- Pul va sanalar ---------- */

export const HIDDEN_MONEY = "•••••• so'm";

/** Summa: `signed` — "+" / "−" belgisi bilan; `hidden` — yulduzchalar */
export function Money({
  value,
  signed = false,
  hidden = false,
  className,
}: {
  value: number;
  signed?: boolean;
  hidden?: boolean;
  className?: string;
}) {
  if (hidden) return <span className={cn('tabular-nums', className)}>{HIDDEN_MONEY}</span>;
  const sign = signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : value < 0 ? '−' : '';
  return (
    <span className={cn('tabular-nums whitespace-nowrap', className)}>
      {sign}
      {formatMoney(Math.abs(value))}
    </span>
  );
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Bugun", "Kecha", "12-oktabr" (boshqa yil bo'lsa — "12-oktabr 2025") */
export function dayLabel(iso: string, now: Date) {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (diff === 0) return 'Bugun';
  if (diff === 1) return 'Kecha';
  const label = formatDate(d, 'd-MMMM').toLowerCase();
  return d.getFullYear() === now.getFullYear() ? label : `${label} ${d.getFullYear()}`;
}

export const formatTime = (iso: string) => formatDate(iso, 'HH:mm');
export const formatDateTime = (iso: string) => formatDate(iso, 'd-MMMM yyyy, HH:mm').toLowerCase();

/* ---------- Holat ---------- */

export const statusLabels: Record<TxStatus, string> = {
  success: 'Muvaffaqiyatli',
  pending: 'Kutilmoqda',
  failed: 'Rad etildi',
};

export function StatusBadge({ status }: { status: TxStatus }) {
  const color = status === 'success' ? 'success' : status === 'pending' ? 'warning' : 'danger';
  return (
    <Badge color={color} size="sm" dot>
      {statusLabels[status]}
    </Badge>
  );
}

/* ---------- Operatsiya qatori ---------- */

export function TxRow({
  tx,
  onSelect,
  hidden = false,
  meta,
}: {
  tx: Transaction;
  onSelect?: (tx: Transaction) => void;
  hidden?: boolean;
  /** Ikkinchi qator (default — tavsif va vaqt) */
  meta?: ReactNode;
}) {
  const income = tx.amount > 0;
  const failed = tx.status === 'failed';
  return (
    <button
      type="button"
      onClick={() => onSelect?.(tx)}
      className="focus-ring flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors duration-fast hover:bg-surface-muted"
    >
      <CategoryIcon category={tx.category} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-text">{tx.title}</span>
        <span className="truncate text-xs text-text-muted">
          {meta ?? `${tx.description} · ${formatTime(tx.date)}`}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <Money
          value={tx.amount}
          signed
          hidden={hidden}
          className={cn(
            'text-sm font-semibold',
            income ? 'text-success-soft-foreground' : 'text-text',
            failed && 'text-text-faint line-through',
          )}
        />
        {tx.status !== 'success' && <StatusBadge status={tx.status} />}
      </span>
    </button>
  );
}

/* ---------- Sahifa qismlari ---------- */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({
  id,
  children,
  action,
}: {
  id?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="text-base font-semibold text-text">
        {children}
      </h2>
      {action}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-surface-muted text-text-muted">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/** Kalit — qiymat qatorlari (chek, tasdiqlash ekrani, tafsilotlar) */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 py-2.5 text-sm">
          <dt className="shrink-0 text-text-muted">{item.label}</dt>
          <dd className="min-w-0 text-right font-medium break-words text-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
