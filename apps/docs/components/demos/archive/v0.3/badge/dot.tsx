'use client';

import { Badge } from '@akhatmirzo/ui';

export default function BadgeDot() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge dot color="success">
        Onlayn
      </Badge>
      <Badge dot color="warning" variant="outline">
        Tekshirilmoqda
      </Badge>
      <Badge dot color="danger" variant="solid">
        To'xtatilgan
      </Badge>
    </div>
  );
}
