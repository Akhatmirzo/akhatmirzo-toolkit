'use client';

import { Button, toast } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Saqlandi');
    }, 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" loading={saving} onClick={save}>
        Saqlash
      </Button>
      <Button variant="outline" loading labels={{ loading: 'Yuborilmoqda' }}>
        Yuborish
      </Button>
      <Button disabled>O'chirilgan</Button>
    </div>
  );
}
