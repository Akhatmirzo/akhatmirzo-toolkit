'use client';

import { Button, Tooltip } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function TooltipControlled() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" onClick={() => setOpen((o) => !o)}>
        {open ? 'Yashirish' : "Ko'rsatish"}
      </Button>
      <Tooltip content="Boshqariladigan tooltip" open={open} onOpenChange={setOpen}>
        <Button>Nishon</Button>
      </Tooltip>
      <Tooltip content="Bu matn chiqmaydi" disabled>
        <Button>disabled</Button>
      </Tooltip>
    </div>
  );
}
