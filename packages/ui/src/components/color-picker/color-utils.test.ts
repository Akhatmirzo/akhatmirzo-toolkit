import { describe, expect, it } from 'vitest';
import {
  hexToHsva,
  hsvaToHex,
  hsvaToRgba,
  normalizeHex,
  parseHex,
  rgbaToHex,
  rgbaToHsva,
} from './color-utils';

describe('color-utils', () => {
  it('parseHex: 3 / 4 / 6 / 8 belgili, # ixtiyoriy', () => {
    expect(parseHex('#4f46e5')).toEqual({ r: 79, g: 70, b: 229, a: 1 });
    expect(parseHex('4F46E5')).toEqual({ r: 79, g: 70, b: 229, a: 1 });
    expect(parseHex('#abc')).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    expect(parseHex('#abcd')?.a).toBeCloseTo(0xdd / 255);
    expect(parseHex('#4f46e580')?.a).toBeCloseTo(0.5, 2);
    expect(parseHex('  #fff  ')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it('parseHex: noto‘g‘ri matn — null', () => {
    expect(parseHex('')).toBeNull();
    expect(parseHex('#12')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('#ggg')).toBeNull();
    expect(parseHex('red')).toBeNull();
  });

  it('rgbaToHex: kichik harf, alpha ixtiyoriy', () => {
    expect(rgbaToHex({ r: 79, g: 70, b: 229, a: 1 })).toBe('#4f46e5');
    expect(rgbaToHex({ r: 79, g: 70, b: 229, a: 1 }, true)).toBe('#4f46e5ff');
    expect(rgbaToHex({ r: 79, g: 70, b: 229, a: 0.5 }, true)).toBe('#4f46e580');
    expect(rgbaToHex({ r: 300, g: -5, b: 0, a: 0 }, true)).toBe('#ff000000');
  });

  it('rgb ↔ hsv: asosiy ranglar', () => {
    expect(rgbaToHsva({ r: 255, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 100, v: 100, a: 1 });
    expect(rgbaToHsva({ r: 0, g: 255, b: 0, a: 1 }).h).toBe(120);
    expect(rgbaToHsva({ r: 0, g: 0, b: 255, a: 1 }).h).toBe(240);
    expect(rgbaToHsva({ r: 0, g: 0, b: 0, a: 1 })).toEqual({ h: 0, s: 0, v: 0, a: 1 });
    expect(rgbaToHsva({ r: 255, g: 255, b: 255, a: 1 })).toEqual({ h: 0, s: 0, v: 100, a: 1 });

    expect(hsvaToRgba({ h: 0, s: 100, v: 100, a: 1 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hsvaToRgba({ h: 360, s: 100, v: 100, a: 1 })).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(hsvaToRgba({ h: 60, s: 100, v: 100, a: 1 })).toEqual({ r: 255, g: 255, b: 0, a: 1 });
    expect(hsvaToRgba({ h: 200, s: 0, v: 50, a: 1 })).toEqual({ r: 128, g: 128, b: 128, a: 1 });
  });

  it('hex → hsv → hex aylanasi o‘zgarmaydi', () => {
    for (const hex of [
      '#4f46e5',
      '#0ea5e9',
      '#10b981',
      '#f59e0b',
      '#e11d48',
      '#475569',
      '#000000',
    ]) {
      expect(hsvaToHex(hexToHsva(hex)!)).toBe(hex);
    }
    expect(hsvaToHex(hexToHsva('#4f46e580')!, true)).toBe('#4f46e580');
  });

  it('normalizeHex', () => {
    expect(normalizeHex('ABC')).toBe('#aabbcc');
    expect(normalizeHex('#4F46E5', true)).toBe('#4f46e5ff');
    expect(normalizeHex('#4f46e580')).toBe('#4f46e5');
    expect(normalizeHex('nope')).toBeNull();
  });
});
