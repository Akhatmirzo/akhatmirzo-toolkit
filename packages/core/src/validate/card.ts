export type CardBrand = 'uzcard' | 'humo' | 'visa' | 'mastercard';

function onlyDigits(input: string | null | undefined): string {
  return (input ?? '').replace(/\D/g, '');
}

/**
 * Luhn nazorat yig'indisi (faqat raqamlardan iborat satr uchun).
 * @example luhnCheck('4111111111111111') // true
 */
export function luhnCheck(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * Karta raqami: 16 raqam (bo'shliq/chiziqcha mumkin) va Luhn to'g'ri.
 * @example isValidCardNumber('4111 1111 1111 1111') // true
 */
export function isValidCardNumber(input: string | null | undefined): boolean {
  const d = onlyDigits(input);
  return d.length === 16 && luhnCheck(d);
}

/**
 * Karta brendini prefiks bo'yicha aniqlaydi (to'liq bo'lmagan raqamda ham).
 * Uzcard 8600, Humo 9860, Visa 4, Mastercard 51–55 va 2221–2720.
 * @example detectCardBrand('8600 12') // 'uzcard'
 */
export function detectCardBrand(input: string | null | undefined): CardBrand | null {
  const d = onlyDigits(input);
  if (d.startsWith('8600')) return 'uzcard';
  if (d.startsWith('9860')) return 'humo';
  if (d.startsWith('4')) return 'visa';
  const two = Number(d.slice(0, 2));
  if (d.length >= 2 && two >= 51 && two <= 55) return 'mastercard';
  const four = Number(d.slice(0, 4));
  if (d.length >= 4 && four >= 2221 && four <= 2720) return 'mastercard';
  return null;
}
