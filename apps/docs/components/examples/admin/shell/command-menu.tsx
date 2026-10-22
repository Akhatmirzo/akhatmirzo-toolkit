'use client';

import { formatMoney, formatPhone } from '@akhatmirzo/core';
import { CommandPalette, type CommandPaletteGroup } from '@akhatmirzo/ui';
import { MoonStar, Plus, RotateCcw, ShoppingBag, UserRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { categoryLabel } from '../data';
import { CATEGORY_ICON, STATUS_META } from '../meta';
import { NAV_MAIN, NAV_SECONDARY, useAdminHref } from '../nav';
import { useAdmin } from '../store';
import { useResetDemo } from './user-menu';

/**
 * Ctrl+K / ⌘K — sahifalar, amallar va buyurtma/mahsulot/mijozlar bo'yicha qidiruv.
 * Docs saytining o'z qidiruvi ham Ctrl+K da tinglaydi, shuning uchun tugmani `capture`
 * bosqichida ushlab, hodisani to'xtatamiz va palitrani o'zimiz ochamiz.
 */
export function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const href = useAdminHref();
  const { orders, products, customers } = useAdmin();
  const { resolvedTheme, setTheme } = useTheme();
  const reset = useResetDemo();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [open, onOpenChange]);

  const groups = useMemo<CommandPaletteGroup[]>(
    () => [
      {
        heading: 'Sahifalar',
        items: [...NAV_MAIN, ...NAV_SECONDARY].map((item) => {
          const Icon = item.icon;
          return {
            id: `page:${item.path}`,
            label: item.label,
            icon: <Icon />,
            keywords: item.keywords,
            onSelect: () => router.push(href(item.path)),
          };
        }),
      },
      {
        heading: 'Amallar',
        items: [
          {
            id: 'action:new-product',
            label: "Mahsulot qo'shish",
            icon: <Plus />,
            keywords: ['yangi', 'tovar'],
            onSelect: () => router.push(`${href('products')}?new=1`),
          },
          {
            id: 'action:new-orders',
            label: 'Yangi buyurtmalar',
            icon: <ShoppingBag />,
            keywords: ['kutilmoqda'],
            onSelect: () => router.push(`${href('orders')}?status=new`),
          },
          {
            id: 'action:theme',
            label: resolvedTheme === 'dark' ? "Yorug' mavzu" : "Qorong'i mavzu",
            icon: <MoonStar />,
            keywords: ['dark', 'light', 'mavzu', 'tema'],
            onSelect: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
          },
          {
            id: 'action:reset',
            label: "Ma'lumotlarni tiklash",
            icon: <RotateCcw />,
            keywords: ['reset', 'demo'],
            onSelect: () => void reset(),
          },
        ],
      },
      {
        heading: 'Buyurtmalar',
        searchOnly: true,
        items: orders.map((o) => ({
          id: `order:${o.id}`,
          label: `#${o.id} — ${o.customerName}`,
          description: `${STATUS_META[o.status].label} · ${formatMoney(o.total)}`,
          icon: <ShoppingBag />,
          keywords: [o.id, o.phone, o.region],
          onSelect: () => router.push(`${href('orders')}?order=${o.id}`),
        })),
      },
      {
        heading: 'Mahsulotlar',
        searchOnly: true,
        items: products.map((p) => {
          const Icon = CATEGORY_ICON[p.category];
          return {
            id: `product:${p.id}`,
            label: p.name,
            description: `${categoryLabel(p.category)} · ${formatMoney(p.price)}`,
            icon: <Icon />,
            keywords: [p.sku],
            onSelect: () => router.push(`${href('products')}?edit=${p.id}`),
          };
        }),
      },
      {
        heading: 'Mijozlar',
        searchOnly: true,
        items: customers.map((c) => ({
          id: `customer:${c.id}`,
          label: c.name,
          description: `${formatPhone(c.phone)} · ${c.region}`,
          icon: <UserRound />,
          keywords: [c.phone, c.email],
          onSelect: () => router.push(`${href('customers')}?customer=${c.id}`),
        })),
      },
    ],
    [orders, products, customers, router, href, resolvedTheme, setTheme, reset],
  );

  return (
    <CommandPalette
      groups={groups}
      hotkey={false}
      open={open}
      onOpenChange={onOpenChange}
      placeholder="Sahifa, buyurtma, mahsulot yoki mijozni qidiring..."
      recentKey="ak-demo:admin:recent-commands"
    />
  );
}
