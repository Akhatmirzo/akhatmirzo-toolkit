'use client';

import { Button, Dialog, Field, Input, Textarea, toast } from '@akhatmirzo/ui';
import { useState } from 'react';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DialogAsyncSubmit() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    setSending(true);
    await wait(1500);
    setSending(false);
    setOpen(false);
    toast.success('Fikringiz yuborildi');
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !sending && setOpen(next)}>
      <Dialog.Trigger asChild>
        <Button>Fikr bildirish</Button>
      </Dialog.Trigger>
      <Dialog.Content title="Fikr bildirish" size="lg" dismissible={!sending}>
        <div className="flex flex-col gap-4">
          <Field label="Mavzu" required>
            <Input placeholder="Masalan: yetkazib berish" />
          </Field>
          <Field label="Xabar">
            <Textarea minRows={4} placeholder="Fikringizni yozing..." />
          </Field>
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button disabled={sending}>Bekor qilish</Button>
          </Dialog.Close>
          <Button variant="primary" loading={sending} onClick={send}>
            Yuborish
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
