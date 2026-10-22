'use client';

import { detectCardBrand } from '@akhatmirzo/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  hashString,
  maskCard,
  recipientName,
  withLuhn,
  type BankCard,
  type CardBrand,
} from '../data';

export interface Recipient {
  name: string;
  brand: CardBrand | null;
  /** Ko'rsatish uchun yashirilgan karta raqami */
  masked: string;
  /** O'z kartasiga o'tkazma bo'lsa — uning id'si */
  ownCardId?: string;
}

export type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; recipient: Recipient }
  | { status: 'error'; message: string };

/** Karta raqami bo'yicha qabul qiluvchi (o'z kartalari ham tekshiriladi) */
export function recipientByCard(number: string, ownCards: BankCard[]): Recipient | string {
  const own = ownCards.find((c) => c.number === number);
  if (own) {
    return {
      name: `${own.name} (o'zingiz)`,
      brand: own.brand,
      masked: maskCard(number),
      ownCardId: own.id,
    };
  }
  const brand = detectCardBrand(number);
  if (!brand || brand === 'mastercard')
    return 'Karta topilmadi. Raqamni tekshirib, qayta kiriting.';
  return { name: recipientName(number), brand, masked: maskCard(number) };
}

/** Telefon raqami bo'yicha: raqamga ulangan asosiy karta */
export function recipientByPhone(phone: string): Recipient | string {
  // Demo: "00" bilan tugagan raqamlarga karta ulanmagan
  if (phone.endsWith('00'))
    return "Bu raqamga bank kartasi ulanmagan. Karta raqami orqali o'tkazing.";
  const h = hashString(phone);
  const brand: CardBrand = h % 2 ? 'humo' : 'uzcard';
  const number = withLuhn(
    `${brand === 'humo' ? '9860' : '8600'}${String(h).padStart(11, '0').slice(0, 11)}`,
  );
  return { name: recipientName(phone), brand, masked: maskCard(number) };
}

/**
 * Soxta "bank so'rovi": natija 700–900 ms kechikish bilan keladi. Eski so'rov natijasi
 * yangisini bosib ketmasligi uchun har chaqiriqda oldingi taymer bekor qilinadi.
 */
export function useRecipientLookup(initial: LookupState = { status: 'idle' }) {
  const [state, setState] = useState<LookupState>(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const run = useCallback(
    (resolve: () => Recipient | string) => {
      cancel();
      setState({ status: 'loading' });
      timer.current = setTimeout(
        () => {
          const result = resolve();
          setState(
            typeof result === 'string'
              ? { status: 'error', message: result }
              : { status: 'found', recipient: result },
          );
        },
        700 + Math.random() * 200,
      );
    },
    [cancel],
  );

  const reset = useCallback(
    (next: LookupState = { status: 'idle' }) => {
      cancel();
      setState(next);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { state, run, reset };
}
