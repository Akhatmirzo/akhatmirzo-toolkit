'use client';

import { confirm } from '@akhatmirzo/ui';
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';

/*
 * Saqlanmagan o'zgarishlar himoyasi: forma "iflos" bo'lsa, menyudagi havolani bosganda
 * tasdiqlash so'raladi, sahifani yopish/yangilashda esa brauzer ogohlantiradi.
 */

interface UnsavedGuard {
  set: (dirty: boolean) => void;
  /** `true` — o'tish mumkin (o'zgarish yo'q yoki foydalanuvchi rozi bo'ldi) */
  confirmLeave: () => Promise<boolean>;
}

const UnsavedContext = createContext<UnsavedGuard | null>(null);

export function UnsavedProvider({ children }: { children: ReactNode }) {
  const dirty = useRef(false);

  const guard = useMemo<UnsavedGuard>(
    () => ({
      set: (value) => {
        dirty.current = value;
      },
      confirmLeave: async () => {
        if (!dirty.current) return true;
        const ok = await confirm({
          title: "Saqlanmagan o'zgarishlar bor",
          description: "Sahifadan chiqsangiz, kiritgan o'zgarishlaringiz yo'qoladi.",
          confirmText: 'Chiqib ketish',
          cancelText: 'Qolish',
          variant: 'danger',
        });
        if (ok) dirty.current = false;
        return ok;
      },
    }),
    [],
  );

  return <UnsavedContext.Provider value={guard}>{children}</UnsavedContext.Provider>;
}

export function useUnsavedGuard() {
  const ctx = useContext(UnsavedContext);
  if (!ctx) throw new Error('useUnsavedGuard faqat <UnsavedProvider> ichida ishlaydi');
  return ctx;
}

/** Sahifadagi forma holatini himoyaga ulaydi */
export function useUnsavedChanges(dirty: boolean) {
  const { set } = useUnsavedGuard();

  useEffect(() => {
    set(dirty);
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      set(false);
    };
  }, [dirty, set]);
}
