'use client';

import { Alert, Button } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function AlertActions() {
  const [open, setOpen] = useState(true);

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Xabarni qaytarish
      </Button>
    );
  }

  return (
    <Alert
      className="max-w-xl"
      color="danger"
      title="To'lov o'tmadi"
      action={
        <Button size="sm" variant="outline">
          Qayta urinish
        </Button>
      }
      onClose={() => setOpen(false)}
    >
      Bank to'lovni rad etdi. Karta ma'lumotlarini tekshiring.
    </Alert>
  );
}
