'use client';

import { useLocalStorage } from '@akhatmirzo/hooks';
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import {
  seedBilling,
  seedEmployees,
  seedNotifications,
  seedProfile,
  seedSecurity,
  type BillingSettings,
  type Employee,
  type NotificationSettings,
  type Profile,
  type SecuritySettings,
} from './data';

/*
 * Ilova holati: har bir bo'lim localStorage'da alohida kalitda saqlanadi — sahifa yangilansa ham
 * o'zgarishlar yo'qolmaydi. Server yo'q, shuning uchun "saqlash" — shunchaki holatni yozish.
 */

type Setter<T> = (value: T | ((prev: T) => T)) => void;

interface WorkspaceState {
  employees: Employee[];
  setEmployees: Setter<Employee[]>;
  profile: Profile;
  setProfile: Setter<Profile>;
  notifications: NotificationSettings;
  setNotifications: Setter<NotificationSettings>;
  security: SecuritySettings;
  setSecurity: Setter<SecuritySettings>;
  billing: BillingSettings;
  setBilling: Setter<BillingSettings>;
  /** Barcha o'zgarishlarni o'chirib, boshlang'ich ma'lumotlarga qaytaradi */
  resetAll: () => void;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

const KEY = 'ak-example-workspace';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees, resetEmployees] = useLocalStorage(
    `${KEY}:employees`,
    seedEmployees,
  );
  const [profile, setProfile, resetProfile] = useLocalStorage(`${KEY}:profile`, seedProfile);
  const [notifications, setNotifications, resetNotifications] = useLocalStorage(
    `${KEY}:notifications`,
    seedNotifications,
  );
  const [security, setSecurity, resetSecurity] = useLocalStorage(`${KEY}:security`, seedSecurity);
  const [billing, setBilling, resetBilling] = useLocalStorage(`${KEY}:billing`, seedBilling);

  const resetAll = useCallback(() => {
    resetEmployees();
    resetProfile();
    resetNotifications();
    resetSecurity();
    resetBilling();
  }, [resetEmployees, resetProfile, resetNotifications, resetSecurity, resetBilling]);

  const value = useMemo(
    () => ({
      employees,
      setEmployees,
      profile,
      setProfile,
      notifications,
      setNotifications,
      security,
      setSecurity,
      billing,
      setBilling,
      resetAll,
    }),
    [
      employees,
      setEmployees,
      profile,
      setProfile,
      notifications,
      setNotifications,
      security,
      setSecurity,
      billing,
      setBilling,
      resetAll,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace faqat <WorkspaceProvider> ichida ishlaydi');
  return ctx;
}

/** Soxta tarmoq kechikishi — yuklanish holatlarini ko'rsatish uchun */
export function fakeRequest<T = void>(ms = 700, value?: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value as T), ms));
}

/** Yangi id: vaqt + tasodifiy qism (faqat hodisa ichida chaqiriladi) */
export function createId(prefix: string) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
