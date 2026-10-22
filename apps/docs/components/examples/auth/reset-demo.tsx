'use client';

import { useLocalStorage } from '@akhatmirzo/hooks';
import { Button, confirm, toast } from '@akhatmirzo/ui';
import { RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { storageKeys } from './data';
import { useAuthHref } from './store';

/** Brauzerda saqlangan barcha demo holatini (hisoblar, bloklash, qoralamalar) o'chiradi */
export function ResetDemoButton() {
  const router = useRouter();
  const href = useAuthHref();
  const removers = [
    useLocalStorage(storageKeys.accounts, null)[2],
    useLocalStorage(storageKeys.lock, null)[2],
    useLocalStorage(storageKeys.pending, null)[2],
    useLocalStorage(storageKeys.signUp, null)[2],
    useLocalStorage(storageKeys.forgot, null)[2],
    useLocalStorage(storageKeys.remembered, null)[2],
  ];

  const reset = async () => {
    const ok = await confirm({
      title: "Demo ma'lumotlarini tiklaysizmi?",
      description:
        "Ro'yxatdan o'tgan hisoblar, o'zgartirilgan parollar, bloklash va to'ldirilgan formalar o'chiriladi. Faqat demo hisob qoladi.",
      confirmText: 'Tiklash',
      cancelText: 'Bekor qilish',
      variant: 'danger',
    });
    if (!ok) return;
    removers.forEach((remove) => remove());
    toast.success("Ma'lumotlar tiklandi", { description: "Demo boshlang'ich holatiga qaytdi." });
    router.push(href('sign-in'));
  };

  return (
    <Button variant="ghost" size="sm" leftIcon={<RotateCcw />} onClick={reset}>
      Ma&apos;lumotlarni tiklash
    </Button>
  );
}
