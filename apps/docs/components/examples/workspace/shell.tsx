'use client';

import { Avatar, Badge, Button, Drawer, IconButton, confirm, toast } from '@akhatmirzo/ui';
import { Bell, CreditCard, Menu, RotateCcw, ShieldCheck, UserRound, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, type MouseEvent, type ReactNode } from 'react';
import { company, plans } from './data';
import { WorkspaceProvider, useWorkspace } from './store';
import { UnsavedProvider, useUnsavedGuard } from './unsaved';

/** Ilova qobig'i: chapda sidebar (telefonda — Drawer), o'ngda sahifa kontenti */
export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <UnsavedProvider>
        <ShellLayout>{children}</ShellLayout>
      </UnsavedProvider>
    </WorkspaceProvider>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

function useNav() {
  const lang = String(useParams().lang ?? 'uz');
  const base = `/${lang}/examples/workspace`;
  const team: NavItem[] = [{ href: base, label: 'Xodimlar', icon: <Users /> }];
  const settings: NavItem[] = [
    { href: `${base}/profile`, label: 'Profil', icon: <UserRound /> },
    { href: `${base}/notifications`, label: 'Bildirishnomalar', icon: <Bell /> },
    { href: `${base}/security`, label: 'Xavfsizlik', icon: <ShieldCheck /> },
    { href: `${base}/billing`, label: "Tarif va to'lov", icon: <CreditCard /> },
  ];
  return { team, settings, all: [...team, ...settings] };
}

function ShellLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const nav = useNav();
  const current = nav.all.find((item) => item.href === pathname) ?? nav.all[0];

  return (
    <div className="flex flex-1">
      {/* Katta ekran: doimiy sidebar */}
      <aside className="sticky top-11 hidden h-[calc(100dvh-44px)] w-64 shrink-0 border-r border-border bg-surface lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Telefon/planshet: menyu tugmasi + joriy bo'lim */}
        <div className="sticky top-11 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface/90 px-3 backdrop-blur lg:hidden">
          <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
            <Drawer.Trigger asChild>
              <IconButton variant="ghost" aria-label="Menyuni ochish">
                <Menu aria-hidden="true" />
              </IconButton>
            </Drawer.Trigger>
            <Drawer.Content side="left" size="sm" title="Menyu" hideTitle className="p-0">
              <SidebarContent onNavigate={() => setMenuOpen(false)} />
            </Drawer.Content>
          </Drawer>
          <span className="truncate text-sm font-semibold">{current?.label}</span>
          <MobileUser />
        </div>

        <main id="workspace-main" className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileUser() {
  const { profile } = useWorkspace();
  return <Avatar size="sm" name={profile.name} src={profile.avatar} className="ml-auto" />;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { employees, profile, billing, resetAll } = useWorkspace();
  const nav = useNav();
  const plan = plans.find((p) => p.id === billing.plan);
  const activeCount = employees.filter((e) => e.status !== 'left').length;

  const reset = async () => {
    const ok = await confirm({
      title: "Ma'lumotlarni tiklaysizmi?",
      description:
        "Xodimlar, profil va barcha sozlamalar boshlang'ich namuna holatiga qaytadi. Kiritgan o'zgarishlaringiz o'chadi.",
      confirmText: 'Tiklash',
      variant: 'danger',
    });
    if (!ok) return;
    resetAll();
    onNavigate?.();
    toast.success("Ma'lumotlar tiklandi", { description: "Namuna boshlang'ich holatda." });
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-xl bg-primary text-base font-bold text-primary-foreground"
        >
          B
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{company.name}</p>
          <p className="truncate text-xs text-text-muted">{plan?.name} tarifi</p>
        </div>
      </div>

      <nav
        aria-label="Ilova menyusi"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-2"
      >
        <NavGroup title="Jamoa" items={nav.team} onNavigate={onNavigate} badge={activeCount} />
        <NavGroup title="Sozlamalar" items={nav.settings} onNavigate={onNavigate} />
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <Avatar size="sm" name={profile.name} src={profile.avatar} status="online" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile.name}</p>
            <p className="truncate text-xs text-text-muted">{profile.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<RotateCcw aria-hidden="true" />}
          className="justify-start"
          onClick={reset}
        >
          Ma&apos;lumotlarni tiklash
        </Button>
      </div>
    </div>
  );
}

function NavGroup({
  title,
  items,
  badge,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  badge?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const guard = useUnsavedGuard();

  const go = async (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    // Yangi tab (Ctrl/⌘ + bosish) — brauzerning o'z ishi
    if (e.metaKey || e.ctrlKey || e.shiftKey || href === pathname) return;
    e.preventDefault();
    if (!(await guard.confirmLeave())) return;
    onNavigate?.();
    router.push(href);
  };

  return (
    <div>
      <p className="px-3 pb-1.5 text-xs font-medium tracking-wide text-text-faint uppercase">
        {title}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item, i) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => go(e, item.href)}
                className={
                  'focus-ring flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-fast [&_svg]:size-4.5 [&_svg]:shrink-0 ' +
                  (active
                    ? 'bg-primary-soft text-primary-soft-foreground'
                    : 'text-text-subtle hover:bg-surface-muted hover:text-text')
                }
              >
                {item.icon}
                <span className="flex-1 truncate">{item.label}</span>
                {badge !== undefined && i === 0 && (
                  <Badge size="sm" color={active ? 'primary' : 'neutral'}>
                    {badge}
                  </Badge>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
