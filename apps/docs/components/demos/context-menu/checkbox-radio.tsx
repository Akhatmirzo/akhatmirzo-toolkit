'use client';

import { ContextMenu, cn } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function ContextMenuCheckboxRadio() {
  const [grid, setGrid] = useState(true);
  const [rulers, setRulers] = useState(false);
  const [zoom, setZoom] = useState('100');

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div
          className={cn(
            'grid h-48 w-full max-w-md place-items-center rounded-xl border border-border bg-surface text-sm text-text-muted select-none',
            grid && 'border-dashed',
            rulers && 'border-l-4 border-t-4',
          )}
        >
          Kanvas · {zoom}% — o'ng tugma bilan bosing
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Label>Ko'rinish</ContextMenu.Label>
        <ContextMenu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
          Panjara
        </ContextMenu.CheckboxItem>
        <ContextMenu.CheckboxItem checked={rulers} onCheckedChange={setRulers}>
          Chizg'ichlar
        </ContextMenu.CheckboxItem>
        <ContextMenu.Separator />
        <ContextMenu.Label>Masshtab</ContextMenu.Label>
        <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenu.RadioItem value="50">50%</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="100">100%</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="200">200%</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.Content>
    </ContextMenu>
  );
}
