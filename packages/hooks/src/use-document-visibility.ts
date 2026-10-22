import { useSyncExternalStore } from 'react';

/** Sahifa ko'rinish holati. */
export type DocumentVisibility = 'visible' | 'hidden';

function subscribe(onChange: () => void) {
  if (typeof document === 'undefined') return () => {};
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

function getSnapshot(): DocumentVisibility {
  return document.visibilityState === 'hidden' ? 'hidden' : 'visible';
}

/**
 * Sahifa (tab) ko'rinib turibdimi: `'visible'` yoki `'hidden'`. Foydalanuvchi boshqa tabga
 * o'tganda polling, video yoki animatsiyani to'xtatish uchun. Serverda — `'visible'`.
 * @example
 * const visibility = useDocumentVisibility();
 * useEffect(() => {
 *   if (visibility === 'hidden') return;
 *   const id = setInterval(refresh, 10_000);
 *   return () => clearInterval(id);
 * }, [visibility]);
 */
export function useDocumentVisibility(): DocumentVisibility {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'visible');
}
