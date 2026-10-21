'use client';

import { Kbd } from '@akhatmirzo/ui';

export default function KbdBasic() {
  return (
    <p className="text-sm text-text">
      Qidiruvni ochish uchun <Kbd keys={['mod', 'K']} /> ni bosing, yopish uchun <Kbd>Esc</Kbd>.
    </p>
  );
}
