'use client';

import { formatPhone } from '@akhatmirzo/core';
import { Avatar, Button, cn, confirm, Drawer, IconButton, Skeleton, toast } from '@akhatmirzo/ui';
import {
  ArrowLeftRight,
  ChartPie,
  CreditCard,
  History,
  House,
  Landmark,
  Menu,
  ReceiptText,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useBank } from './bank-store';
import { DEMO_USER } from './data';
import { useBankHref } from './ui';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Telefondagi pastki panelda ko'rinadimi */
  tab: boolean;
}

const nav: NavItem[] = [
  { path: '', label: 'Asosiy', icon: House, tab: true },
  { path: '/transfer', label: "O'tkazma", icon: ArrowLeftRight, tab: true },
  { path: '/payments', label: "To'lovlar", icon: ReceiptText, tab: true },
  { path: '/history', label: 'Tarix', icon: History, tab: true },
  { path: '/analytics', label: 'Tahlil', icon: ChartPie, tab: true },
  { path: '/cards', label: 'Kartalar', icon: CreditCard, tab: false },
];

function useActive() {
  const pathname = usePathname();
  const href = useBankHref();
  return (item: NavItem) =>
    item.path === '' ? pathname === href('') : pathname.startsWith(href(item.path));
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Landmark aria-hidden="true" className="size-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-base font-bold tracking-tight text-text">Mirzo Bank</span>
        <span className="text-xs text-text-muted">Demo ilova</span>
      </span>
    </span>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const href = useBankHref();
  const isActive = useActive();
  return (
    <ul className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = isActive(item);
        return (
          <li key={item.path}>
            <Link
              href={href(item.path)}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'focus-ring flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-fast',
                active
                  ? 'bg-primary-soft text-primary-soft-foreground'
                  : 'text-text-subtle hover:bg-surface-muted hover:text-text',
              )}
            >
              <item.icon aria-hidden="true" className="size-[18px]" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UserBlock({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <Avatar name={DEMO_USER.name} size="md" status="online" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text">{DEMO_USER.name}</p>
          <p className="truncate text-xs text-text-muted tabular-nums">
            {formatPhone(DEMO_USER.phone)}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" leftIcon={<RotateCcw />} onClick={onReset}>
        Ma&apos;lumotlarni tiklash
      </Button>
    </div>
  );
}

function BottomTabs() {
  const href = useBankHref();
  const isActive = useActive();
  return (
    <nav
      aria-label="Asosiy bo'limlar"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {nav
          .filter((item) => item.tab)
          .map((item) => {
            const active = isActive(item);
            return (
              <li key={item.path}>
                <Link
                  href={href(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'focus-ring flex h-16 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors duration-fast',
                    active ? 'text-primary-soft-foreground' : 'text-text-muted hover:text-text',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-base',
                      active && 'bg-primary-soft',
                    )}
                  >
                    <item.icon aria-hidden="true" className="size-5" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

/**
 * Telefon/planshetda pastki tab paneli toast'larni yopib qo'ymasligi uchun Toaster viewport'ini
 * panel ustiga ko'taradi. Faqat bank qobig'i ochiq turganda amal qiladi.
 */
const toastOffsetCss = `@media (max-width: 1023.98px) {
  ol[data-position^='bottom'] { bottom: calc(env(safe-area-inset-bottom) + 4.75rem); }
}`;

/** Birinchi yuklanishdagi skeleton (soxta kechikish paytida) */
function ShellSkeleton() {
  return (
    <div role="status" aria-label="Yuklanmoqda" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="aspect-[1.586] rounded-2xl" />
        <Skeleton className="hidden aspect-[1.586] rounded-2xl sm:block" />
        <Skeleton className="hidden aspect-[1.586] rounded-2xl xl:block" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton variant="circle" className="size-10" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Ilova qobig'i: desktop'da chap panel + markazlashgan kontent, telefonda yuqori sarlavha,
 * menyu (Drawer) va pastki tab navigatsiya.
 */
export function BankShell({ children }: { children: ReactNode }) {
  const { ready, reset } = useBank();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleReset = async () => {
    setMenuOpen(false);
    const ok = await confirm({
      title: "Ma'lumotlarni tiklaysizmi?",
      description:
        "Kartalar, balanslar, siz qilgan o'tkazma va to'lovlar hamda sevimlilar boshlang'ich holatga qaytadi.",
      confirmText: 'Tiklash',
      variant: 'danger',
    });
    if (!ok) return;
    reset();
    toast.success("Ma'lumotlar tiklandi", { description: "Demo boshlang'ich holatda." });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 pt-4 pb-28 sm:px-6 lg:pt-8 lg:pb-12">
      <aside
        aria-label="Bank menyusi"
        className="sticky top-[4.75rem] hidden h-[calc(100dvh-6rem)] w-60 shrink-0 flex-col gap-6 lg:flex"
      >
        <Logo />
        <nav aria-label="Bo'limlar" className="flex-1">
          <NavLinks />
        </nav>
        <UserBlock onReset={handleReset} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {/* Telefon va planshet sarlavhasi */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            <Avatar name={DEMO_USER.name} size="sm" />
            <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
              <Drawer.Trigger asChild>
                <IconButton variant="ghost" aria-label="Menyuni ochish">
                  <Menu aria-hidden="true" />
                </IconButton>
              </Drawer.Trigger>
              <Drawer.Content side="left" size="sm" title="Mirzo Bank" className="gap-6">
                <nav aria-label="Bo'limlar" className="flex-1">
                  <NavLinks onNavigate={() => setMenuOpen(false)} />
                </nav>
                <UserBlock onReset={handleReset} />
              </Drawer.Content>
            </Drawer>
          </div>
        </div>

        <main className="flex min-w-0 flex-1 flex-col">{ready ? children : <ShellSkeleton />}</main>
      </div>

      <BottomTabs />
      <style>{toastOffsetCss}</style>
    </div>
  );
}
