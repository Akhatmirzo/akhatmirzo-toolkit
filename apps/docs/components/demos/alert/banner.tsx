'use client';

import { Alert, Button } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function AlertBanner() {
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-surface">
      {open && (
        <Alert banner color="primary" onClose={() => setOpen(false)}>
          Bugun 23:00 dan 01:00 gacha texnik ishlar olib boriladi.
        </Alert>
      )}
      <div className="flex items-center justify-between gap-3 p-6 text-sm text-text-muted">
        Sahifa kontenti
        {!open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            Qaytarish
          </Button>
        )}
      </div>
    </div>
  );
}
