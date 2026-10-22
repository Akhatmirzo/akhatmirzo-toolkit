'use client';

import { Kbd } from '@akhatmirzo/ui';

const items = [
  { label: 'Nusxa olish', keys: ['mod', 'C'] },
  { label: "Qo'yish", keys: ['mod', 'V'] },
  { label: 'Hammasini tanlash', keys: ['mod', 'A'] },
];

export default function KbdMenu() {
  return (
    <ul className="flex w-64 flex-col rounded-lg border border-border bg-surface p-1 text-sm text-text">
      {items.map((item) => (
        <li key={item.label} className="flex items-center justify-between rounded-md px-2 py-1.5">
          {item.label}
          <Kbd keys={item.keys} />
        </li>
      ))}
    </ul>
  );
}
