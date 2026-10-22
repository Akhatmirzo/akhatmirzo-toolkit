'use client';

import { Button, CommandPalette, Kbd, toast, type CommandPaletteGroup } from '@akhatmirzo/ui';
import {
  ChartColumn,
  FileSpreadsheet,
  House,
  Package,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users,
} from 'lucide-react';

const run = (label: string) => () => toast(`"${label}" bajarildi`);

const groups: CommandPaletteGroup[] = [
  {
    heading: 'Sahifalar',
    items: [
      { label: 'Bosh sahifa', icon: <House />, onSelect: run('Bosh sahifa') },
      {
        label: 'Buyurtmalar',
        icon: <Package />,
        keywords: ['zakaz', 'savdo'],
        onSelect: run('Buyurtmalar'),
      },
      { label: 'Mijozlar', icon: <Users />, onSelect: run('Mijozlar') },
      {
        label: 'Hisobotlar',
        icon: <ChartColumn />,
        keywords: ['statistika'],
        onSelect: run('Hisobotlar'),
      },
      {
        label: 'Sozlamalar',
        icon: <Settings />,
        shortcut: ['mod', ','],
        onSelect: run('Sozlamalar'),
      },
    ],
  },
  {
    heading: 'Amallar',
    items: [
      {
        label: 'Yangi buyurtma',
        icon: <Plus />,
        shortcut: ['mod', 'N'],
        onSelect: run('Yangi buyurtma'),
      },
      { label: "Mijoz qo'shish", icon: <UserPlus />, onSelect: run("Mijoz qo'shish") },
      {
        label: 'Eksport (Excel)',
        icon: <FileSpreadsheet />,
        keywords: ['xlsx'],
        onSelect: run('Eksport'),
      },
    ],
  },
];

export default function CommandPaletteBasic() {
  return (
    // Docs saytida Ctrl+K qidiruvga band, shuning uchun bu yerda mod+J
    <CommandPalette groups={groups} hotkey="mod+j">
      <Button variant="outline" leftIcon={<Search />} className="min-w-64 justify-start">
        <span className="flex-1 text-left text-text-muted">Qidirish...</span>
        <Kbd keys={['mod', 'J']} />
      </Button>
    </CommandPalette>
  );
}
