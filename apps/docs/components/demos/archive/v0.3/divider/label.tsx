'use client';

import { Button, Divider } from '@akhatmirzo/ui';

export default function DividerLabel() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Button variant="primary" fullWidth>
        Telefon orqali kirish
      </Button>
      <Divider label="yoki" />
      <Button variant="outline" fullWidth>
        Google orqali kirish
      </Button>
    </div>
  );
}
