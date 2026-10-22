'use client';

import { useLocalStorage } from '@akhatmirzo/hooks';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  generateTransactions,
  initialCards,
  initialFavorites,
  newTxId,
  type BankCard,
  type Favorite,
  type Transaction,
} from './data';

/*
 * Ilova holati: kartalar, foydalanuvchi qilgan operatsiyalar va sevimli to'lovlar
 * localStorage'da saqlanadi — sahifa yangilansa ham o'zgarishlar yo'qolmaydi.
 * Seed'li tarix har safar qayta yaratiladi va foydalanuvchi operatsiyalari bilan qo'shiladi.
 */

interface PersistedState {
  cards: BankCard[];
  userTxs: Transaction[];
  favorites: Favorite[];
}

const STORAGE_KEY = 'akhatmirzo:bank-demo:v1';
const HIDE_KEY = 'akhatmirzo:bank-demo:hide-balance';

const initialState: PersistedState = {
  cards: initialCards,
  userTxs: [],
  favorites: initialFavorites,
};

export type NewTransaction = Omit<Transaction, 'id' | 'date'>;

interface BankContextValue {
  /** Birinchi yuklanish tugadimi (soxta kechikish — skeleton ko'rsatish uchun) */
  ready: boolean;
  cards: BankCard[];
  transactions: Transaction[];
  favorites: Favorite[];
  totalBalance: number;
  hideBalance: boolean;
  setHideBalance: (hide: boolean) => void;
  findCard: (id: string) => BankCard | undefined;
  /** Operatsiyani tarixga qo'shadi; muvaffaqiyatli chiqimda karta balansidan yechadi */
  addTransaction: (tx: NewTransaction) => Transaction;
  addCard: (card: BankCard) => void;
  updateCard: (id: string, patch: Partial<BankCard>) => void;
  removeCard: (id: string) => void;
  addFavorite: (fav: Omit<Favorite, 'id'>) => void;
  removeFavorite: (id: string) => void;
  reset: () => void;
}

const BankContext = createContext<BankContextValue | null>(null);

export function BankProvider({ children }: { children: ReactNode }) {
  const [state, setState, clearState] = useLocalStorage<PersistedState>(STORAGE_KEY, initialState);
  const [hideBalance, setHideBalance] = useLocalStorage(HIDE_KEY, false);
  const [seeded, setSeeded] = useState<Transaction[] | null>(null);

  // Sanalar "hozir"ga bog'liq — faqat brauzerda yaratamiz (SSR bilan mos kelishi uchun)
  useEffect(() => {
    const t = setTimeout(() => setSeeded(generateTransactions(new Date())), 700);
    return () => clearTimeout(t);
  }, []);

  const transactions = useMemo(
    () => (seeded ? [...state.userTxs, ...seeded] : []),
    [seeded, state.userTxs],
  );

  const findCard = useCallback((id: string) => state.cards.find((c) => c.id === id), [state.cards]);

  const addTransaction = useCallback(
    (input: NewTransaction) => {
      const tx: Transaction = { ...input, id: newTxId(), date: new Date().toISOString() };
      const spent = input.status === 'success' && input.amount < 0;
      setState((prev) => ({
        ...prev,
        userTxs: [tx, ...prev.userTxs],
        cards: prev.cards.map((c) =>
          c.id === input.cardId && (spent || input.amount > 0)
            ? { ...c, balance: c.balance + input.amount - (spent ? input.fee : 0) }
            : c,
        ),
      }));
      return tx;
    },
    [setState],
  );

  const value = useMemo<BankContextValue>(
    () => ({
      ready: seeded !== null,
      cards: state.cards,
      transactions,
      favorites: state.favorites,
      totalBalance: state.cards.reduce((sum, c) => sum + c.balance, 0),
      hideBalance,
      setHideBalance,
      findCard,
      addTransaction,
      addCard: (card) => setState((prev) => ({ ...prev, cards: [...prev.cards, card] })),
      updateCard: (id, patch) =>
        setState((prev) => ({
          ...prev,
          cards: prev.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCard: (id) =>
        setState((prev) => ({ ...prev, cards: prev.cards.filter((c) => c.id !== id) })),
      addFavorite: (fav) =>
        setState((prev) => ({
          ...prev,
          favorites: [...prev.favorites, { ...fav, id: `f${Date.now()}` }],
        })),
      removeFavorite: (id) =>
        setState((prev) => ({ ...prev, favorites: prev.favorites.filter((f) => f.id !== id) })),
      reset: () => {
        clearState();
        setHideBalance(false);
      },
    }),
    [
      seeded,
      state,
      transactions,
      hideBalance,
      setHideBalance,
      findCard,
      addTransaction,
      setState,
      clearState,
    ],
  );

  return <BankContext value={value}>{children}</BankContext>;
}

export function useBank() {
  const ctx = use(BankContext);
  if (!ctx) throw new Error('useBank faqat BankProvider ichida ishlaydi');
  return ctx;
}
