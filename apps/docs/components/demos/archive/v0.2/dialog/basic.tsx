'use client';

import { Button, Dialog, Field, Input } from '@akhatmirzo/ui';
import { useState } from 'react';

export default function DialogBasic() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Sarvar');
  const [phone, setPhone] = useState('+998 90 123 45 67');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="primary">Profilni tahrirlash</Button>
      </Dialog.Trigger>
      <Dialog.Content title="Profilni tahrirlash" description="O'zgarishlar darhol saqlanadi.">
        <div className="flex flex-col gap-4">
          <Field label="Ism">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Telefon" description="Tasdiqlash uchun SMS kod yuboriladi">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button>Bekor qilish</Button>
          </Dialog.Close>
          <Button variant="primary" onClick={() => setOpen(false)}>
            Saqlash
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
