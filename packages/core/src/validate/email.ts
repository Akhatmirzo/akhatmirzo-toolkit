const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[^\s@.]{2,}$/;

/**
 * Email manzilini amaliy tekshiradi: `nom@domen.zona`, bo'shliqsiz, bitta `@`,
 * zona kamida 2 belgi. Chetdagi bo'shliqlar e'tiborsiz.
 * @example isValidEmail('sarvar@mail.uz') // true
 */
export function isValidEmail(input: string | null | undefined): boolean {
  const s = (input ?? '').trim();
  return s.length <= 254 && EMAIL_RE.test(s);
}
