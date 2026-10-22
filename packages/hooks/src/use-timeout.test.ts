import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimeout } from './use-timeout';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useTimeout', () => {
  it('delay dan keyin bir marta chaqiradi', () => {
    const fn = vi.fn();
    renderHook(() => useTimeout(fn, 1000));
    vi.advanceTimersByTime(999);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('clear bekor qiladi, reset qaytadan boshlaydi', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useTimeout(fn, 1000));
    vi.advanceTimersByTime(500);
    act(() => result.current.clear());
    vi.advanceTimersByTime(2000);
    expect(fn).not.toHaveBeenCalled();
    act(() => result.current.reset());
    vi.advanceTimersByTime(999);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('delay null — taymer qo‘yilmaydi; unmount’da bekor qilinadi', () => {
    const fn = vi.fn();
    const { rerender, unmount } = renderHook(({ delay }) => useTimeout(fn, delay), {
      initialProps: { delay: null as number | null },
    });
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
    rerender({ delay: 1000 });
    vi.advanceTimersByTime(500);
    unmount();
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('callback o‘zgarsa taymer qayta boshlanmaydi', () => {
    const a = vi.fn();
    const b = vi.fn();
    const { rerender } = renderHook(({ cb }) => useTimeout(cb, 1000), {
      initialProps: { cb: a },
    });
    vi.advanceTimersByTime(700);
    rerender({ cb: b });
    vi.advanceTimersByTime(300);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
