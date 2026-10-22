'use client';

import { Button, Drawer, type DrawerSize } from '@akhatmirzo/ui';

const sizes: { size: DrawerSize; px: string }[] = [
  { size: 'sm', px: '320px' },
  { size: 'md', px: '420px' },
  { size: 'lg', px: '560px' },
];

export default function DrawerSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map(({ size, px }) => (
        <Drawer key={size}>
          <Drawer.Trigger asChild>
            <Button variant="outline">
              {size} — {px}
            </Button>
          </Drawer.Trigger>
          <Drawer.Content size={size} title={`O'lcham: ${size}`} description={`Kenglik ${px}`}>
            <p className="m-0 text-sm text-text-muted">
              Chap va o'ngda o'lcham kenglikni, past va tepada balandlikni belgilaydi.
            </p>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
