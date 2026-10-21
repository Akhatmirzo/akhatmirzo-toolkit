import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';

const LOCAL_EVENT = 'akhatmirzo:local-storage';

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

// Storage taqiqlangan yoki to'la bo'lganda xotiradagi zaxira (null — o'chirilgan)
const memory = new Map<string, string | null>();

function readRaw(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Storage'ga yozadi; muvaffaqiyatsiz bo'lsa qiymat xotirada qoladi. */
function writeRaw(key: string, text: string | null) {
  if (typeof window === 'undefined') return; // serverda so'rovlar orasida holat saqlanmasin
  try {
    const storage = getStorage();
    if (!storage) throw new Error('storage yo‘q');
    if (text === null) storage.removeItem(key);
    else storage.setItem(key, text);
    memory.delete(key);
  } catch {
    memory.set(key, text);
  }
}

function notify(key: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<string>(LOCAL_EVENT, { detail: key }));
}

function parse<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** `useLocalStorage` qaytaradigan kortej: `[value, setValue, remove]`. */
export type UseLocalStorageResult<T> = [
  value: T,
  setValue: (value: T | ((prev: T) => T)) => void,
  remove: () => void,
];

/**
 * `localStorage` bilan sinxron holat (JSON). Boshqa tablar (`storage` hodisasi) va shu
 * sahifadagi bir xil kalitli hooklar o'rtasida sinxronlanadi. SSR'da `initial` qaytadi.
 * Storage taqiqlangan yoki to'la bo'lsa qiymat sahifa xotirasida saqlanadi (holat ishlayveradi);
 * yaroqsiz JSON — `initial`. Xatolar tashlanmaydi.
 * Qiymat oddiy JSON sifatida yoziladi — `createStorage` (@akhatmirzo/core) o'z formatida
 * (`{ v, e }`) yozadi, shuning uchun ikkalasida bir xil kalitni ishlatmang.
 * @example const [count, setCount, reset] = useLocalStorage('count', 0);
 */
export function useLocalStorage<T>(key: string, initial: T | (() => T)): UseLocalStorageResult<T> {
  const [fallback] = useState(initial);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const onStorage = (e: StorageEvent) => {
        if (e.key !== null && e.key !== key) return;
        // Boshqa tab yoza oldi — storage ishlayapti, zaxira eskirgan
        memory.delete(key);
        onChange();
      };
      const onLocal = (e: Event) => {
        if ((e as CustomEvent<string>).detail === key) onChange();
      };
      window.addEventListener('storage', onStorage);
      window.addEventListener(LOCAL_EVENT, onLocal);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener(LOCAL_EVENT, onLocal);
      };
    },
    [key],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  const value = useMemo(() => parse(raw, fallback), [raw, fallback]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = parse(readRaw(key), fallback);
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      let text: string | undefined;
      try {
        text = JSON.stringify(resolved);
      } catch {
        return; // aylanma havola va h.k. — saqlab bo'lmaydi
      }
      writeRaw(key, text ?? null);
      notify(key);
    },
    [key, fallback],
  );

  const remove = useCallback(() => {
    writeRaw(key, null);
    notify(key);
  }, [key]);

  return [value, setValue, remove];
}
