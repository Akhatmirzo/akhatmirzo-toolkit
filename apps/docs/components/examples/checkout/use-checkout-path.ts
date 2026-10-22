'use client';

import { useParams } from 'next/navigation';
import { useCallback } from 'react';

/** Namuna ichidagi yo'l: `path('/cart')` → `/uz/examples/checkout/cart` */
export function useCheckoutPath() {
  const lang = String(useParams().lang ?? 'uz');
  return useCallback((sub = '') => `/${lang}/examples/checkout${sub}`, [lang]);
}
