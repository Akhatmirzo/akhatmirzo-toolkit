import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const getSnapshot = () => (typeof navigator === 'undefined' ? true : navigator.onLine);
const getServerSnapshot = () => true;

/**
 * Brauzer tarmoqqa ulanganmi (`navigator.onLine`, `online` / `offline` hodisalari).
 * Serverda va gidratatsiyada — `true`.
 * @example
 * const online = useOnline();
 * {!online && <Alert color="warning">Internet aloqasi yo'q</Alert>}
 */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
