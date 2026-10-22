'use client';

import { Switch } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function SwitchControlled() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Switch label="Do'kon ochiq" checked={open} onCheckedChange={setOpen} />
      <span className="text-sm text-text-muted">
        {open ? 'Buyurtmalar qabul qilinmoqda' : "Buyurtmalar to'xtatilgan"}
      </span>
    </div>
  );
}
