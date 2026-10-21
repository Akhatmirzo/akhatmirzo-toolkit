/** `localStorage` / `sessionStorage` bilan mos minimal interfeys. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  readonly length?: number;
  key?(index: number): string | null;
  clear?(): void;
}

export interface CreateStorageOptions {
  /** Har bir kalit oldidan qo'shiladi, masalan `'app:'` */
  prefix?: string;
  /** Standart — `localStorage` (mavjud bo'lsa). `sessionStorage` yoki `createMemoryStorage()` berish mumkin */
  storage?: StorageLike;
}

export interface SetOptions {
  /** Yashash muddati (ms). Faqat musbat qiymat hisobga olinadi */
  ttl?: number;
}

export interface TypedStorage {
  /** Qiymatni o'qiydi; yo'q, muddati o'tgan yoki buzilgan bo'lsa `fallback` (yoki `null`) */
  get<T>(key: string): T | null;
  get<T>(key: string, fallback: T): T;
  /** JSON qilib saqlaydi. `undefined` — o'chirish. Muvaffaqiyatli bo'lsa `true` */
  set(key: string, value: unknown, options?: SetOptions): boolean;
  remove(key: string): void;
  /** Prefiksli kalitlarni o'chiradi (prefiks bo'sh bo'lsa — hammasini) */
  clear(): void;
}

interface Entry {
  v: unknown;
  e?: number;
}

function isEntry(x: unknown): x is Entry {
  return typeof x === 'object' && x !== null && 'v' in x;
}

function defaultStorage(): StorageLike | null {
  try {
    const g = globalThis as { localStorage?: StorageLike };
    return g.localStorage ?? null;
  } catch {
    // Brauzer saytga storage'ni taqiqlagan bo'lsa murojaatning o'zi xato beradi
    return null;
  }
}

/**
 * Xotiradagi `StorageLike` — testlar va SSR uchun.
 * @example createStorage({ storage: createMemoryStorage() })
 */
export function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    get length() {
      return map.size;
    },
    key: (i) => [...map.keys()][i] ?? null,
    clear: () => map.clear(),
  };
}

/**
 * JSON va muddat (ttl) qo'llab-quvvatlaydigan storage o'rami. Hech qachon xato tashlamaydi:
 * storage yo'q (SSR) yoki taqiqlangan bo'lsa jim ishlaydi.
 * Qiymatlar `{ v, e? }` o'ramida saqlanadi, shuning uchun oddiy JSON yozuvchi
 * `useLocalStorage` (`@akhatmirzo/hooks`) kalitlari bilan MOS EMAS — bir kalitni ikkalasida ishlatmang.
 * @example
 * const store = createStorage({ prefix: 'app:' });
 * store.set('token', 'abc', { ttl: 60_000 });
 * store.get<string>('token'); // 'abc' (1 daqiqa ichida)
 */
export function createStorage(options: CreateStorageOptions = {}): TypedStorage {
  const prefix = options.prefix ?? '';
  const resolve = (): StorageLike | null => options.storage ?? defaultStorage();
  const full = (key: string) => prefix + key;

  function remove(key: string): void {
    try {
      resolve()?.removeItem(full(key));
    } catch {
      /* jim */
    }
  }

  function get<T>(key: string, fallback?: T): T | null {
    const def = fallback === undefined ? null : fallback;
    let raw: string | null;
    try {
      raw = resolve()?.getItem(full(key)) ?? null;
    } catch {
      return def;
    }
    if (raw === null) return def;
    let entry: unknown;
    try {
      entry = JSON.parse(raw);
    } catch {
      return def;
    }
    if (!isEntry(entry)) return def;
    if (typeof entry.e === 'number' && Date.now() >= entry.e) {
      remove(key);
      return def;
    }
    return entry.v as T;
  }

  function set(key: string, value: unknown, opts: SetOptions = {}): boolean {
    if (value === undefined) {
      remove(key);
      return true;
    }
    const s = resolve();
    if (!s) return false;
    const entry: Entry = { v: value };
    const { ttl } = opts;
    if (typeof ttl === 'number' && Number.isFinite(ttl) && ttl > 0) entry.e = Date.now() + ttl;
    try {
      s.setItem(full(key), JSON.stringify(entry));
      return true;
    } catch {
      // QuotaExceeded, aylana havola (circular) va h.k.
      return false;
    }
  }

  function clear(): void {
    try {
      const s = resolve();
      if (!s) return;
      if (!prefix && s.clear) {
        s.clear();
        return;
      }
      if (typeof s.length !== 'number' || !s.key) return;
      const keys: string[] = [];
      for (let i = 0; i < s.length; i++) {
        const k = s.key(i);
        if (k !== null && k.startsWith(prefix)) keys.push(k);
      }
      keys.forEach((k) => s.removeItem(k));
    } catch {
      /* jim */
    }
  }

  return { get: get as TypedStorage['get'], set, remove, clear };
}
