'use client';

import { Badge } from '@akhatmirzo/ui';

export default function BadgeVariants() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="soft" color="success">
          Soft
        </Badge>
        <Badge variant="solid" color="success">
          Solid
        </Badge>
        <Badge variant="outline" color="success">
          Outline
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="soft" color="danger">
          Soft
        </Badge>
        <Badge variant="solid" color="danger">
          Solid
        </Badge>
        <Badge variant="outline" color="danger">
          Outline
        </Badge>
      </div>
    </div>
  );
}
