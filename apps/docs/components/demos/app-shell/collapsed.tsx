'use client';

import { AppShell, Avatar, Sidebar } from '@akhatmirzo/ui';
import { FileText, Home, PieChart, Store, TrendingUp, Wallet } from 'lucide-react';

export default function AppShellCollapsed() {
  return (
    <div className="h-[480px] w-full overflow-auto rounded-xl border border-border">
      <AppShell
        className="[--ak-app-shell-height:480px]"
        defaultSidebarOpen={false}
        shortcut={false}
      >
        <Sidebar>
          <Sidebar.Header>
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-5" aria-hidden="true" />
            </span>
            <span className="truncate text-sm font-bold">Chorsu Market</span>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.Item icon={<Home />} href="#home" active>
                Bosh sahifa
              </Sidebar.Item>
              <Sidebar.Item icon={<Wallet />} href="#payments" badge={3}>
                To'lovlar
              </Sidebar.Item>
            </Sidebar.Group>
            <Sidebar.Group label="Hisobotlar" collapsible>
              <Sidebar.Item icon={<TrendingUp />} href="#sales">
                Savdo
              </Sidebar.Item>
              <Sidebar.Item icon={<PieChart />} href="#categories">
                Toifalar
              </Sidebar.Item>
              <Sidebar.Item icon={<FileText />} href="#tax" disabled>
                Soliq (tez orada)
              </Sidebar.Item>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Footer>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name="Dilnoza Karimova" size="sm" />
              <span className="truncate text-sm font-medium">Dilnoza Karimova</span>
            </div>
          </Sidebar.Footer>
        </Sidebar>
        <AppShell.Main>
          <AppShell.Header>
            <AppShell.SidebarToggle />
            <span className="text-sm font-medium">Bosh sahifa</span>
          </AppShell.Header>
          <p className="m-0 p-6 text-sm text-text-muted">
            Yig'ilgan holatda faqat ikonkalar ko'rinadi — ustiga kelsangiz Tooltip chiqadi.
            "Hisobotlar" guruhi to'liq holatda yig'iladi.
          </p>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
