'use client';

import { Field, Input, Textarea } from '@akhatmirzo/ui';

export default function FieldHorizontal() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <Field orientation="horizontal" label="Do'kon nomi" description="Chekda ko'rinadi">
        <Input defaultValue="Bahor Market" />
      </Field>
      <Field orientation="horizontal" label="Manzil">
        <Textarea minRows={2} defaultValue="Toshkent, Chilonzor tumani, 9-kvartal" />
      </Field>
    </div>
  );
}
