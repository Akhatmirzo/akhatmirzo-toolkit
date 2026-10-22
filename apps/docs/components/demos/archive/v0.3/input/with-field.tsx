'use client';

import { Field, Input } from '@akhatmirzo/ui';
import { Mail } from 'lucide-react';

export default function InputWithField() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Telefon" required description="Tasdiqlash kodi SMS orqali keladi">
        <Input prefix="+998" placeholder="90 123 45 67" inputMode="tel" />
      </Field>
      <Field label="Email" error="Email manzil noto'g'ri">
        <Input leftIcon={<Mail />} defaultValue="sarvar@mail" clearable />
      </Field>
    </div>
  );
}
