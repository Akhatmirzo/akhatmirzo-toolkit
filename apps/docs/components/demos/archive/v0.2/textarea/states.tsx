'use client';

import { Textarea } from '@akhatmirzo/ui';

export default function TextareaStates() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
      <Textarea minRows={2} invalid defaultValue="Juda qisqa" aria-label="Xato" />
      <Textarea minRows={2} disabled defaultValue="O'chirilgan" aria-label="O'chirilgan" />
      <Textarea minRows={2} readOnly defaultValue="Faqat o'qish uchun" aria-label="Faqat o'qish" />
      <Textarea minRows={2} size="sm" placeholder="Kichik o'lcham" aria-label="Kichik" />
    </div>
  );
}
