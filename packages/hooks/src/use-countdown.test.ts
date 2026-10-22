import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './use-countdown';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useCountdown', () => {
  it('o‘zi boshlanadi va "m:ss" formatida sanaydi', () => {
    const { result } = renderHook(() => useCountdown(125));
    expect(result.current).toMatchObject({ remaining: 125, isRunning: true, formatted: '2:05' });
    advance(1000);
    expect(result.current.remaining).toBe(124);
    advance(65_000);
    expect(result.current.formatted).toBe('0:59');
  });

  it('autoStart=false — start’gacha kutadi', () => {
    const { result } = renderHook(() => useCountdown(10, { autoStart: false }));
    advance(3000);
    expect(result.current).toMatchObject({ remaining: 10, isRunning: false });
    act(() => result.current.start());
    advance(3000);
    expect(result.current.remaining).toBe(7);
  });

  it('onEnd bir marta chaqiriladi va to‘xtaydi', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useCountdown(3, { onEnd }));
    advance(3000);
    expect(result.current).toMatchObject({ remaining: 0, isRunning: false, formatted: '0:00' });
    advance(10_000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('Date.now sakrasa (fon tab) — farq bo‘yicha to‘g‘ri hisoblaydi', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useCountdown(60, { onEnd }));
    advance(1000);
    expect(result.current.remaining).toBe(59);
    // Taymerlar ishlamay turgan 30 soniya
    vi.setSystemTime(Date.now() + 30_000);
    advance(1000);
    expect(result.current.remaining).toBe(28);
    vi.setSystemTime(Date.now() + 120_000);
    advance(1000);
    expect(result.current).toMatchObject({ remaining: 0, isRunning: false });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('pause qolgan vaqtni saqlaydi, start davom ettiradi', () => {
    const { result } = renderHook(() => useCountdown(10));
    advance(2500);
    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);
    advance(5000);
    expect(result.current.remaining).toBe(8);
    act(() => result.current.start());
    advance(500);
    expect(result.current.remaining).toBe(7);
  });

  it('reset — boshiga qaytaradi va to‘xtatadi; restart — qayta boshlaydi', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useCountdown(5, { onEnd }));
    advance(2000);
    act(() => result.current.reset());
    expect(result.current).toMatchObject({ remaining: 5, isRunning: false });
    advance(10_000);
    expect(onEnd).not.toHaveBeenCalled();
    act(() => result.current.restart());
    expect(result.current.isRunning).toBe(true);
    advance(5000);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('tugagach start — boshidan sanaydi, onEnd yana bir marta', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useCountdown(2, { onEnd }));
    advance(2000);
    act(() => result.current.start());
    expect(result.current).toMatchObject({ remaining: 2, isRunning: true });
    advance(2000);
    expect(onEnd).toHaveBeenCalledTimes(2);
  });

  it('ishlayotganda restart — yangi sanoq', () => {
    const { result } = renderHook(() => useCountdown(10));
    advance(4300);
    act(() => result.current.restart());
    expect(result.current.remaining).toBe(10);
    advance(999);
    expect(result.current.remaining).toBe(10);
    advance(1);
    expect(result.current.remaining).toBe(9);
  });

  it('unmount’da taymer tozalanadi', () => {
    const onEnd = vi.fn();
    const { unmount } = renderHook(() => useCountdown(2, { onEnd }));
    unmount();
    advance(5000);
    expect(onEnd).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('StrictMode: onEnd bir marta; seconds=0 — ishlamaydi', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => useCountdown(2, { onEnd }), { wrapper: StrictMode });
    advance(2000);
    expect(result.current.remaining).toBe(0);
    act(() => result.current.pause());
    advance(5000);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(false);

    const zero = renderHook(() => useCountdown(0, { onEnd }));
    expect(zero.result.current).toMatchObject({ remaining: 0, isRunning: false });
    act(() => zero.result.current.start());
    advance(1000);
    expect(zero.result.current.isRunning).toBe(false);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
