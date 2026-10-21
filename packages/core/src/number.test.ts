import { describe, expect, it } from 'vitest';
import { clamp } from './number';

describe('clamp', () => {
  it("oraliq ichidagi qiymatni o'zgartirmaydi", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('chegaradan chiqqan qiymatni cheklaydi', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("min > max bo'lsa xato beradi", () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});
