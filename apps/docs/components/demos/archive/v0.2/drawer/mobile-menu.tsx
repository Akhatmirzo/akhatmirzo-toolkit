'use client';

import { Button, Drawer } from '@akhatmirzo/ui';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const items = ['Bosh sahifa', 'Buyurtmalar', 'Mahsulotlar', 'Mijozlar', 'Hisobotlar'];

export default function DrawerMobileMenu() {
  const [active, setActive] = useState('Buyurtmalar');

  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button variant="ghost" leftIcon={<Menu />}>
          Menyu
        </Button>
      </Drawer.Trigger>
      <Drawer.Content
        side="left"
        size="sm"
        title="Menyu"
        hideTitle
        labels={{ close: 'Menyuni yopish' }}
      >
        <nav aria-label="Asosiy menyu" className="-mx-2 flex flex-col gap-1">
          {items.map((item) => (
            <Drawer.Close asChild key={item}>
              <button
                type="button"
                aria-current={item === active ? 'page' : undefined}
                onClick={() => setActive(item)}
                className="focus-ring flex h-10 cursor-pointer items-center rounded-lg border-0 bg-transparent px-3 text-left text-sm font-medium text-text hover:bg-surface-muted aria-[current=page]:bg-primary-soft aria-[current=page]:text-primary-soft-foreground"
              >
                {item}
              </button>
            </Drawer.Close>
          ))}
        </nav>
      </Drawer.Content>
    </Drawer>
  );
}
