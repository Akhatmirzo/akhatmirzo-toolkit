import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsync } from './use-async';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useAsync', () => {
  it('immediate: loading → success', async () => {
    const { result } = renderHook(() => useAsync(() => Promise.resolve('tayyor')));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data).toBe('tayyor');
    expect(result.current.error).toBeUndefined();
  });

  it('immediate=false: idle, run bilan ishga tushadi va argument oladi', async () => {
    const fn = vi.fn((n: number) => Promise.resolve(n * 2));
    const { result } = renderHook(() => useAsync(fn, [], { immediate: false }));
    expect(result.current.status).toBe('idle');
    expect(fn).not.toHaveBeenCalled();
    let value: number | undefined;
    await act(async () => {
      value = await result.current.run(21);
    });
    expect(value).toBe(42);
    expect(result.current.data).toBe(42);
  });

  it('xato: status error, oldingi data saqlanadi', async () => {
    let fail = false;
    const { result } = renderHook(() =>
      useAsync(() => (fail ? Promise.reject(new Error('xato')) : Promise.resolve(1))),
    );
    await waitFor(() => expect(result.current.status).toBe('success'));
    fail = true;
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.status).toBe('error');
    expect((result.current.error as Error).message).toBe('xato');
    expect(result.current.data).toBe(1);
  });

  it('eskirgan javob e’tiborsiz qoldiriladi (race)', async () => {
    const slow = deferred<string>();
    const fast = deferred<string>();
    const queue = [slow, fast];
    const { result } = renderHook(() =>
      useAsync(() => queue.shift()!.promise, [], { immediate: false }),
    );
    let first: Promise<string | undefined>;
    let second: Promise<string | undefined>;
    act(() => {
      first = result.current.run();
      second = result.current.run();
    });
    await act(async () => {
      fast.resolve('yangi');
      await second;
    });
    await act(async () => {
      slow.resolve('eski');
      expect(await first).toBeUndefined();
    });
    expect(result.current.data).toBe('yangi');
  });

  it('deps o‘zgarganda qayta ishlaydi', async () => {
    const fn = vi.fn((q: string) => Promise.resolve(q.toUpperCase()));
    const { result, rerender } = renderHook(({ q }) => useAsync(() => fn(q), [q]), {
      initialProps: { q: 'a' },
    });
    await waitFor(() => expect(result.current.data).toBe('A'));
    rerender({ q: 'b' });
    await waitFor(() => expect(result.current.data).toBe('B'));
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('unmount’dan keyin javob holatni o‘zgartirmaydi', async () => {
    const d = deferred<number>();
    const { result, unmount } = renderHook(() =>
      useAsync(() => d.promise, [], { immediate: false }),
    );
    let pending!: Promise<number | undefined>;
    act(() => {
      pending = result.current.run();
    });
    unmount();
    d.resolve(5);
    await expect(pending).resolves.toBeUndefined();
  });
});
