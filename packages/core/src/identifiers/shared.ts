/**
 * Kiritishni satrga aylantiradi va bo'shliq hamda chiziqchalarni olib tashlaydi.
 * Boshqa belgilar qoladi — ular tekshiruvda xato hisoblanadi.
 * @internal
 */
export function compact(input: string | number | null | undefined): string {
  return input == null ? '' : String(input).replace(/[\s\-‐‑‒–—]/g, '');
}

/** Satrni berilgan uzunlikdagi guruhlarga bo'lib, bo'shliq bilan qo'shadi (bosqichma-bosqich). */
export function group(s: string, sizes: readonly number[]): string {
  const parts: string[] = [];
  let i = 0;
  for (const size of sizes) {
    if (i >= s.length) break;
    parts.push(s.slice(i, i + size));
    i += size;
  }
  return parts.join(' ');
}
