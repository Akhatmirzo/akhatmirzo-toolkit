import { useState } from 'react';

/**
 * Qiymatning **oldingi (boshqa)** holatini qaytaradi; birinchi renderda `undefined`.
 * Qiymat o'zgarmasdan qayta render bo'lsa natija o'zgarmaydi (taqqoslash — `Object.is`).
 * @example
 * const prevPage = usePrevious(page);
 * const direction = prevPage !== undefined && page < prevPage ? 'orqaga' : 'oldinga';
 */
export function usePrevious<T>(value: T): T | undefined {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T | undefined>(undefined);
  if (!Object.is(current, value)) {
    // Render paytida holatni yangilash — React tavsiya qilgan "oldingi qiymat" usuli
    setPrevious(current);
    setCurrent(value);
  }
  return previous;
}
