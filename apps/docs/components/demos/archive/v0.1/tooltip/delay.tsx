'use client';

import { Button, Tooltip } from '@akhatmirzo/ui';

export default function TooltipDelay() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tooltip content="Darhol chiqadi" delay={0}>
        <Button>delay=0</Button>
      </Tooltip>
      <Tooltip content="Bir soniya kutadi" delay={1000}>
        <Button>delay=1000</Button>
      </Tooltip>
      <Tooltip content="Uzun izoh 240px dan oshsa, keyingi qatorga o'raladi: buyurtma holati har 5 daqiqada yangilanadi.">
        <Button>Uzun matn</Button>
      </Tooltip>
    </div>
  );
}
