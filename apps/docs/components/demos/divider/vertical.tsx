'use client';

import { Divider } from '@akhatmirzo/ui';

export default function DividerVertical() {
  return (
    <div className="flex h-5 items-center gap-3 text-sm font-medium text-text-subtle">
      <span>Bosh sahifa</span>
      <Divider orientation="vertical" decorative />
      <span>Buyurtmalar</span>
      <Divider orientation="vertical" decorative />
      <span>Sozlamalar</span>
    </div>
  );
}
