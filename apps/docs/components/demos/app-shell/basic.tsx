'use client';

import { AppShell, Sidebar } from '@akhatmirzo/ui';
import { BarChart3, Box, Home, Settings, Store, Users } from 'lucide-react';
import { useState } from 'react';

const items = [
  { id: 'home', label: 'Bosh sahifa', icon: <Home /> },
  { id: 'orders', label: 'Buyurtmalar', icon: <Box />, badge: 12 },
  { id: 'customers', label: 'Mijozlar', icon: <Users /> },
  { id: 'reports', label: 'Hisobotlar', icon: <BarChart3 /> },
];

export default function AppShellBasic() {
  const [page, setPage] = useState('home');
  const current = items.find((i) => i.id === page)?.label ?? 'Sozlamalar';

  return (
    // Hujjat ichida cheklangan ramka; haqiqiy ilovada AppShell butun ekranni egallaydi
    <div className="h-[480px] w-full overflow-auto rounded-xl border border-border">
      <AppShell className="[--ak-app-shell-height:480px]" sidebarStorageKey="docs-app-shell">
        <Sidebar>
          <Sidebar.Header>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <span className="truncate text-sm font-bold">Chorsu Market</span>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group label="Do'kon">
              {items.map((item) => (
                <Sidebar.Item
                  key={item.id}
                  icon={item.icon}
                  badge={item.badge}
                  active={page === item.id}
                  onClick={() => setPage(item.id)}
                >
                  {item.label}
                </Sidebar.Item>
              ))}
            </Sidebar.Group>
            <Sidebar.Group label="Boshqaruv">
              <Sidebar.Item
                icon={<Settings />}
                active={page === 'settings'}
                onClick={() => setPage('settings')}
              >
                Sozlamalar
              </Sidebar.Item>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <AppShell.Main>
          <AppShell.Header>
            <AppShell.SidebarToggle />
            <span className="text-sm font-medium">{current}</span>
          </AppShell.Header>
          <div className="flex flex-col gap-3 p-6">
            <h2 className="m-0 text-xl font-semibold">{current}</h2>
            <p className="m-0 text-sm text-text-muted">
              Tugma yoki Ctrl/⌘ + B sidebar'ni yig'adi. Holat localStorage'da saqlanadi.
            </p>
          </div>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
