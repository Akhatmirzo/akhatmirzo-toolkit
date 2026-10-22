'use client';

import { Button, Drawer, type DrawerSide } from '@akhatmirzo/ui';

const sides: { side: DrawerSide; label: string }[] = [
  { side: 'right', label: "O'ngdan" },
  { side: 'left', label: 'Chapdan' },
  { side: 'bottom', label: 'Pastdan' },
  { side: 'top', label: 'Tepadan' },
];

export default function DrawerSides() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sides.map(({ side, label }) => (
        <Drawer key={side}>
          <Drawer.Trigger asChild>
            <Button variant="outline">{label}</Button>
          </Drawer.Trigger>
          <Drawer.Content side={side} title={label} description={`side="${side}"`}>
            <p className="m-0 text-sm text-text-muted">
              Panel ekran chetidan siljib chiqadi. Pastdan chiqqanda tepada tutqich chizig'i bor.
            </p>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="primary">Yopish</Button>
              </Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
