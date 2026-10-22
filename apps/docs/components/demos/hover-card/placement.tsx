'use client';

import { Button, HoverCard } from '@akhatmirzo/ui';

const sides = ['top', 'right', 'bottom', 'left'] as const;

export default function HoverCardPlacement() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sides.map((side) => (
        <HoverCard key={side} openDelay={200} closeDelay={100}>
          <HoverCard.Trigger asChild>
            <Button variant="outline">{side}</Button>
          </HoverCard.Trigger>
          <HoverCard.Content side={side} size="sm">
            <p className="m-0">
              Panel <b>{side}</b> tomonda. Ekran chetiga yetsa, o'zi teskari tomonga o'tadi.
            </p>
          </HoverCard.Content>
        </HoverCard>
      ))}
    </div>
  );
}
