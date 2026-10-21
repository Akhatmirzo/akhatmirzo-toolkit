'use client';

import { Button, Tooltip } from '@akhatmirzo/ui';

export default function TooltipSides() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} content={`Tomon: ${side}`} side={side}>
          <Button variant="outline">{side}</Button>
        </Tooltip>
      ))}
    </div>
  );
}
