import { useCallback, useEffect, useState } from 'react';

export interface UseIntersectionOptions extends IntersectionObserverInit {
  /** `false` bo'lsa kuzatilmaydi (masalan, keyingi sahifa qolmaganda). */
  enabled?: boolean;
}

/** `useIntersection` qaytaradigan kortej: `[ref, entry]`. */
export type UseIntersectionResult<T extends Element> = [
  ref: (node: T | null) => void,
  entry: IntersectionObserverEntry | null,
];

/**
 * Elementning ko'rinish maydoniga kirishini kuzatadi (cheksiz scroll, lazy yuklash).
 * Callback ref qaytaradi — element keyinroq (shartli) render bo'lsa ham kuzatiladi.
 * `IntersectionObserver` yo'q muhitda (SSR, eski brauzer) `entry` `null` bo'ladi.
 *
 * Eslatma: sentinel ko'rinishda qolsa `entry` o'zgarmaydi — keyingi yuklash uchun
 * ro'yxat uzunligini ham bog'liqlikka qo'shing.
 * @example
 * const [sentinelRef, entry] = useIntersection<HTMLDivElement>({ rootMargin: '200px' });
 * useEffect(() => {
 *   if (entry?.isIntersecting) loadMore();
 * }, [entry, items.length]);
 * return <div ref={sentinelRef} />;
 */
export function useIntersection<T extends Element = Element>({
  root = null,
  rootMargin,
  threshold,
  enabled = true,
}: UseIntersectionOptions = {}): UseIntersectionResult<T> {
  const [node, setNode] = useState<T | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  // Massiv har renderda yangi bo'lishi mumkin — kalit sifatida satr
  const thresholdKey = Array.isArray(threshold) ? threshold.join(',') : threshold;

  const ref = useCallback((el: T | null) => {
    setNode(el);
    // Eski elementning holati yangi (yoki yo'q) elementga tegishli emas
    if (!el) setEntry(null);
  }, []);

  useEffect(() => {
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const last = entries[entries.length - 1];
        if (last) setEntry(last);
      },
      {
        root,
        rootMargin,
        threshold:
          typeof thresholdKey === 'string' ? thresholdKey.split(',').map(Number) : thresholdKey,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, root, rootMargin, thresholdKey, enabled]);

  return [ref, entry];
}
