import { useCallback, useSyncExternalStore } from 'react';

function getMql(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  return window.matchMedia(query);
}

/**
 * CSS media query mos kelishini kuzatadi. SSR'da va `matchMedia` yo'q joyda `defaultValue`.
 * @example const isMobile = useMediaQuery('(max-width: 640px)');
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = getMql(query);
      if (!mql) return () => {};
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
      }
      // Eski Safari
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => getMql(query)?.matches ?? defaultValue,
    () => defaultValue,
  );
}
