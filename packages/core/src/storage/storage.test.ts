import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryStorage, createStorage, type StorageLike } from './index';

describe('createStorage', () => {
  let mem: StorageLike;

  beforeEach(() => {
    mem = createMemoryStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('JSON qiymatlarni saqlaydi va o‘qiydi', () => {
    const store = createStorage({ storage: mem });
    const value = { ism: 'Sarvar', yosh: 25, teglar: ['a', 'b'], bor: true, yoq: null };
    expect(store.set('user', value)).toBe(true);
    expect(store.get('user')).toEqual(value);
    store.set('n', 0);
    store.set('s', '');
    store.set('f', false);
    expect(store.get('n')).toBe(0);
    expect(store.get('s')).toBe('');
    expect(store.get('f')).toBe(false);
  });

  it('kirill va o‘zbek apostroflari buzilmaydi', () => {
    const store = createStorage({ storage: mem });
    const text = "Тошкент — oʻzbek o'zbek o‘zbek o’zbek o`zbek oʼzbek";
    store.set('t', text);
    expect(store.get('t')).toBe(text);
  });

  it('yo‘q kalit → null yoki fallback', () => {
    const store = createStorage({ storage: mem });
    expect(store.get('yoq')).toBeNull();
    expect(store.get('yoq', 42)).toBe(42);
    expect(store.get('', 'x')).toBe('x');
  });

  it('prefiks qo‘shiladi', () => {
    const store = createStorage({ prefix: 'app:', storage: mem });
    store.set('k', 1);
    expect(mem.getItem('app:k')).not.toBeNull();
    expect(mem.getItem('k')).toBeNull();
  });

  it('ttl o‘tgach null qaytaradi va yozuvni o‘chiradi', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const store = createStorage({ prefix: 'p:', storage: mem });
    store.set('token', 'abc', { ttl: 1000 });
    store.set('doimiy', 'x');
    vi.advanceTimersByTime(999);
    expect(store.get('token')).toBe('abc');
    vi.advanceTimersByTime(1);
    expect(store.get('token')).toBeNull();
    expect(store.get('token', 'eski')).toBe('eski');
    expect(mem.getItem('p:token')).toBeNull();
    vi.advanceTimersByTime(10 ** 9);
    expect(store.get('doimiy')).toBe('x');
  });

  it('musbat bo‘lmagan ttl e‘tiborsiz qoldiriladi', () => {
    const store = createStorage({ storage: mem });
    store.set('a', 1, { ttl: 0 });
    store.set('b', 2, { ttl: -5 });
    store.set('c', 3, { ttl: Number.NaN });
    expect([store.get('a'), store.get('b'), store.get('c')]).toEqual([1, 2, 3]);
  });

  it('buzilgan yoki begona formatdagi qiymatda xato bermaydi', () => {
    const store = createStorage({ storage: mem });
    mem.setItem('buzuq', '{not json');
    mem.setItem('begona', '"oddiy satr"');
    mem.setItem('null', 'null');
    expect(store.get('buzuq')).toBeNull();
    expect(store.get('begona', 'fb')).toBe('fb');
    expect(store.get('null')).toBeNull();
  });

  it('undefined saqlash = o‘chirish; remove', () => {
    const store = createStorage({ storage: mem });
    store.set('a', 1);
    store.set('a', undefined);
    expect(mem.getItem('a')).toBeNull();
    store.set('b', 1);
    store.remove('b');
    expect(store.get('b')).toBeNull();
  });

  it('clear faqat prefiksli kalitlarni o‘chiradi', () => {
    const store = createStorage({ prefix: 'app:', storage: mem });
    store.set('a', 1);
    store.set('b', 2);
    mem.setItem('boshqa', 'x');
    store.clear();
    expect(mem.length).toBe(1);
    expect(mem.getItem('boshqa')).toBe('x');
  });

  it('prefikssiz clear hammasini o‘chiradi', () => {
    const store = createStorage({ storage: mem });
    store.set('a', 1);
    mem.setItem('boshqa', 'x');
    store.clear();
    expect(mem.length).toBe(0);
  });

  it('storage xato tashlasa jim ishlaydi', () => {
    const broken: StorageLike = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
      get length(): number {
        throw new Error('SecurityError');
      },
    };
    const store = createStorage({ storage: broken });
    expect(store.set('a', 1)).toBe(false);
    expect(store.get('a', 'fb')).toBe('fb');
    expect(() => store.remove('a')).not.toThrow();
    expect(() => store.clear()).not.toThrow();
  });

  it('serializatsiya qilib bo‘lmaydigan qiymat → false', () => {
    const store = createStorage({ storage: mem });
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(store.set('c', circular)).toBe(false);
    expect(store.set('big', 10n)).toBe(false);
  });

  it('localStorage yo‘q (SSR) — jim ishlaydi', () => {
    expect('localStorage' in globalThis).toBe(false);
    const store = createStorage();
    expect(store.set('a', 1)).toBe(false);
    expect(store.get('a')).toBeNull();
    expect(() => store.clear()).not.toThrow();
  });

  it('standart holatda global localStorage ni chaqiruv paytida oladi', () => {
    const store = createStorage({ prefix: 'x:' });
    const ls = createMemoryStorage();
    vi.stubGlobal('localStorage', ls);
    store.set('a', 1);
    expect(ls.getItem('x:a')).not.toBeNull();
    expect(store.get('a')).toBe(1);
  });

  it('localStorage ga murojaat taqiqlangan bo‘lsa jim ishlaydi', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      const store = createStorage();
      expect(store.set('a', 1)).toBe(false);
      expect(store.get('a', 0)).toBe(0);
    } finally {
      delete (globalThis as { localStorage?: unknown }).localStorage;
    }
  });
});
