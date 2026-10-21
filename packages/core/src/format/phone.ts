export type PhoneStyle = 'international' | 'national';

const toDigits = (input: string | number | null | undefined): string =>
  input == null ? '' : String(input).replace(/\D/g, '');

/**
 * O'zbekiston telefon raqamini formatlaydi. Kiritish to'liq bo'lmasa ham bosqichma-bosqich
 * formatlaydi (yozish paytida ishlatish uchun). `+998` faqat `+` bilan yoki 9 tadan ko'p
 * raqam berilganda olib tashlanadi — aks holda "99 8…" kabi milliy raqam bilan adashadi.
 * @example formatPhone('901234567') // "+998 90 123 45 67"
 * @example formatPhone('+998901234567', 'national') // "(90) 123-45-67"
 * @example formatPhone('90123', 'national') // "(90) 123"
 */
export function formatPhone(
  input: string | number | null | undefined,
  style: PhoneStyle = 'international',
): string {
  const text = input == null ? '' : String(input).trim();
  let digits = toDigits(text);
  const hasPrefix = digits.startsWith('998') && (text.startsWith('+') || digits.length > 9);
  if (hasPrefix) digits = digits.slice(3);
  const d = digits.slice(0, 9);

  if (style === 'national') {
    let out = d.length ? '(' + d.slice(0, 2) : '';
    if (d.length > 2) out += ') ' + d.slice(2, 5);
    if (d.length > 5) out += '-' + d.slice(5, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    return out;
  }

  if (!d.length) return hasPrefix ? '+998' : '';
  const groups = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return '+998 ' + groups.join(' ');
}

/**
 * Karta raqamini 4 tadan guruhlaydi (bosqichma-bosqich, ko'pi bilan 19 raqam).
 * @example formatCardNumber('8600123412341234') // "8600 1234 1234 1234"
 */
export function formatCardNumber(input: string | number | null | undefined): string {
  return toDigits(input)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}
