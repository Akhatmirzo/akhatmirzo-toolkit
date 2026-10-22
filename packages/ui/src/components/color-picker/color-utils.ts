/*
 * Rang hisoblari (hex ↔ rgb ↔ hsv) — ColorPicker uchun ichki yordamchilar.
 * Barcha qiymatlar: r, g, b — 0..255; h — 0..360; s, v — 0..100; a — 0..1.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const HEX_RE = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Hex matnni RGBA ga o'giradi. `#abc`, `#abcd`, `#aabbcc`, `#aabbccdd` (`#` ixtiyoriy).
 * Noto'g'ri matn — `null`.
 * @example parseHex('#4f46e5') // { r: 79, g: 70, b: 229, a: 1 }
 * @example parseHex('#4f46e580') // { r: 79, g: 70, b: 229, a: 0.50196… }
 */
export function parseHex(input: string): Rgba | null {
  const match = HEX_RE.exec(input.trim());
  if (!match) return null;
  let hex = match[1]!;
  if (hex.length <= 4) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return {
    r: n(0),
    g: n(2),
    b: n(4),
    a: hex.length === 8 ? n(6) / 255 : 1,
  };
}

const toHex2 = (n: number) =>
  Math.round(clamp(n, 0, 255))
    .toString(16)
    .padStart(2, '0');

/**
 * RGBA → hex (kichik harflar). `alpha` — `#rrggbbaa`, aks holda `#rrggbb`.
 * @example rgbaToHex({ r: 79, g: 70, b: 229, a: 0.5 }, true) // '#4f46e580'
 */
export function rgbaToHex({ r, g, b, a }: Rgba, alpha = false): string {
  const base = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
  return alpha ? base + toHex2(clamp(a, 0, 1) * 255) : base;
}

/** RGB → HSV. Kulrang ranglarda (s = 0) hue `0` bo'ladi */
export function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return {
    h,
    s: max === 0 ? 0 : (d / max) * 100,
    v: max * 100,
    a,
  };
}

/** HSV → RGB (butun sonlarga yaxlitlangan) */
export function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const hh = (((h % 360) + 360) % 360) / 60;
  const c = vn * sn;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = vn - c;
  let rgb: [number, number, number];
  if (hh < 1) rgb = [c, x, 0];
  else if (hh < 2) rgb = [x, c, 0];
  else if (hh < 3) rgb = [0, c, x];
  else if (hh < 4) rgb = [0, x, c];
  else if (hh < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: Math.round((rgb[0] + m) * 255),
    g: Math.round((rgb[1] + m) * 255),
    b: Math.round((rgb[2] + m) * 255),
    a,
  };
}

/** Hex → HSVA (`null` — noto'g'ri matn) */
export function hexToHsva(hex: string): Hsva | null {
  const rgba = parseHex(hex);
  return rgba ? rgbaToHsva(rgba) : null;
}

/** HSVA → hex */
export function hsvaToHex(hsva: Hsva, alpha = false): string {
  return rgbaToHex(hsvaToRgba(hsva), alpha);
}

/**
 * Hex matnni standart ko'rinishga keltiradi: `#rrggbb` yoki (`alpha`) `#rrggbbaa`.
 * Noto'g'ri matn — `null`.
 * @example normalizeHex('ABC') // '#aabbcc'
 */
export function normalizeHex(input: string, alpha = false): string | null {
  const rgba = parseHex(input);
  return rgba ? rgbaToHex(rgba, alpha) : null;
}
