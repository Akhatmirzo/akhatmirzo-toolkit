import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Komponent brauzerda gidratatsiyadan keyin render bo'lyaptimi. Serverda va gidratatsiya
 * paytida `false` (mos kelmaslik xatosi bo'lmaydi), keyin — `true`.
 * @example
 * const isClient = useIsClient();
 * return isClient ? <Chart /> : <Skeleton className="h-64" />;
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
