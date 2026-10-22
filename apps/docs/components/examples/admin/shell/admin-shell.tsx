'use client';

import { Drawer, IconButton, Kbd, Tooltip } from '@akhatmirzo/ui';
import { Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { ExampleBar } from '../../shared/example-bar';
import { AdminProvider } from '../store';
import { CommandMenu } from './command-menu';
import { Notifications } from './notifications';
import { SidebarContent } from './sidebar';

const subscribe = () => () => {};

/**
 * Admin ilovasining qobig'i: yuqorida ExampleBar, chapda sidebar (telefonda — Drawer),
 * tepada header (qidiruv, bildirishnomalar, mavzu). Sahifalar `children` sifatida keladi.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <ShellLayout>{children}</ShellLayout>
    </AdminProvider>
  );
}

function ShellLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  // Sahifa almashganda mobil menyu yopiladi (render paytida — effektsiz)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      <a
        href="#admin-main"
        className="focus-ring sr-only z-50 rounded-lg bg-surface px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Asosiy kontentga o&apos;tish
      </a>
      <ExampleBar slug="admin" />
      <div className="flex flex-1">
        <aside className="sticky top-11 hidden h-[calc(100dvh-2.75rem)] w-64 shrink-0 border-r border-border bg-surface lg:block">
          <SidebarContent />
        </aside>

        <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
          <Drawer.Content side="left" size="sm" title="Menyu" hideTitle className="p-0">
            <SidebarContent onNavigate={() => setMenuOpen(false)} />
          </Drawer.Content>
        </Drawer>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-11 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
            <IconButton
              variant="ghost"
              aria-label="Menyuni ochish"
              className="-ml-2 lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
            </IconButton>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Qidirish (Ctrl+K)"
              className="focus-ring flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-text-muted shadow-xs transition-colors duration-fast hover:border-border-strong sm:max-w-sm"
            >
              <Search aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">Qidirish...</span>
              <Kbd keys={['mod', 'K']} className="ml-auto hidden sm:inline-flex" />
            </button>

            <div className="ml-auto flex items-center gap-1">
              <Notifications />
              <ThemeToggle />
            </div>
          </header>

          <main
            id="admin-main"
            tabIndex={-1}
            className="flex-1 px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8"
          >
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === 'dark';
  const label = dark ? "Yorug' mavzu" : "Qorong'i mavzu";
  return (
    <Tooltip content={label}>
      <IconButton
        variant="ghost"
        aria-label={label}
        onClick={() => setTheme(dark ? 'light' : 'dark')}
      >
        {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </IconButton>
    </Tooltip>
  );
}
