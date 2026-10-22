'use client';

import { Badge } from '@akhatmirzo/ui';

export default function BadgeColors() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Qoralama</Badge>
      <Badge color="primary">Yangi</Badge>
      <Badge color="success">To'langan</Badge>
      <Badge color="warning">Kutilmoqda</Badge>
      <Badge color="danger">Bekor qilindi</Badge>
      <Badge color="info">Yo'lda</Badge>
    </div>
  );
}
