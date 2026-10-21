import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { groupBy, uniqueBy } from './collection';
import type { AbortSignalLike } from './env';
import { sleep } from './sleep';
import { debounce, throttle } from './timing';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('oxirgi argumentlar bilan bir marta chaqiradi', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d('a');
    vi.advanceTimersByTime(50);
    d('ab');
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    expect(d.pending()).toBe(true);
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('ab');
    expect(d.pending()).toBe(false);
  });

  it('cancel — chaqirilmaydi', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1);
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush — darhol bajaradi, keyin qayta chaqirmaydi', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d.flush();
    expect(fn).not.toHaveBeenCalled();
    d(1, 2);
    d.flush();
    expect(fn).toHaveBeenCalledWith(1, 2);
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('leading + trailing', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    expect(fn).toHaveBeenLastCalledWith(1);
    t(2);
    t(3);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(3);
  });

  it('oraliq tugagach yangi chaqiruv darhol bajariladi', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    vi.advanceTimersByTime(150);
    t(2);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });

  it('uzluksiz chaqiruvda ms da bir martadan oshmaydi', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    for (let i = 0; i < 50; i++) {
      t(i);
      vi.advanceTimersByTime(10);
    }
    vi.advanceTimersByTime(100);
    // 500ms davomida: leading + har 100ms da bittadan
    expect(fn.mock.calls.length).toBeGreaterThanOrEqual(5);
    expect(fn.mock.calls.length).toBeLessThanOrEqual(6);
    expect(fn).toHaveBeenLastCalledWith(49);
  });

  it('cancel — trailing bekor qilinadi', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t(1);
    t(2);
    t.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// core `lib: ES2022` — DOM tiplarisiz; Node'da AbortController global mavjud
const { AbortController } = globalThis as unknown as {
  AbortController: new () => { signal: AbortSignalLike; abort(reason?: unknown): void };
};

describe('sleep', () => {
  it('kutib, resolve bo‘ladi', async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    const p = sleep(100).then(done);
    await vi.advanceTimersByTimeAsync(99);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await p;
    expect(done).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('signal bekor qilinsa reject (AbortError)', async () => {
    const ctrl = new AbortController();
    const p = sleep(10_000, ctrl.signal);
    ctrl.abort();
    await expect(p).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('allaqachon bekor qilingan signal — darhol reject, sabab saqlanadi', async () => {
    const ctrl = new AbortController();
    const reason = new Error('sabab');
    ctrl.abort(reason);
    await expect(sleep(10, ctrl.signal)).rejects.toBe(reason);
  });

  it('resolve bo‘lgach abort hech narsa qilmaydi', async () => {
    const ctrl = new AbortController();
    await sleep(1, ctrl.signal);
    expect(() => ctrl.abort()).not.toThrow();
  });
});

describe('groupBy', () => {
  it('kalit bo‘yicha guruhlaydi, tartib saqlanadi', () => {
    const items = [
      { name: 'Ali', role: 'admin' },
      { name: 'Vali', role: 'user' },
      { name: 'Gani', role: 'admin' },
    ];
    const g = groupBy(items, (u) => u.role);
    expect(g.admin?.map((u) => u.name)).toEqual(['Ali', 'Gani']);
    expect(g.user?.map((u) => u.name)).toEqual(['Vali']);
    expect(Object.keys(g)).toEqual(['admin', 'user']);
  });

  it("bo'sh massiv va xavfli kalitlar (__proto__)", () => {
    expect(Object.keys(groupBy([], () => 'x'))).toEqual([]);
    const g = groupBy(['a', 'b'], (s) => (s === 'a' ? '__proto__' : 'constructor'));
    expect(g['__proto__']).toEqual(['a']);
    expect(g['constructor']).toEqual(['b']);
  });

  it('indeks ham beriladi', () => {
    const g = groupBy([10, 20, 30, 40], (_, i) => (i % 2 ? 'toq' : 'juft'));
    expect(g).toEqual({ juft: [10, 30], toq: [20, 40] });
  });
});

describe('uniqueBy', () => {
  it('har kalitning birinchi elementi qoladi', () => {
    const rows = [
      { id: 1, v: 'a' },
      { id: 2, v: 'b' },
      { id: 1, v: 'c' },
    ];
    expect(uniqueBy(rows, (r) => r.id)).toEqual([
      { id: 1, v: 'a' },
      { id: 2, v: 'b' },
    ]);
  });

  it("bo'sh massiv, NaN va normallashtirilgan kalit", () => {
    expect(uniqueBy([], (x) => x)).toEqual([]);
    expect(uniqueBy([NaN, NaN, 1], (x) => x)).toEqual([NaN, 1]);
    expect(uniqueBy(['Toshkent', 'TOSHKENT', 'Samarqand'], (s) => s.toLowerCase())).toEqual([
      'Toshkent',
      'Samarqand',
    ]);
  });
});
