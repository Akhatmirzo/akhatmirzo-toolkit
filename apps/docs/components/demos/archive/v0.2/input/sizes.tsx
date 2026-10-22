'use client';

import { Button, Input } from '@akhatmirzo/ui';

export default function InputSizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input size="sm" placeholder="Kichik · 32" aria-label="Kichik" />
        <Button size="sm">Qo'llash</Button>
      </div>
      <div className="flex items-center gap-2">
        <Input size="md" placeholder="O'rta · 40" aria-label="O'rta" />
        <Button size="md">Qo'llash</Button>
      </div>
      <div className="flex items-center gap-2">
        <Input size="lg" placeholder="Katta · 48" aria-label="Katta" />
        <Button size="lg">Qo'llash</Button>
      </div>
    </div>
  );
}
