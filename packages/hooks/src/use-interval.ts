import { useEffect } from 'react';
import { useLatestRef } from './internal';

/**
 * `callback` ni har `delay` millisekundda chaqiradi. `delay` — `null` bo'lsa to'xtaydi.
 * Callback o'zgarsa interval qayta boshlanmaydi — har safar eng so'nggi funksiya chaqiriladi.
 * `delay` o'zgarsa interval yangi qiymat bilan qaytadan boshlanadi.
 * @example
 * const [count, setCount] = useState(0);
 * useInterval(() => setCount((n) => n + 1), paused ? null : 1000);
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useLatestRef(callback);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay, callbackRef]);
}
