'use client';

import { Tabs } from '@akhatmirzo/ui';

const months = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

export default function TabsScrollable() {
  return (
    <div className="w-full max-w-md">
      <Tabs defaultValue="Mart">
        <Tabs.List aria-label="Oylar">
          {months.map((m) => (
            <Tabs.Trigger key={m} value={m}>
              {m}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {months.map((m) => (
          <Tabs.Content key={m} value={m} className="text-text-muted">
            {m} oyi bo'yicha savdo hisoboti.
          </Tabs.Content>
        ))}
      </Tabs>
    </div>
  );
}
