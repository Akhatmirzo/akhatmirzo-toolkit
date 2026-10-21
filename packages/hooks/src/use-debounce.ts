import { useEffect, useMemo, useState } from 'react';
import { useLatestRef } from './internal';

/**
 * Qiymatni oxirgi o'zgarishdan `ms` millisekund o'tgach qaytaradi.
 * @example const debounced = useDebounce(query, 300);
 */
export function useDebounce<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

/** `useDebouncedCallback` qaytaradigan funksiya. */
export interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void;
  /** Kutilayotgan chaqiruvni bekor qiladi. */
  cancel: () => void;
  /** Kutilayotgan chaqiruvni darhol bajaradi. */
  flush: () => void;
  /** Kutilayotgan chaqiruv bormi. */
  isPending: () => boolean;
}

function createDebounced<Args extends unknown[]>(
  invoke: (...args: Args) => void,
  ms: number,
): DebouncedFunction<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: { args: Args } | null = null;

  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = null;
  };
  const flush = () => {
    if (!pending) return;
    const { args } = pending;
    cancel();
    invoke(...args);
  };
  const call = (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer);
    pending = { args };
    timer = setTimeout(flush, ms);
  };
  return Object.assign(call, { cancel, flush, isPending: () => pending !== null });
}

/**
 * Funksiyani debounce qiladi: oxirgi chaqiruvdan `ms` o'tgach eng so'nggi `fn` ishlaydi.
 * Unmount'da kutilayotgan chaqiruv bekor qilinadi.
 * @example
 * const save = useDebouncedCallback((text: string) => api.save(text), 500);
 * save.flush(); // darhol saqlash
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms = 300,
): DebouncedFunction<Args> {
  const fnRef = useLatestRef(fn);
  const debounced = useMemo(
    // fnRef faqat chaqiruv paytida o'qiladi, render vaqtida emas
    // eslint-disable-next-line react-hooks/refs
    () => createDebounced<Args>((...args) => fnRef.current(...args), ms),
    [ms, fnRef],
  );

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced;
}
