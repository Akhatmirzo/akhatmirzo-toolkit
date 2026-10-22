'use client';

import { isValidEmail, parsePhone } from '@akhatmirzo/core';
import { useLocalStorage } from '@akhatmirzo/hooks';
import { useParams } from 'next/navigation';
import { useCallback, useSyncExternalStore } from 'react';
import { demoAccount, storageKeys, type Account } from './data';

/* ---------- Hisoblar ("server" o'rnida localStorage) ---------- */

export function useAccounts() {
  const [accounts, setAccounts, resetAccounts] = useLocalStorage<Account[]>(storageKeys.accounts, [
    demoAccount,
  ]);

  /** Telefon (9 raqam) yoki email bo'yicha qidiradi */
  const findAccount = useCallback(
    (login: string): Account | undefined => {
      const value = login.trim().toLowerCase();
      if (isValidEmail(value)) return accounts.find((a) => a.email.toLowerCase() === value);
      const digits = parsePhone(value).digits;
      return accounts.find((a) => a.phone === digits);
    },
    [accounts],
  );

  const addAccount = useCallback(
    (account: Account) =>
      setAccounts((list) => [...list.filter((a) => a.phone !== account.phone), account]),
    [setAccounts],
  );

  const updatePassword = useCallback(
    (phone: string, password: string) =>
      setAccounts((list) => list.map((a) => (a.phone === phone ? { ...a, password } : a))),
    [setAccounts],
  );

  return { accounts, findAccount, addAccount, updatePassword, resetAccounts };
}

/* ---------- Noto'g'ri parol urinishlari va bloklash ---------- */

export interface LockState {
  failed: number;
  /** Bloklash tugaydigan vaqt (ms) yoki null */
  until: number | null;
}

export function useLock() {
  return useLocalStorage<LockState>(storageKeys.lock, { failed: 0, until: null });
}

/* ---------- Tasdiqlashni kutayotgan kirish (sign-in → verify) ---------- */

export interface PendingSignIn {
  phone: string;
  firstName: string;
  lastName: string;
  remember: boolean;
  /** Kod tasdiqlangan vaqt (ISO) — sahifa yangilansa ham "Xush kelibsiz" ekrani qoladi */
  verifiedAt?: string;
}

export function usePendingSignIn() {
  return useLocalStorage<PendingSignIn | null>(storageKeys.pending, null);
}

/* ---------- Yordamchilar ---------- */

const noopSubscribe = () => () => {};

/**
 * Gidratatsiyadan keyin `true`. localStorage'dagi holat faqat mijozda ma'lum, shuning uchun
 * undan oldin Skeleton ko'rsatiladi (server va mijoz HTML'i mos kelishi uchun).
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Namuna ichidagi havola: `href('verify')` → `/uz/examples/auth/verify` */
export function useAuthHref() {
  const lang = String(useParams().lang ?? 'uz');
  return useCallback((path: string) => `/${lang}/examples/auth/${path}`, [lang]);
}
