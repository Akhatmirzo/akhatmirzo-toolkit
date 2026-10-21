'use client';

import { Button, DropdownMenu, toast } from '@akhatmirzo/ui';
import { Archive, ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react';

export default function DropdownMenuBasic() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" rightIcon={<ChevronDown />}>
          Amallar
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          icon={<Pencil />}
          shortcut={['mod', 'E']}
          onSelect={() => toast('Tahrirlash')}
        >
          Tahrirlash
        </DropdownMenu.Item>
        <DropdownMenu.Item
          icon={<Copy />}
          shortcut={['mod', 'D']}
          onSelect={() => toast('Nusxa olindi')}
        >
          Nusxa olish
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Archive />} onSelect={() => toast('Arxivlandi')}>
          Arxivlash
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<Trash2 />} variant="danger" onSelect={() => toast("O'chirildi")}>
          O'chirish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
