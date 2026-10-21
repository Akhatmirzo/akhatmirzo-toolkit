import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce, useDebouncedCallback } from './use-debounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDebounce', () => {
  it("faqat oxirgi o'zgarishdan ms o'tgach yangilanadi", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: '' },
    });
    expect(result.current).toBe('');
    rerender({ v: 'sa' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ v: "o'zbek" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("o'zbek");
  });

  it('unmount taymerni tozalaydi', () => {
    const { rerender, unmount } = renderHook(({ v }) => useDebounce(v, 100), {
      initialProps: { v: 1 },
    });
    rerender({ v: 2 });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('useDebouncedCallback', () => {
  it("bir necha chaqiruvdan so'ng bir marta, oxirgi argumentlar bilan ishlaydi", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 200));
    act(() => {
      result.current('a');
      result.current('ab');
      result.current('abc');
    });
    expect(fn).not.toHaveBeenCalled();
    expect(result.current.isPending()).toBe(true);
    act(() => vi.advanceTimersByTime(200));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('abc');
    expect(result.current.isPending()).toBe(false);
  });

  it('eng so‘nggi fn ishlatiladi', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ fn }) => useDebouncedCallback(fn, 100), {
      initialProps: { fn: first },
    });
    act(() => result.current());
    rerender({ fn: second });
    act(() => vi.advanceTimersByTime(100));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('cancel kutilayotgan chaqiruvni bekor qiladi', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));
    act(() => result.current(1));
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(500));
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush darhol bajaradi, kutilayotgan chaqiruv bo‘lmasa hech narsa qilmaydi', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 100));
    act(() => result.current.flush());
    expect(fn).not.toHaveBeenCalled();
    act(() => result.current('x'));
    act(() => result.current.flush());
    expect(fn).toHaveBeenCalledWith('x');
    act(() => vi.advanceTimersByTime(500));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('funksiya renderlar orasida barqaror', () => {
    const { result, rerender } = renderHook(() => useDebouncedCallback(() => {}, 100));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('unmount’da bekor qilinadi', () => {
    const fn = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 100));
    act(() => result.current());
    unmount();
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });
});
