import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from './use-local-storage';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('useLocalStorage', () => {
  it('bo‘sh bo‘lsa initial, mavjud bo‘lsa JSON qiymatni qaytaradi', () => {
    const a = renderHook(() => useLocalStorage('a', 5));
    expect(a.result.current[0]).toBe(5);
    localStorage.setItem('b', JSON.stringify({ ism: 'Oʻgʻil' }));
    const b = renderHook(() => useLocalStorage('b', { ism: '' }));
    expect(b.result.current[0]).toEqual({ ism: 'Oʻgʻil' });
  });

  it('initial funksiya bo‘lishi mumkin', () => {
    const { result } = renderHook(() => useLocalStorage('f', () => [1, 2]));
    expect(result.current[0]).toEqual([1, 2]);
  });

  it('yozadi, funksional yangilaydi va o‘chiradi', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => result.current[1](1));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem('count')).toBe('2');
    act(() => result.current[2]());
    expect(result.current[0]).toBe(0);
    expect(localStorage.getItem('count')).toBeNull();
  });

  it('bir sahifadagi bir xil kalitli hooklar sinxron', () => {
    const one = renderHook(() => useLocalStorage('shared', 'a'));
    const two = renderHook(() => useLocalStorage('shared', 'a'));
    const other = renderHook(() => useLocalStorage('other', 'z'));
    act(() => one.result.current[1]('qoʻshiq'));
    expect(two.result.current[0]).toBe('qoʻshiq');
    expect(other.result.current[0]).toBe('z');
  });

  it('boshqa tabdagi o‘zgarishni (storage hodisasi) oladi', () => {
    const { result } = renderHook(() => useLocalStorage('tab', 0));
    act(() => {
      localStorage.setItem('tab', '42');
      window.dispatchEvent(new StorageEvent('storage', { key: 'tab', newValue: '42' }));
    });
    expect(result.current[0]).toBe(42);
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(result.current[0]).toBe(0);
  });

  it('yaroqsiz JSON bo‘lsa initial qaytadi', () => {
    localStorage.setItem('bad', '{yaroqsiz');
    const { result } = renderHook(() => useLocalStorage('bad', 'ok'));
    expect(result.current[0]).toBe('ok');
  });

  it('setItem xatosida tashlamaydi va qiymat xotirada yangilanadi', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const one = renderHook(() => useLocalStorage('q', 1));
    const two = renderHook(() => useLocalStorage('q', 1));
    expect(() => act(() => one.result.current[1](2))).not.toThrow();
    act(() => one.result.current[1]((n) => n + 1));
    expect(one.result.current[0]).toBe(3);
    expect(two.result.current[0]).toBe(3);
    expect(localStorage.getItem('q')).toBeNull();
  });

  it('storage tiklansa yozuv storage’ga o‘tadi', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const { result } = renderHook(() => useLocalStorage('qayta', 'a'));
    act(() => result.current[1]('oʻ'));
    expect(result.current[0]).toBe('oʻ');
    spy.mockRestore();
    act(() => result.current[1]('gʼ'));
    expect(result.current[0]).toBe('gʼ');
    expect(localStorage.getItem('qayta')).toBe('"gʼ"');
  });

  it('storage butunlay taqiqlangan bo‘lsa ham yozish, o‘qish va o‘chirish ishlaydi', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const { result } = renderHook(() => useLocalStorage('blok', 0));
    act(() => result.current[1]((n) => n + 1));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(2);
    act(() => result.current[2]());
    expect(result.current[0]).toBe(0);
  });

  it('getItem xatosida initial qaytadi', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const { result } = renderHook(() => useLocalStorage('s', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('qiymat o‘zgarmasa bir xil obyekt qaytadi (keraksiz render yo‘q)', () => {
    localStorage.setItem('obj', '{"a":1}');
    const { result, rerender } = renderHook(() => useLocalStorage('obj', { a: 0 }));
    const first = result.current[0];
    rerender();
    expect(result.current[0]).toBe(first);
  });
});
