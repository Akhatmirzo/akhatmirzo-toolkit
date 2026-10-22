'use client';

import { useFocusTrap, useHotkeys, useToggle } from '@akhatmirzo/hooks';
import { Button, Field, Input } from '@akhatmirzo/ui';
import { useRef } from 'react';

export default function HooksFocusTrap() {
  const [open, toggle, setOpen] = useToggle(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(panelRef, open, { initialFocus: inputRef });
  useHotkeys('esc', () => setOpen(false), { enabled: open, enableOnInputs: true });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <Button variant="outline" onClick={toggle} aria-expanded={open}>
        {open ? 'Yopish' : "Manzil qo'shish"}
      </Button>
      {open && (
        <div
          ref={panelRef}
          className="flex w-full flex-col gap-3 rounded-xl border border-border bg-surface-raised p-4 shadow-lg"
        >
          <Field label="Shahar">
            <Input ref={inputRef} placeholder="Toshkent" />
          </Field>
          <Field label="Ko'cha">
            <Input placeholder="Amir Temur ko'chasi, 15" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Saqlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
