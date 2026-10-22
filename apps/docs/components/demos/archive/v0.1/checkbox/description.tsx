'use client';

import { Checkbox } from '@akhatmirzo/ui';

export default function CheckboxDescription() {
  return (
    <div className="flex max-w-sm flex-col gap-4">
      <Checkbox
        label="Yangiliklar"
        description="Haftasiga bir marta yangi imkoniyatlar haqida xat"
        defaultChecked
      />
      <Checkbox
        size="sm"
        label="Qurilmani eslab qolish"
        description="30 kun davomida qayta kod so'ralmaydi"
      />
    </div>
  );
}
