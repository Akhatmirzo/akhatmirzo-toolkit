'use client';

import { Field, Input } from '@akhatmirzo/ui';

export default function FieldBasic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Telefon" required description="Tasdiqlash kodi SMS orqali yuboriladi">
        <Input prefix="+998" placeholder="90 123 45 67" inputMode="tel" />
      </Field>
      <Field label="Email" error="Email manzil noto'g'ri">
        <Input type="email" defaultValue="sarvar@mail" />
      </Field>
    </div>
  );
}
