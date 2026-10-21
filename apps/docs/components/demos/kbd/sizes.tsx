'use client';

import { Kbd } from '@akhatmirzo/ui';

export default function KbdSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Kbd keys={['mod', 'C']} />
      <Kbd size="md" keys={['mod', 'C']} />
    </div>
  );
}
