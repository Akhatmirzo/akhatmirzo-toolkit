'use client';

import { Button, DropdownMenu } from '@akhatmirzo/ui';
import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DropdownMenuStates() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownMenu>
        <DropdownMenu.Trigger>O'chirilgan elementlar</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item icon={<Pencil />}>Tahrirlash</DropdownMenu.Item>
          <DropdownMenu.Item icon={<Copy />} disabled>
            Nusxa olish (ruxsat yo'q)
          </DropdownMenu.Item>
          <DropdownMenu.Item icon={<Trash2 />} variant="danger" disabled>
            O'chirish (ruxsat yo'q)
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger>Boshqariladigan</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Birinchi</DropdownMenu.Item>
          <DropdownMenu.Item>Ikkinchi</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Tashqaridan ochish
      </Button>
    </div>
  );
}
