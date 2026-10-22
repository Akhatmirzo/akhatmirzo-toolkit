'use client';

import { timeAgo } from '@akhatmirzo/core';
import { Button, IconButton, Popover, Tooltip, cn } from '@akhatmirzo/ui';
import { Bell, BellOff, MessageSquareText, PackageX, ShoppingBag, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO_NOW, type AdminNotification } from '../data';
import { useAdminHref } from '../nav';
import { useAdmin } from '../store';

const KIND_ICON = {
  order: { icon: ShoppingBag, tone: 'bg-info-soft text-info-soft-foreground' },
  stock: { icon: PackageX, tone: 'bg-warning-soft text-warning-soft-foreground' },
  review: { icon: MessageSquareText, tone: 'bg-success-soft text-success-soft-foreground' },
  customer: { icon: UserPlus, tone: 'bg-primary-soft text-primary-soft-foreground' },
} satisfies Record<AdminNotification['kind'], unknown>;

export function Notifications() {
  const { notifications, markNotificationsRead } = useAdmin();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const href = useAdminHref();
  const unread = notifications.filter((n) => !n.read).length;

  const openItem = (n: AdminNotification) => {
    markNotificationsRead([n.id]);
    setOpen(false);
    if (n.href) router.push(`${href()}/${n.href}`);
  };

  const label = unread ? `Bildirishnomalar, ${unread} ta o'qilmagan` : 'Bildirishnomalar';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip content="Bildirishnomalar">
        <Popover.Trigger asChild>
          <IconButton variant="ghost" aria-label={label} className="relative">
            <Bell aria-hidden="true" />
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] leading-4 font-bold text-danger-foreground ring-2 ring-background"
              >
                {unread}
              </span>
            )}
          </IconButton>
        </Popover.Trigger>
      </Tooltip>
      <Popover.Content align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Bildirishnomalar</h2>
          <Button
            size="sm"
            variant="link"
            disabled={unread === 0}
            onClick={() => markNotificationsRead()}
          >
            Hammasini o&apos;qildi deb belgilash
          </Button>
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-text-muted">
            <BellOff aria-hidden="true" className="size-6" />
            <p className="text-sm">Bildirishnomalar yo&apos;q</p>
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto p-1.5">
            {notifications.map((n) => {
              const { icon: Icon, tone } = KIND_ICON[n.kind];
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className="focus-ring flex w-full gap-3 rounded-lg p-2.5 text-left transition-colors duration-fast hover:bg-surface-muted"
                  >
                    <span
                      className={cn('grid size-9 shrink-0 place-items-center rounded-full', tone)}
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className={cn('text-sm', n.read ? 'font-medium' : 'font-semibold')}>
                        {n.title}
                      </span>
                      <span className="truncate text-xs text-text-muted">{n.description}</span>
                      <span className="text-xs text-text-faint">{timeAgo(n.at, DEMO_NOW)}</span>
                    </span>
                    {!n.read && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">O&apos;qilmagan</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Popover.Content>
    </Popover>
  );
}
