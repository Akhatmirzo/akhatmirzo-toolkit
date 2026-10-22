'use client';

import { useScrollLock, useToggle } from '@akhatmirzo/hooks';
import { Badge, Button } from '@akhatmirzo/ui';

export default function HooksScrollLock() {
  const [locked, toggle] = useToggle(false);
  useScrollLock(locked);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant={locked ? 'primary' : 'outline'} onClick={toggle} aria-pressed={locked}>
        {locked ? 'Scroll qulfini ochish' : "Sahifa scroll'ini qulflash"}
      </Button>
      <Badge color={locked ? 'warning' : 'neutral'} dot>
        {locked ? "Sahifa qulflangan — g'ildirak bilan aylantirib ko'ring" : 'Sahifa erkin'}
      </Badge>
    </div>
  );
}
