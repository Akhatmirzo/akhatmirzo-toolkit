import { useEffect, useLayoutEffect, useRef } from 'react';

/** SSR'da ogohlantirishsiz ishlaydigan `useLayoutEffect`. */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? useLayoutEffect
    : useEffect;

/** Har renderdan keyin eng so'nggi qiymatni saqlaydigan ref (callback'lar uchun). */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
