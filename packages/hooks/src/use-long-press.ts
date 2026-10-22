import {
  useEffect,
  useMemo,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useLatestRef } from './internal';

export interface UseLongPressOptions<T extends Element = Element> {
  /** Necha millisekund bosib turilganda ishlaydi. Standart: `500`. */
  delay?: number;
  /** Bosish boshlanganda (taymer ishga tushganda). */
  onStart?: (event: ReactPointerEvent<T>) => void;
  /** Muddat tugashidan oldin qo'yib yuborilsa, chetga chiqsa yoki harakat chegarasidan oshsa. */
  onCancel?: (event: ReactPointerEvent<T>) => void;
  /** Necha px siljisa bekor qilinadi (scroll bilan adashtirmaslik uchun). Standart: `10`. */
  moveThreshold?: number;
  /** Bosib turilganda brauzer kontekst menyusini (mobil) bloklash. Standart: `true`. */
  preventContextMenu?: boolean;
  /** `false` bo'lsa ishlamaydi. Standart: `true`. */
  enabled?: boolean;
}

/** Elementga yoyiladigan pointer hodisa ishlovchilari. */
export interface LongPressHandlers<T extends Element = Element> {
  onPointerDown: (event: ReactPointerEvent<T>) => void;
  onPointerMove: (event: ReactPointerEvent<T>) => void;
  onPointerUp: (event: ReactPointerEvent<T>) => void;
  onPointerLeave: (event: ReactPointerEvent<T>) => void;
  onPointerCancel: (event: ReactPointerEvent<T>) => void;
  onContextMenu: (event: ReactMouseEvent<T>) => void;
}

/**
 * Uzoq bosishni aniqlaydi (sichqoncha, sensor, qalam — Pointer Events). Qo'yib yuborilsa,
 * element chetidan chiqilsa yoki barmoq `moveThreshold` dan ko'p siljisa bekor qilinadi.
 * Qaytgan ishlovchilar barqaror — elementga yoying.
 * @example
 * const handlers = useLongPress(() => setSelectMode(true), { delay: 600 });
 * return <li {...handlers}>Buyurtma #1024</li>;
 */
export function useLongPress<T extends Element = Element>(
  callback: (event: ReactPointerEvent<T>) => void,
  options: UseLongPressOptions<T> = {},
): LongPressHandlers<T> {
  const callbackRef = useLatestRef(callback);
  const optionsRef = useLatestRef(options);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const triggeredRef = useRef(false);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  return useMemo<LongPressHandlers<T>>(() => {
    const clear = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = null;
      startRef.current = null;
    };
    const cancel = (event: ReactPointerEvent<T>) => {
      const pending = timerRef.current !== null;
      clear();
      if (pending) optionsRef.current.onCancel?.(event);
    };

    return {
      onPointerDown(event) {
        const { enabled = true, delay = 500, onStart } = optionsRef.current;
        // Har qanday yangi bosish oldingi uzoq bosish belgisini o'chiradi (aks holda keyingi
        // o'ng tugma bosilganda kontekst menyusi bloklanib qolardi)
        triggeredRef.current = false;
        // Faqat asosiy tugma (sichqonchaning chap tugmasi, barmoq, qalam)
        if (!enabled || event.button !== 0) return;
        clear();
        startRef.current = { x: event.clientX, y: event.clientY };
        // Sintetik hodisa React 17+ da qayta ishlatilmaydi — taymerda xavfsiz
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          startRef.current = null;
          triggeredRef.current = true;
          callbackRef.current(event);
        }, delay);
        onStart?.(event);
      },
      onPointerMove(event) {
        const start = startRef.current;
        if (!start || timerRef.current === null) return;
        const threshold = optionsRef.current.moveThreshold ?? 10;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (dx * dx + dy * dy > threshold * threshold) cancel(event);
      },
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel,
      onContextMenu(event) {
        if (optionsRef.current.preventContextMenu === false) return;
        if (timerRef.current !== null || triggeredRef.current) event.preventDefault();
      },
    };
  }, [callbackRef, optionsRef]);
}
