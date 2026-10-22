'use client';

import { Button } from '@akhatmirzo/ui';

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Kichik · 32</Button>
      <Button size="md">O'rta · 40</Button>
      <Button size="lg">Katta · 48</Button>
    </div>
  );
}
