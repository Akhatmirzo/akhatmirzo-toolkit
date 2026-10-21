import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMediaQuery } from './use-media-query';

type Listener = () => void;

function mockMatchMedia(initial: boolean) {
  const listeners = new Set<Listener>();
  const state = { matches: initial };
  window.matchMedia = vi.fn((query: string) => ({
    media: query,
    get matches() {
      return state.matches;
    },
    onchange: null,
    addEventListener: (_: string, l: Listener) => listeners.add(l),
    removeEventListener: (_: string, l: Listener) => listeners.delete(l),
    addListener: (l: Listener) => listeners.add(l),
    removeListener: (l: Listener) => listeners.delete(l),
    dispatchEvent: () => true,
  })) as unknown as typeof window.matchMedia;
  return {
    listeners,
    set(value: boolean) {
      state.matches = value;
      listeners.forEach((l) => l());
    },
  };
}

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
});

describe('useMediaQuery', () => {
  it('joriy holatni qaytaradi va o‘zgarishga javob beradi', () => {
    const mq = mockMatchMedia(false);
    const { result, unmount } = renderHook(() => useMediaQuery('(max-width: 640px)'));
    expect(result.current).toBe(false);
    act(() => mq.set(true));
    expect(result.current).toBe(true);
    unmount();
    expect(mq.listeners.size).toBe(0);
  });

  it('matchMedia yo‘q bo‘lsa defaultValue', () => {
    // @ts-expect-error — eski muhitni taqlid qilish
    delete window.matchMedia;
    const { result } = renderHook(() => useMediaQuery('(min-width: 1px)', true));
    expect(result.current).toBe(true);
  });
});
