'use client';

import { Badge } from '@akhatmirzo/ui';

export default function BadgeSizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm" color="primary">
        Kichik
      </Badge>
      <Badge size="md" color="primary">
        O'rta
      </Badge>
    </div>
  );
}
