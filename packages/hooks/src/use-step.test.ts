import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStep } from './use-step';

describe('useStep', () => {
  it('next / prev chegaradan chiqmaydi, progress 0..1', () => {
    const { result } = renderHook(() => useStep(3));
    expect(result.current).toMatchObject({ step: 0, isFirst: true, isLast: false, progress: 0 });
    act(() => result.current.prev());
    expect(result.current.step).toBe(0);
    act(() => result.current.next());
    expect(result.current).toMatchObject({ step: 1, progress: 0.5 });
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current).toMatchObject({ step: 2, isFirst: false, isLast: true, progress: 1 });
  });

  it('goTo qisiladi, reset initial ga qaytaradi', () => {
    const { result } = renderHook(() => useStep(5, { initial: 2 }));
    expect(result.current.step).toBe(2);
    act(() => result.current.goTo(10));
    expect(result.current.step).toBe(4);
    act(() => result.current.goTo(-3));
    expect(result.current.step).toBe(0);
    act(() => result.current.reset());
    expect(result.current.step).toBe(2);
  });

  it('count kamaysa qadam qisiladi; initial chegaradan tashqarida bo‘lsa ham', () => {
    const { result, rerender } = renderHook(({ count }) => useStep(count, { initial: 9 }), {
      initialProps: { count: 4 },
    });
    expect(result.current.step).toBe(3);
    rerender({ count: 2 });
    expect(result.current).toMatchObject({ step: 1, isLast: true });
    act(() => result.current.prev());
    expect(result.current.step).toBe(0);
  });

  it('bitta qadam — birinchi ham, oxirgi ham', () => {
    const { result } = renderHook(() => useStep(1));
    expect(result.current).toMatchObject({ step: 0, isFirst: true, isLast: true, progress: 1 });
  });
});
