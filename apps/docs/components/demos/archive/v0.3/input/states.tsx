'use client';

import { Input } from '@akhatmirzo/ui';

export default function InputStates() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
      <Input placeholder="Oddiy" aria-label="Oddiy" />
      <Input invalid defaultValue="sarvar@mail" aria-label="Xato" />
      <Input disabled defaultValue="O'chirilgan" aria-label="O'chirilgan" />
      <Input readOnly defaultValue="Faqat o'qish uchun" aria-label="Faqat o'qish" />
    </div>
  );
}
