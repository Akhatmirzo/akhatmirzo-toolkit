'use client';

import { Button, CommandPalette, toast, type CommandPaletteItem } from '@akhatmirzo/ui';
import { Plus, User } from 'lucide-react';

const customers = [
  ['Akmal Ergashev', '+998 90 123 45 67'],
  ['Akbar Sobirov', '+998 93 555 12 34'],
  ['Kamola Akramova', '+998 97 700 00 11'],
  ['Nodira Ahmedova', '+998 91 444 22 33'],
] as const;

/** Server qidiruvini taqlid qiladi (700ms); yangi so'rov eskisini bekor qiladi */
function searchCustomers(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<CommandPaletteItem[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(
        customers
          .filter(([name]) => name.toLowerCase().includes(q))
          .map(([name, phone]) => ({
            id: `customer-${name}`,
            label: name,
            description: phone,
            icon: <User />,
            onSelect: () => toast(name),
          })),
      );
    }, 700);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Bekor qilindi', 'AbortError'));
    });
  });
}

export default function CommandPaletteServer() {
  return (
    <CommandPalette
      hotkey={false}
      recentKey="docs:command-palette:server"
      placeholder="Mijoz yoki buyruq qidirish..."
      onSearch={searchCustomers}
      labels={{ results: 'Mijozlar (serverdan)' }}
      groups={[
        {
          heading: 'Amallar',
          items: [
            { label: "Mijoz qo'shish", icon: <Plus />, onSelect: () => toast("Mijoz qo'shish") },
          ],
        },
      ]}
    >
      <Button variant="outline">Mijoz qidirish</Button>
    </CommandPalette>
  );
}
