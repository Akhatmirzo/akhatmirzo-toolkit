'use client';

import { Button, Input, Popover } from '@akhatmirzo/ui';
import { Funnel } from 'lucide-react';
import { useState } from 'react';

export default function PopoverFilter() {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState({ from: '', to: '' });
  const [applied, setApplied] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button leftIcon={<Funnel />}>Narx</Button>
        </Popover.Trigger>
        <Popover.Content align="start" aria-label="Narx filtri">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setApplied(`${range.from || '0'} – ${range.to || '∞'} so'm`);
              setOpen(false);
            }}
          >
            <p className="m-0 font-semibold">Narx oralig'i</p>
            <Input
              size="sm"
              inputMode="numeric"
              placeholder="dan"
              suffix="so'm"
              aria-label="Narx: dan"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
            <Input
              size="sm"
              inputMode="numeric"
              placeholder="gacha"
              suffix="so'm"
              aria-label="Narx: gacha"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
            <div className="mt-1 flex justify-end gap-2">
              <Popover.Close asChild>
                <Button size="sm">Bekor</Button>
              </Popover.Close>
              <Button size="sm" variant="primary" type="submit">
                Qo'llash
              </Button>
            </div>
          </form>
        </Popover.Content>
      </Popover>
      <span className="text-sm text-text-muted">{applied ?? "Filtr qo'llanmagan"}</span>
    </div>
  );
}
