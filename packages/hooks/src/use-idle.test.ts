import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIdle } from './use-idle';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const fire = (target: Window | Document, type: string) =>
  act(() => {
    target.dispatchEvent(new Event(type));
  });

describe('useIdle', () => {
  it('ms dan keyin true, faollik — false va taymer qaytadan', () => {
    const { result } = renderHook(() => useIdle(1000));
    expect(result.current).toBe(false);
    advance(999);
    expect(result.current).toBe(false);
    advance(1);
    expect(result.current).toBe(true);
    fire(window, 'mousemove');
    expect(result.current).toBe(false);
    advance(800);
    fire(window, 'keydown');
    advance(800);
    expect(result.current).toBe(false);
    advance(200);
    expect(result.current).toBe(true);
  });

  it('initialState va maxsus events', () => {
    const { result } = renderHook(() => useIdle(1000, { initialState: true, events: ['click'] }));
    expect(result.current).toBe(true);
    fire(window, 'mousemove');
    expect(result.current).toBe(true);
    fire(window, 'click');
    expect(result.current).toBe(false);
  });

  it('visibilitychange — faqat ko‘rinadigan bo‘lganda faollik', () => {
    const state = vi.spyOn(document, 'visibilityState', 'get');
    const { result } = renderHook(() => useIdle(1000));
    advance(1000);
    state.mockReturnValue('hidden');
    fire(document, 'visibilitychange');
    expect(result.current).toBe(true);
    state.mockReturnValue('visible');
    fire(document, 'visibilitychange');
    expect(result.current).toBe(false);
  });

  it('unmount’da listener va taymer tozalanadi', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useIdle(1000));
    unmount();
    expect(remove).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });
});
