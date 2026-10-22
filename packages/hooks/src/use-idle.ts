import { useEffect, useState } from 'react';

/** Standart faollik hodisalari. */
const DEFAULT_EVENTS = ['mousemove', 'keydown', 'touchstart', 'scroll', 'visibilitychange'];

export interface UseIdleOptions {
  /** Faollik deb hisoblanadigan hodisalar. `visibilitychange` — `document` da, qolgani `window` da. */
  events?: string[];
  /** Mount'dagi holat. Standart: `false`. */
  initialState?: boolean;
}

/**
 * Foydalanuvchi `ms` millisekund davomida hech narsa qilmasa `true` qaytaradi
 * (avtomatik chiqish, "Hali shu yerdamisiz?" oynasi). Har bir faollik hodisasi taymerni
 * qaytadan boshlaydi va holatni `false` ga qaytaradi. Tabni yashirish faollik hisoblanmaydi,
 * tabga qaytish — hisoblanadi.
 * @example
 * const idle = useIdle(5 * 60_000);
 * useEffect(() => {
 *   if (idle) logout();
 * }, [idle]);
 */
export function useIdle(
  ms: number,
  { events = DEFAULT_EVENTS, initialState = false }: UseIdleOptions = {},
): boolean {
  const [idle, setIdle] = useState(initialState);
  // Massiv har renderda yangi bo'lishi mumkin — kalit sifatida satr
  const eventsKey = events.join(',');

  useEffect(() => {
    const names = eventsKey ? eventsKey.split(',') : [];
    let timer = setTimeout(() => setIdle(true), ms);

    const onActivity = (event: Event) => {
      if (event.type === 'visibilitychange' && document.visibilityState !== 'visible') return;
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), ms);
    };

    const targetOf = (name: string): Window | Document =>
      name === 'visibilitychange' ? document : window;
    for (const name of names) targetOf(name).addEventListener(name, onActivity, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const name of names) targetOf(name).removeEventListener(name, onActivity);
    };
  }, [ms, eventsKey]);

  return idle;
}
