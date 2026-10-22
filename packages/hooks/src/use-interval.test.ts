import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInterval } from './use-interval';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('useInterval', () => {
  it('har delay ms da chaqiradi va unmount’da to‘xtaydi', () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => useInterval(fn, 1000));
    vi.advanceTimersByTime(3000);
    expect(fn).toHaveBeenCalledTimes(3);
    unmount();
    vi.advanceTimersByTime(3000);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('delay null — to‘xtaydi, qaytib raqam bo‘lsa davom etadi', () => {
    const fn = vi.fn();
    const { rerender } = renderHook(({ delay }) => useInterval(fn, delay), {
      initialProps: { delay: 1000 as number | null },
    });
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    rerender({ delay: null });
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(1);
    rerender({ delay: 500 });
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('callback o‘zgarsa interval qayta boshlanmaydi, yangisi chaqiriladi', () => {
    const a = vi.fn();
    const b = vi.fn();
    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: { cb: a },
    });
    vi.advanceTimersByTime(600);
    rerender({ cb: b });
    vi.advanceTimersByTime(400);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });
});
