'use client';

import { Button, cn } from '@akhatmirzo/ui';
import { useSyncExternalStore, type ReactNode } from 'react';

/* Sahifalar uchun umumiy kichik bloklar */

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
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Sozlamalar bo'limi: chapda sarlavha va izoh, o'ngda kontent (telefonda — ustma-ust) */
export function SettingsSection({
  title,
  description,
  children,
  footer,
  tone = 'default',
  id,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: 'default' | 'danger';
  id?: string;
}) {
  const headingId = `${id ?? title}-title`.replace(/\s+/g, '-').toLowerCase();
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'overflow-hidden rounded-2xl border bg-surface shadow-xs',
        tone === 'danger' ? 'border-danger/40' : 'border-border',
      )}
    >
      <div className="p-5 sm:p-6">
        <h2
          id={headingId}
          className={cn(
            'text-base font-semibold',
            tone === 'danger' && 'text-danger-soft-foreground',
          )}
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        <div className="mt-5">{children}</div>
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-muted/50 px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  );
}

/** Saqlanmagan o'zgarishlar paneli — pastda yopishib turadi */
export function UnsavedBar({
  show,
  saving,
  onDiscard,
  onSave,
  canSave = true,
}: {
  show: boolean;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
  canSave?: boolean;
}) {
  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={cn(
        'pointer-events-none sticky bottom-4 z-20 mt-6 flex justify-center transition-[opacity,translate] duration-base ease-out',
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface-raised px-4 py-3 shadow-lg"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden="true" className="size-2 rounded-full bg-warning" />
          Saqlanmagan o&apos;zgarishlar bor
        </span>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
            Bekor qilish
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} loading={saving} disabled={!canSave}>
            Saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Foydalanish ko'rsatkichi: 80% dan oshsa — sariq, 95% dan — qizil */
export function UsageBar({
  label,
  value,
  max,
  display,
}: {
  label: string;
  value: number;
  max: number;
  display: ReactNode;
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const color = percent >= 95 ? 'bg-danger' : percent >= 80 ? 'bg-warning' : 'bg-primary';
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-text-muted tabular-nums">{display}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        className="h-2 overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-slow ease-out', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const noopSubscribe = () => () => {};

/** Mijozda `true`: nisbiy vaqt kabi serverda boshqacha chiqadigan matnlar uchun */
export function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
