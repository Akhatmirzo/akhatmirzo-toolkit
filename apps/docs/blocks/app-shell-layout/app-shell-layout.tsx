'use client';

import { formatMoney } from '@akhatmirzo/core';
import {
  AppShell,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  DropdownMenu,
  IconButton,
  Input,
  Progress,
  Sidebar,
} from '@akhatmirzo/ui';
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronsUpDown,
  CircleHelp,
  House,
  LogOut,
  Megaphone,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Truck,
  User,
  Users,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

const MAIN_NAV: NavItem[] = [
  { id: 'home', label: 'Bosh sahifa', icon: <House /> },
  { id: 'orders', label: 'Buyurtmalar', icon: <ShoppingBag />, badge: 12 },
  { id: 'products', label: 'Mahsulotlar', icon: <Boxes /> },
  { id: 'customers', label: 'Mijozlar', icon: <Users /> },
  { id: 'delivery', label: 'Yetkazish', icon: <Truck />, badge: 3 },
];

const GROWTH_NAV: NavItem[] = [
  { id: 'reports', label: 'Hisobotlar', icon: <BarChart3 /> },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone /> },
];

const ACTIVITY = [
  { who: 'Dilnoza Yusupova', what: '#10482 buyurtmani berdi', when: '2 daqiqa oldin' },
  { who: 'Otabek Qodirov', what: "#10477 to'lovini Payme orqali qildi", when: '18 daqiqa oldin' },
  { who: 'Malika Rahimova', what: 'yangi sharh qoldirdi — 5 yulduz', when: '1 soat oldin' },
  { who: 'Jasur Karimov', what: '#10465 buyurtmani qaytardi', when: '3 soat oldin' },
];

const GOALS = [
  { label: 'Oylik savdo rejasi', value: 72 },
  { label: 'Yetkazish vaqtida', value: 94 },
  { label: "Ombor to'ldirish", value: 38 },
];

function UserMenu({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-56">
        <DropdownMenu.Label>akmal@chorsu.uz</DropdownMenu.Label>
        <DropdownMenu.Item icon={<User />}>Profil</DropdownMenu.Item>
        <DropdownMenu.Item icon={<Settings />}>Sozlamalar</DropdownMenu.Item>
        <DropdownMenu.Item icon={<CircleHelp />}>Yordam markazi</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<LogOut />} variant="danger">
          Chiqish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export default function AppShellLayoutBlock() {
  const [page, setPage] = useState('home');
  const current =
    [...MAIN_NAV, ...GROWTH_NAV].find((item) => item.id === page)?.label ?? 'Sozlamalar';

  const navItem = (item: NavItem) => (
    <Sidebar.Item
      key={item.id}
      icon={item.icon}
      badge={item.badge}
      active={page === item.id}
      onClick={() => setPage(item.id)}
    >
      {item.label}
    </Sidebar.Item>
  );

  return (
    <AppShell sidebarStorageKey="chorsu-sidebar">
      <Sidebar>
        <Sidebar.Header>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Store className="size-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-bold">Chorsu Market</span>
            <span className="truncate text-xs text-text-muted">Toshkent filiali</span>
          </span>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Group label="Do'kon">{MAIN_NAV.map(navItem)}</Sidebar.Group>
          <Sidebar.Group label="O'sish">{GROWTH_NAV.map(navItem)}</Sidebar.Group>
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
        <Sidebar.Footer>
          <UserMenu>
            <button
              type="button"
              className="focus-ring flex w-full items-center gap-2.5 rounded-lg p-1 text-left hover:bg-surface-muted"
            >
              <Avatar name="Akmal Karimov" size="sm" status="online" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">Akmal Karimov</span>
                <span className="truncate text-xs text-text-muted">Administrator</span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
            </button>
          </UserMenu>
        </Sidebar.Footer>
      </Sidebar>

      <AppShell.Main>
        <AppShell.Header>
          <AppShell.SidebarToggle />
          <Breadcrumb
            className="hidden min-w-0 sm:flex"
            items={[{ label: 'Chorsu Market', href: '#home' }, { label: current }]}
          />
          <div className="ml-auto flex items-center gap-2">
            <Input
              aria-label="Qidirish"
              placeholder="Qidirish…"
              leftIcon={<Search />}
              size="sm"
              className="hidden w-56 md:flex"
            />
            <span className="relative">
              <IconButton variant="ghost" aria-label="Bildirishnomalar: 3 ta yangi">
                <Bell />
              </IconButton>
              <span
                aria-hidden="true"
                className="absolute top-2 right-2 size-2 rounded-full bg-danger ring-2 ring-background"
              />
            </span>
            <UserMenu>
              <button type="button" className="focus-ring rounded-full" aria-label="Profil menyusi">
                <Avatar name="Akmal Karimov" size="sm" />
              </button>
            </UserMenu>
          </div>
        </AppShell.Header>

        {/* Sahifa kontenti — o'z kengligiga qarab moslashadi */}
        <div className="@container flex-1">
          <div className="flex flex-col gap-6 p-4 @3xl:p-8">
            <div className="flex flex-col gap-3 @xl:flex-row @xl:items-end @xl:justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="m-0 text-2xl font-bold tracking-tight">{current}</h1>
                <p className="m-0 text-sm text-text-muted">
                  Xush kelibsiz, Akmal! Bugun 22-oktabr, payshanba.
                </p>
              </div>
              <Button variant="primary" leftIcon={<Plus />}>
                Mahsulot qo&apos;shish
              </Button>
            </div>

            <div className="grid gap-4 @2xl:grid-cols-3">
              {[
                {
                  title: 'Bugungi tushum',
                  value: formatMoney(14_250_000),
                  note: '+12% kechagiga nisbatan',
                },
                { title: 'Yangi buyurtmalar', value: '86 ta', note: '12 tasi javob kutmoqda' },
                { title: 'Faol mijozlar', value: '2 340', note: 'Oxirgi 30 kunda' },
              ].map((stat) => (
                <Card key={stat.title} padding="sm" className="gap-1">
                  <span className="text-sm text-text-muted">{stat.title}</span>
                  <span className="text-2xl font-bold tracking-tight tabular-nums">
                    {stat.value}
                  </span>
                  <span className="text-xs text-text-muted">{stat.note}</span>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 @4xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <Card className="gap-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="m-0 text-base font-semibold">So&apos;nggi faoliyat</h2>
                  <Badge color="primary">Jonli</Badge>
                </div>
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {ACTIVITY.map((item) => (
                    <li key={item.what} className="flex items-start gap-3">
                      <Avatar name={item.who} size="sm" />
                      <div className="flex min-w-0 flex-col">
                        <span className="text-sm">
                          <span className="font-medium">{item.who}</span> {item.what}
                        </span>
                        <span className="text-xs text-text-muted">{item.when}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="gap-5">
                <h2 className="m-0 text-base font-semibold">Oylik maqsadlar</h2>
                {GOALS.map((goal) => (
                  <Progress
                    key={goal.label}
                    size="sm"
                    label={goal.label}
                    value={goal.value}
                    showValue
                    color={goal.value >= 90 ? 'success' : goal.value < 50 ? 'warning' : 'primary'}
                  />
                ))}
              </Card>
            </div>
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
