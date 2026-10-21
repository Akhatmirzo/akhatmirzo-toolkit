/** `value` ni `[min, max]` oralig'iga cheklaydi. */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new RangeError(`clamp: min (${min}) max (${max}) dan katta`);
  return Math.min(Math.max(value, min), max);
}
