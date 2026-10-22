'use client';

import { Button } from '@akhatmirzo/ui';

export default function ButtonVariants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Saqlash</Button>
      <Button>Soft</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">O'chirish</Button>
      <Button variant="link">Batafsil</Button>
    </div>
  );
}
