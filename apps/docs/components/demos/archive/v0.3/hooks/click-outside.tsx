'use client';

import { useClickOutside, useHotkeys, useToggle } from '@akhatmirzo/hooks';
import { Button } from '@akhatmirzo/ui';
import { useRef } from 'react';

export default function HooksClickOutside() {
  const [open, toggle, setOpen] = useToggle(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, panelRef], () => setOpen(false), open);
  useHotkeys('esc', () => setOpen(false), { enabled: open });

  return (
    <div className="relative flex flex-col items-center gap-2">
      <Button ref={triggerRef} variant="outline" onClick={toggle} aria-expanded={open}>
        Filtrlar
      </Button>
      {open && (
        <div
          ref={panelRef}
          className="w-64 rounded-xl border border-border bg-surface-raised p-4 text-sm text-text shadow-lg"
        >
          Panel tashqarisiga bosing yoki <kbd className="font-mono">Esc</kbd> ni bosing — yopiladi.
        </div>
      )}
    </div>
  );
}
