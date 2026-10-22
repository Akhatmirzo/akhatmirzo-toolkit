'use client';

import { Field, Textarea } from '@akhatmirzo/ui';

export default function TextareaWithField() {
  return (
    <div className="w-full max-w-md">
      <Field label="Izoh" required description="Kuryer uchun qo'shimcha ma'lumot">
        <Textarea
          autoResize
          showCount
          maxLength={300}
          placeholder="Masalan: 3-podyezd, domofon ishlamaydi"
        />
      </Field>
    </div>
  );
}
