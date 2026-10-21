import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  it('boshqarilmaydigan: ichki holat o‘zgaradi va onChange chaqiriladi', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('boshqariladigan: ichki holat o‘zgarmaydi, faqat onChange', () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 'a', onChange }),
      { initialProps: { value: 'x' } },
    );
    expect(result.current[0]).toBe('x');
    act(() => result.current[1]('y'));
    expect(result.current[0]).toBe('x');
    expect(onChange).toHaveBeenCalledWith('y');
    rerender({ value: 'y' });
    expect(result.current[0]).toBe('y');
  });

  it('boshqariladigan: ota rad etsa, takroriy setValue yana onChange chaqiradi', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ value: false, defaultValue: false, onChange }),
    );
    act(() => result.current[1](true));
    act(() => result.current[1](true));
    expect(onChange).toHaveBeenCalledTimes(2);
    act(() => result.current[1]((o) => !o));
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(result.current[0]).toBe(false);
  });

  it('funksional yangilash ketma-ket chaqiruvlarni yig‘adi', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 0, onChange }));
    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 2);
  });

  it('qiymat o‘zgarmasa onChange chaqirilmaydi', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: '', onChange }));
    act(() => result.current[1](''));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('defaultValue berilmasa undefined bilan boshlanadi', () => {
    const { result } = renderHook(() => useControllableState<string>({}));
    expect(result.current[0]).toBeUndefined();
    act(() => result.current[1]('ʻ'));
    expect(result.current[0]).toBe('ʻ');
  });

  it('setter barqaror', () => {
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 0 }));
    const set = result.current[1];
    rerender();
    expect(result.current[1]).toBe(set);
  });
});
