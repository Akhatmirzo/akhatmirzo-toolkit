'use client';

import { AppShell, Button, Sidebar, useAppShell } from '@akhatmirzo/ui';
import { Home, Inbox } from 'lucide-react';

function Status() {
  const { sidebarOpen, setSidebarOpen, collapsed } = useAppShell();
  return (
    <div className="flex flex-col items-start gap-3 p-6 text-sm">
      <p className="m-0 text-text-muted">
        Holat: <b className="text-text">{collapsed ? "yig'ilgan" : "to'liq"}</b>
      </p>
      <Button size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {collapsed ? 'Yoyish' : "Yig'ish"}
      </Button>
    </div>
  );
}

export default function AppShellUseAppShell() {
  return (
    <div className="h-[360px] w-full overflow-auto rounded-xl border border-border">
      <AppShell className="[--ak-app-shell-height:360px]" shortcut={false}>
        <Sidebar width={220}>
          <Sidebar.Content>
            <Sidebar.Group label="Pochta">
              <Sidebar.Item icon={<Inbox />} href="#inbox" badge={4} active>
                Kiruvchi
              </Sidebar.Item>
              <Sidebar.Item icon={<Home />} href="#home">
                Bosh sahifa
              </Sidebar.Item>
            </Sidebar.Group>
          </Sidebar.Content>
        </Sidebar>
        <AppShell.Main>
          <AppShell.Header>
            <AppShell.SidebarToggle />
          </AppShell.Header>
          <Status />
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
