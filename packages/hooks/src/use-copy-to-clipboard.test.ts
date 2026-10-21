import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCopyToClipboard } from './use-copy-to-clipboard';

function mockClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn(writeText) },
  });
}

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
});

describe('useCopyToClipboard', () => {
  it('nusxalaydi va resetMs dan keyin copied qaytadi', async () => {
    vi.useFakeTimers();
    mockClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopyToClipboard(1000));
    let ok = false;
    await act(async () => {
      ok = await result.current.copy('Oʻzbekiston');
    });
    expect(ok).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Oʻzbekiston');
    expect(result.current.copied).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copied).toBe(false);
  });

  it('clipboard rad etsa va execCommand ham bo‘lmasa false', async () => {
    mockClipboard(() => Promise.reject(new Error('NotAllowedError')));
    const { result } = renderHook(() => useCopyToClipboard());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('');
    });
    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);
  });

  it('clipboard API yo‘q bo‘lsa execCommand ga o‘tadi', async () => {
    const exec = vi.fn(() => true);
    document.execCommand = exec;
    const { result } = renderHook(() => useCopyToClipboard());
    let ok = false;
    await act(async () => {
      ok = await result.current.copy('salom');
    });
    expect(exec).toHaveBeenCalledWith('copy');
    expect(ok).toBe(true);
    expect(document.querySelector('textarea')).toBeNull();
    // @ts-expect-error — tozalash
    delete document.execCommand;
  });
});
