'use client';

import { Button } from '@akhatmirzo/ui';

export default function ButtonFullWidth() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Button variant="primary" fullWidth>
        Kirish
      </Button>
      <Button variant="outline" fullWidth>
        Ro'yxatdan o'tish
      </Button>
    </div>
  );
}
