import { useCallback, useEffect, useRef } from 'react';
import { useLatestRef } from './internal';

/** `useTimeout` qaytaradigan boshqaruv funksiyalari. */
export interface UseTimeoutResult {
  /** Taymerni hozirdan boshlab qaytadan boshlaydi (`delay` — `null` bo'lsa faqat bekor qiladi). */
  reset: () => void;
  /** Kutilayotgan chaqiruvni bekor qiladi. */
  clear: () => void;
}

/**
 * `callback` ni `delay` millisekunddan keyin bir marta chaqiradi. `delay` — `null` bo'lsa
 * taymer qo'yilmaydi. Mount'da va `delay` o'zgarganda taymer qaytadan boshlanadi; callback
 * o'zgarsa — boshlanmaydi (eng so'nggi funksiya chaqiriladi). Unmount'da bekor qilinadi.
 * @example
 * const { reset, clear } = useTimeout(() => setVisible(false), 3000);
 * // sichqoncha ustida — yashirmaslik
 * <div onMouseEnter={clear} onMouseLeave={reset} />
 */
export function useTimeout(callback: () => void, delay: number | null): UseTimeoutResult {
  const callbackRef = useLatestRef(callback);
  const delayRef = useLatestRef(delay);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clear = useCallback(() => {
    if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const reset = useCallback(() => {
    clear();
    const ms = delayRef.current;
    if (ms === null) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      callbackRef.current();
    }, ms);
  }, [clear, delayRef, callbackRef]);

  useEffect(() => {
    reset();
    return clear;
  }, [delay, reset, clear]);

  return { reset, clear };
}
