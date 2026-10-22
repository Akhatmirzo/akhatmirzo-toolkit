import { AppShell, Badge, Sidebar, useAppShell } from '@akhatmirzo/ui';
import { useState } from 'react';
import { Code, DemoPage, DemoSection } from '../demo';
import type { PageMeta } from '../pages';

export const meta: PageMeta = { title: 'AppShell', group: 'Layout', order: 1 };

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const nav = [
  {
    id: 'home',
    label: 'Bosh sahifa',
    d: 'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  },
  {
    id: 'orders',
    label: 'Buyurtmalar',
    d: 'M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
    badge: 12,
  },
  {
    id: 'customers',
    label: 'Mijozlar',
    d: 'M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  },
];

function State() {
  const { sidebarOpen, mobileOpen, collapsed } = useAppShell();
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>sidebarOpen: {String(sidebarOpen)}</Badge>
      <Badge>collapsed: {String(collapsed)}</Badge>
      <Badge>mobileOpen: {String(mobileOpen)}</Badge>
    </div>
  );
}

export default function Page() {
  const [page, setPage] = useState('home');
  return (
    <DemoPage
      title="AppShell + Sidebar"
      description={
        <>
          Admin qolipi. Desktop'da sidebar 256 ↔ 64px (<Code>Ctrl/⌘+B</Code>), holat{' '}
          <Code>localStorage</Code>'da; <Code>&lt; 1024px</Code> da Drawer. Bu yerda 520px ramka
          ichida.
        </>
      }
    >
      <DemoSection title="To'liq misol" className="p-0">
        <div className="h-[520px] overflow-auto rounded-xl">
          <AppShell className="[--ak-app-shell-height:520px]" sidebarStorageKey="pg-sidebar">
            <Sidebar>
              <Sidebar.Header>
                <span className="text-sm font-bold">Chorsu Market</span>
              </Sidebar.Header>
              <Sidebar.Content>
                <Sidebar.Group label="Do'kon">
                  {nav.map((n) => (
                    <Sidebar.Item
                      key={n.id}
                      icon={<Icon d={n.d} />}
                      badge={n.badge}
                      active={page === n.id}
                      onClick={() => setPage(n.id)}
                    >
                      {n.label}
                    </Sidebar.Item>
                  ))}
                </Sidebar.Group>
                <Sidebar.Group label="Hisobotlar" collapsible>
                  <Sidebar.Item
                    icon={<Icon d="M3 3v18h18M7 15l4-4 4 4 5-6" />}
                    onClick={() => setPage('savdo')}
                  >
                    Savdo
                  </Sidebar.Item>
                  <Sidebar.Item icon={<Icon d="M12 2v20M2 12h20" />} disabled>
                    Soliq
                  </Sidebar.Item>
                </Sidebar.Group>
              </Sidebar.Content>
              <Sidebar.Footer>
                <span className="truncate text-sm">Dilnoza Karimova</span>
              </Sidebar.Footer>
            </Sidebar>
            <AppShell.Main>
              <AppShell.Header>
                <AppShell.SidebarToggle />
                <span className="text-sm font-medium">
                  {nav.find((n) => n.id === page)?.label ?? 'Savdo'}
                </span>
              </AppShell.Header>
              <div className="flex flex-col gap-4 p-6">
                <State />
                {Array.from({ length: 12 }, (_, i) => (
                  <p key={i} className="m-0 text-sm text-text-muted">
                    Kontent qatori {i + 1} — header yopishqoq, sidebar joyida qoladi.
                  </p>
                ))}
              </div>
            </AppShell.Main>
          </AppShell>
        </div>
      </DemoSection>
    </DemoPage>
  );
}
