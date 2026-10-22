'use client';

import { Badge, cn } from '@akhatmirzo/ui';
import { PackageX, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_MAIN, NAV_SECONDARY, useAdminHref, type NavItem } from '../nav';
import { useAdmin } from '../store';
import { UserMenu } from './user-menu';

/** Sidebar ichi: katta ekranda doimiy panel, telefonda Drawer ichida */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const href = useAdminHref();
  const pathname = usePathname();
  const { newOrdersCount, lowStockCount } = useAdmin();

  const isActive = (item: NavItem) =>
    item.path === '' ? pathname === href('') : pathname.startsWith(href(item.path));

  const badgeFor = (item: NavItem) =>
    item.path === 'orders' && newOrdersCount > 0 ? (
      <Badge size="sm" color="primary" variant="solid" aria-label={`${newOrdersCount} ta yangi`}>
        {newOrdersCount}
      </Badge>
    ) : null;

  const renderLink = (item: NavItem) => {
    const active = isActive(item);
    const Icon = item.icon;
    return (
      <li key={item.path}>
        <Link
          href={href(item.path)}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'focus-ring group flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-fast',
            active
              ? 'bg-primary-soft text-primary-soft-foreground'
              : 'text-text-subtle hover:bg-surface-muted hover:text-text',
          )}
        >
          <Icon
            aria-hidden="true"
            className={cn(
              'size-[18px] shrink-0',
              active ? 'text-primary-soft-foreground' : 'text-text-muted group-hover:text-text',
            )}
          />
          <span className="flex-1 truncate">{item.label}</span>
          {badgeFor(item)}
        </Link>
      </li>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <Link
        href={href('')}
        onClick={onNavigate}
        className="focus-ring mx-3 mt-4 flex items-center gap-3 rounded-lg p-2"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Store aria-hidden="true" className="size-5" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold">Chorsu Market</span>
          <span className="text-xs text-text-muted">Boshqaruv paneli</span>
        </span>
      </Link>

      <nav
        aria-label="Asosiy menyu"
        className="mt-6 flex flex-1 flex-col gap-6 overflow-y-auto px-3"
      >
        <div>
          <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-text-muted uppercase">
            Do&apos;kon
          </p>
          <ul className="flex flex-col gap-0.5">{NAV_MAIN.map(renderLink)}</ul>
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold tracking-wide text-text-muted uppercase">
            Boshqaruv
          </p>
          <ul className="flex flex-col gap-0.5">{NAV_SECONDARY.map(renderLink)}</ul>
        </div>

        {lowStockCount > 0 && (
          <Link
            href={`${href('products')}?stock=low`}
            onClick={onNavigate}
            className="focus-ring mt-auto mb-2 flex gap-3 rounded-xl bg-warning-soft p-3 text-warning-soft-foreground transition-opacity duration-fast hover:opacity-90"
          >
            <PackageX aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <span className="text-xs leading-relaxed">
              <span className="block text-sm font-semibold">Ombor ogohlantirishi</span>
              {lowStockCount} ta mahsulot kam qoldi yoki tugagan. Ko&apos;rish →
            </span>
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <UserMenu onNavigate={onNavigate} />
      </div>
    </div>
  );
}
