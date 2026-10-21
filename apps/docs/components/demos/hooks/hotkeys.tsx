'use client';

import { useHotkeys } from '@akhatmirzo/hooks';
import { Badge, Kbd } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function HooksHotkeys() {
  const [last, setLast] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const hit = (name: string) => {
    setLast(name);
    setCount((n) => n + 1);
  };

  useHotkeys('alt+k', () => hit('alt+k'));
  useHotkeys('?', () => hit('?'));
  // Bir nechta kombinatsiya — vergul bilan
  useHotkeys('g, alt+g', () => hit('g'));

  return (
    <div className="flex flex-col items-center gap-3 text-sm text-text">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Kbd keys={['Alt', 'K']} />
        <Kbd>?</Kbd>
        <Kbd>G</Kbd>
      </div>
      <p className="text-text-muted">Yuqoridagi tugmalardan birini bosing</p>
      {last && (
        <Badge color="primary">
          {last} · {count} marta
        </Badge>
      )}
    </div>
  );
}
