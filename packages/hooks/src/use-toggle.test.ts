import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useToggle } from './use-toggle';

describe('useToggle', () => {
  it("boshlang'ich qiymatdan boshlanadi va almashtiriladi", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('toggle funksiyasi renderlar orasida bir xil qoladi', () => {
    const { result, rerender } = renderHook(() => useToggle());
    const first = result.current[1];
    rerender();
    expect(result.current[1]).toBe(first);
  });
});
