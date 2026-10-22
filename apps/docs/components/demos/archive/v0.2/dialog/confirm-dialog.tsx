'use client';

import { Button, ConfirmDialog, toast } from '@akhatmirzo/ui';

export default function DialogConfirmDeclarative() {
  return (
    <ConfirmDialog
      trigger={<Button variant="outline">Hisobdan chiqish</Button>}
      title="Hisobdan chiqilsinmi?"
      description="Qayta kirish uchun SMS kod kerak bo'ladi."
      confirmText="Chiqish"
      onConfirm={() => toast('Hisobdan chiqdingiz')}
      onCancel={() => toast.info('Hisobda qoldingiz')}
    />
  );
}
