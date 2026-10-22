'use client';

import { Button, CommandPalette, toast, type CommandPaletteGroup } from '@akhatmirzo/ui';
import { Globe, Moon, Sun, User } from 'lucide-react';

const customers = ['Aziza Karimova', 'Bobur Toshmatov', "G'ayrat Usmonov", 'Malika Yusupova'];

const groups: CommandPaletteGroup[] = [
  {
    heading: 'Sozlamalar',
    items: [
      {
        label: 'Mavzuni almashtirish',
        icon: <Moon />,
        keywords: ['tungi rejim', 'dark'],
        page: {
          title: 'Mavzu',
          placeholder: 'Mavzu tanlang...',
          groups: [
            {
              heading: 'Mavzu',
              items: [
                {
                  id: 'theme-light',
                  label: "Yorug'",
                  icon: <Sun />,
                  onSelect: () => toast("Yorug' mavzu"),
                },
                {
                  id: 'theme-dark',
                  label: "Qorong'i",
                  icon: <Moon />,
                  onSelect: () => toast("Qorong'i mavzu"),
                },
              ],
            },
          ],
        },
      },
      {
        label: 'Tilni almashtirish',
        icon: <Globe />,
        page: {
          title: 'Til',
          groups: [
            {
              heading: 'Til',
              items: [
                { id: 'lang-uz', label: "O'zbekcha", onSelect: () => toast("O'zbekcha") },
                { id: 'lang-en', label: 'English', disabled: true },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    heading: 'Mijozlar',
    searchOnly: true,
    items: customers.map((name) => ({ label: name, icon: <User />, onSelect: () => toast(name) })),
  },
];

export default function CommandPalettePages() {
  return (
    <CommandPalette groups={groups} hotkey={false} recent={false}>
      <Button variant="soft">Sozlamalarni ochish</Button>
    </CommandPalette>
  );
}
