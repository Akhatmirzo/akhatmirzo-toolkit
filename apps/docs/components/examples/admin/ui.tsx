'use client';

import { cn } from '@akhatmirzo/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useEffectEvent, useState, type ReactNode } from 'react';

/** Sahifa sarlavhasi: h1, izoh va o'ng tomonda amallar */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Bo'sh holat: ikonka, sarlavha, izoh va amal */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-14 text-center',
        className,
      )}
    >
      <span className="mb-1 grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted [&>svg]:size-6">
        {icon}
      </span>
      <p className="text-base font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/** Soxta "serverdan yuklash": birinchi ochilishda qisqa vaqt `true` qaytaradi */
export function useSimulatedLoading(ms = 600) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/** Soxta tarmoq kechikishi (saqlash, o'chirish kabi amallar uchun) */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * URL parametrini bir martalik buyruq sifatida o'qiydi (masalan `?order=10421` — Drawer'ni ochish,
 * `?new=1` — formani ochish), so'ng parametrni manzildan olib tashlaydi.
 * `useSearchParams` statik sahifada Suspense ichida bo'lishi kerak — shu sabab alohida komponent.
 */
export function QueryParam(props: { name: string; onValue: (value: string) => void }) {
  return (
    <Suspense fallback={null}>
      <QueryParamInner {...props} />
    </Suspense>
  );
}

function QueryParamInner({ name, onValue }: { name: string; onValue: (value: string) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = params.get(name);

  const handle = useEffectEvent((v: string) => {
    onValue(v);
    const next = new URLSearchParams(params.toString());
    next.delete(name);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  });

  useEffect(() => {
    if (value === null) return;
    // Sahifa yuklanib, kechiktirilgan (Suspense) qismlar hydrate bo'lgach ochamiz — aks holda
    // modal qo'shni elementlarga qo'ygan aria-hidden hydration ogohlantirishini beradi
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      timer = setTimeout(() => handle(value), 300);
    };
    if (document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
    return () => {
      window.removeEventListener('load', run);
      clearTimeout(timer);
    };
  }, [value]);

  return null;
}
