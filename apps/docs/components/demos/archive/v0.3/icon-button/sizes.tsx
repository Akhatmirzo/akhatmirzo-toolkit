'use client';

import { IconButton } from '@akhatmirzo/ui';
import { X } from 'lucide-react';

export default function IconButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton variant="outline" size="sm" aria-label="Yopish">
        <X />
      </IconButton>
      <IconButton variant="outline" size="md" aria-label="Yopish">
        <X />
      </IconButton>
      <IconButton variant="outline" size="lg" aria-label="Yopish">
        <X />
      </IconButton>
    </div>
  );
}
