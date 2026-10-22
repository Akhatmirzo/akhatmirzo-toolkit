'use client';

import { Avatar, DropdownMenu, confirm, toast } from '@akhatmirzo/ui';
import { ChevronsUpDown, LogOut, RotateCcw, Settings, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAdminHref } from '../nav';
import { useAdmin } from '../store';

export const CURRENT_USER = {
  name: 'Aziza Karimova',
  email: 'aziza@chorsumarket.uz',
  role: 'Administrator',
};

/** "Ma'lumotlarni tiklash" — tasdiqlash so'raladi, keyin hamma narsa boshlang'ich holatga qaytadi */
export function useResetDemo() {
  const { resetAll } = useAdmin();
  return useCallback(async () => {
    const ok = await confirm({
      title: "Ma'lumotlarni tiklaysizmi?",
      description:
        "Barcha o'zgarishlar (buyurtma holatlari, mahsulotlar, sozlamalar) o'chadi va demo boshlang'ich holatga qaytadi.",
      confirmText: 'Tiklash',
      variant: 'danger',
    });
    if (!ok) return;
    resetAll();
    toast.success("Ma'lumotlar tiklandi", { description: "Demo boshlang'ich holatda." });
  }, [resetAll]);
}

export function UserMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const href = useAdminHref();
  const reset = useResetDemo();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="focus-ring flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors duration-fast hover:bg-surface-muted"
        >
          <Avatar name={CURRENT_USER.name} size="sm" status="online" />
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold">{CURRENT_USER.name}</span>
            <span className="truncate text-xs text-text-muted">{CURRENT_USER.role}</span>
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-4 text-text-muted" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="top" align="start" className="w-60">
        <DropdownMenu.Label>
          <span className="block font-semibold text-text">{CURRENT_USER.name}</span>
          <span className="block font-normal">{CURRENT_USER.email}</span>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          icon={<UserRound />}
          onSelect={() => toast.info("Profil sahifasi bu demoda yo'q")}
        >
          Profil
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Settings />}
          onSelect={() => {
            onNavigate?.();
            router.push(href('settings'));
          }}
        >
          Sozlamalar
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<RotateCcw />} onSelect={reset}>
          Ma&apos;lumotlarni tiklash
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          variant="danger"
          icon={<LogOut />}
          onSelect={() => toast("Demo rejimida chiqish o'chirilgan")}
        >
          Chiqish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
