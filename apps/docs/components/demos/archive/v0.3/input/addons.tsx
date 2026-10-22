'use client';

import { Input } from '@akhatmirzo/ui';
import { Mail } from 'lucide-react';

export default function InputAddons() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input prefix="+998" placeholder="90 123 45 67" inputMode="tel" aria-label="Telefon" />
      <Input suffix="so'm" placeholder="1 250 000" inputMode="numeric" aria-label="Narx" />
      <Input rightIcon={<Mail />} type="email" placeholder="email@misol.uz" aria-label="Email" />
      <Input prefix="https://" suffix=".uz" placeholder="dokon" aria-label="Sayt manzili" />
    </div>
  );
}
