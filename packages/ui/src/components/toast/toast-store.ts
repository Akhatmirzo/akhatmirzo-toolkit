import type { MouseEvent, ReactNode } from 'react';

/*
 * Toast holati — modul darajasidagi store. `toast()` istalgan joydan (komponent tashqarisidan
 * ham) chaqiriladi, `<Toaster />` useSyncExternalStore orqali obuna bo'ladi.
 */

export type ToastId = string | number;
export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastAction {
  label: ReactNode;
  /** `event.preventDefault()` chaqirilsa toast yopilmaydi */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Ekran o'quvchi uchun muqobil matn (label matn bo'lmasa) */
  altText?: string;
}

export interface ToastOptions {
  /** Shu id'li toast bor bo'lsa — yangilanadi, yo'q bo'lsa shu id bilan yaratiladi */
  id?: ToastId;
  type?: ToastType;
  description?: ReactNode;
  action?: ToastAction;
  /** ms; default 4000, `error` — 6000, `loading` — cheksiz (`Infinity`) */
  duration?: number;
  /** Status ikonkasini almashtirish (`null` — ikonkasiz) */
  icon?: ReactNode;
  /** Toast har qanday sabab bilan yopilganda */
  onDismiss?: (id: ToastId) => void;
}

export interface ToastRecord extends Omit<ToastOptions, 'id' | 'type'> {
  id: ToastId;
  type: ToastType;
  title: ReactNode;
  open: boolean;
  /** Har yangilanishda oshadi (taymer qaytadan boshlanishi uchun) */
  version: number;
}

/** Yopilish animatsiyasi tugashini kutib, keyin ro'yxatdan o'chiriladi */
const REMOVE_DELAY = 400;

let toasts: ToastRecord[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const removeTimers = new Map<ToastId, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot() {
  return toasts;
}

function cancelRemoval(id: ToastId) {
  const timer = removeTimers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    removeTimers.delete(id);
  }
}

export function upsertToast(title: ReactNode, options: ToastOptions = {}): ToastId {
  const { id: idOption, type = 'default', ...rest } = options;
  const id = idOption ?? `ak-toast-${++counter}`;
  const existing = toasts.find((t) => t.id === id);

  if (existing) {
    cancelRemoval(id);
    const next: ToastRecord = {
      ...rest,
      id,
      type,
      title,
      open: true,
      version: existing.version + 1,
    };
    toasts = toasts.map((t) => (t.id === id ? next : t));
  } else {
    toasts = [...toasts, { ...rest, id, type, title, open: true, version: 0 }];
  }
  emit();
  return id;
}

/** id berilmasa — barchasi yopiladi */
export function dismissToast(id?: ToastId) {
  const targets = toasts.filter((t) => t.open && (id === undefined || t.id === id));
  if (targets.length === 0) return;
  const ids = new Set(targets.map((t) => t.id));
  toasts = toasts.map((t) => (ids.has(t.id) ? { ...t, open: false } : t));
  emit();

  for (const t of targets) {
    t.onDismiss?.(t.id);
    cancelRemoval(t.id);
    removeTimers.set(
      t.id,
      setTimeout(() => {
        removeTimers.delete(t.id);
        toasts = toasts.filter((x) => x.id !== t.id);
        emit();
      }, REMOVE_DELAY),
    );
  }
}

/** Faqat testlar uchun: store'ni boshlang'ich holatga qaytaradi */
export function resetToasts() {
  removeTimers.forEach((timer) => clearTimeout(timer));
  removeTimers.clear();
  toasts = [];
  counter = 0;
  emit();
}
