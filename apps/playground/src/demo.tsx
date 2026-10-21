import { cn } from '@akhatmirzo/ui';
import type { ReactNode } from 'react';

/** Sahifa sarlavhasi + bo'limlar */
export function DemoPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="flex max-w-4xl flex-col gap-10 font-sans text-text">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && <p className="text-base text-text-muted">{description}</p>}
      </header>
      {children}
    </article>
  );
}

/** Bitta namuna bloki: sarlavha, izoh va karta ichida misollar */
export function DemoSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      <div
        className={cn(
          'flex flex-col gap-6 rounded-xl border border-border bg-surface p-6 shadow-xs',
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Elementlarni qatorga tizadi (sig'masa keyingi qatorga o'tadi) */
export function DemoRow({
  label,
  children,
  className,
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs font-medium text-text-muted">{label}</p>}
      <div className={cn('flex flex-wrap items-center gap-3', className)}>{children}</div>
    </div>
  );
}

/** Moslashuvchan to'r: har bir ustun kamida `min` px */
export function DemoGrid({
  children,
  min = 200,
  className,
}: {
  children: ReactNode;
  min?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))` }}
    >
      {children}
    </div>
  );
}

/** Kichik inline kod */
export function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-sm bg-surface-muted px-1.5 py-0.5 font-mono text-xs text-text">
      {children}
    </code>
  );
}
