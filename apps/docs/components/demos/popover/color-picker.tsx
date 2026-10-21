'use client';

import { Button, Popover } from '@akhatmirzo/ui';
import { useState } from 'react';

const colors = [
  { name: 'Asosiy', className: 'bg-primary' },
  { name: 'Yashil', className: 'bg-success' },
  { name: 'Sariq', className: 'bg-warning' },
  { name: 'Qizil', className: 'bg-danger' },
  { name: "Ko'k", className: 'bg-info' },
];

export default function PopoverColorPicker() {
  const [color, setColor] = useState(colors[0]!);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          leftIcon={<span className={`size-3 rounded-full ${color.className}`} />}
        >
          Teg rangi
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-auto" aria-label="Rang tanlash">
        <div className="flex gap-2">
          {colors.map((c) => (
            <Popover.Close key={c.name} asChild>
              <button
                type="button"
                aria-label={c.name}
                aria-pressed={c.name === color.name}
                onClick={() => setColor(c)}
                className={`focus-ring size-7 cursor-pointer rounded-full border-2 border-surface-raised ${c.className} aria-pressed:ring-2 aria-pressed:ring-primary`}
              />
            </Popover.Close>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
}
