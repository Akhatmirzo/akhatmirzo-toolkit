'use client';

import { Button, Popover } from '@akhatmirzo/ui';

export default function PopoverPlacement() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Popover key={side}>
          <Popover.Trigger asChild>
            <Button variant="outline">{side}</Button>
          </Popover.Trigger>
          <Popover.Content side={side} arrow className="w-56" aria-label={`Tomon: ${side}`}>
            <p className="m-0 text-text-muted">
              Panel <b className="text-text">{side}</b> tomonda, triggerdan 6px uzoqlikda.
            </p>
          </Popover.Content>
        </Popover>
      ))}
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="outline">align=end</Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-56" aria-label="O'ngga tekislangan">
          <p className="m-0 text-text-muted">Panel triggerning o'ng chetiga tekislangan.</p>
        </Popover.Content>
      </Popover>
    </div>
  );
}
