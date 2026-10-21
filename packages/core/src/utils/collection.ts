/**
 * Elementlarni kalit bo'yicha guruhlaydi (tartib saqlanadi). Natija prototipsiz obyekt.
 * @example groupBy(users, (u) => u.role) // { admin: [...], user: [...] }
 */
export function groupBy<T, K extends PropertyKey>(
  items: readonly T[],
  keyFn: (item: T, index: number) => K,
): Record<K, T[]> {
  const out = Object.create(null) as Record<K, T[]>;
  items.forEach((item, index) => {
    const key = keyFn(item, index);
    const group = out[key] as T[] | undefined;
    if (group) group.push(item);
    else out[key] = [item];
  });
  return out;
}

/**
 * Kalit bo'yicha takrorlarni olib tashlaydi — har kalitning birinchi elementi qoladi.
 * @example uniqueBy(rows, (r) => r.id)
 */
export function uniqueBy<T>(items: readonly T[], keyFn: (item: T, index: number) => unknown): T[] {
  const seen = new Set<unknown>();
  return items.filter((item, index) => {
    const key = keyFn(item, index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
