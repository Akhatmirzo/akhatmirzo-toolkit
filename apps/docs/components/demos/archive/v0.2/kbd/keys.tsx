'use client';

import { Kbd } from '@akhatmirzo/ui';

export default function KbdKeys() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Kbd keys={['mod', 'K']} />
      <Kbd keys={['mod', 'Shift', 'P']} />
      <Kbd keys={['Alt', 'F4']} />
      <Kbd>Esc</Kbd>
      <Kbd>↵</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
    </div>
  );
}
