'use client';

import { Button, Tooltip } from '@akhatmirzo/ui';

export default function TooltipDisabledButton() {
  return (
    <Tooltip content="Ruxsat yo'q: faqat administrator saqlay oladi">
      <span tabIndex={0} className="focus-ring inline-flex rounded-lg">
        <Button variant="primary" disabled>
          Saqlash
        </Button>
      </span>
    </Tooltip>
  );
}
