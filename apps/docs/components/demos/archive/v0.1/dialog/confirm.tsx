'use client';

import { Button, confirm, toast } from '@akhatmirzo/ui';
import { Trash2 } from 'lucide-react';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function DialogConfirm() {
  const removeOrder = async () => {
    const ok = await confirm({
      title: "Buyurtma o'chirilsinmi?",
      description: "Bu amalni qaytarib bo'lmaydi.",
      confirmText: "O'chirish",
      variant: 'danger',
    });
    if (ok) toast.success("Buyurtma #1042 o'chirildi");
  };

  const publish = async () => {
    const ok = await confirm({
      title: 'Mahsulot nashr qilinsinmi?',
      description: "Mahsulot do'konda hammaga ko'rinadi.",
      confirmText: 'Nashr qilish',
      // Promise tugaguncha tugma loading, oyna ochiq turadi
      onConfirm: () => wait(1500),
    });
    if (ok) toast.success('Mahsulot nashr qilindi');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="danger" leftIcon={<Trash2 />} onClick={removeOrder}>
        O'chirish
      </Button>
      <Button variant="primary" onClick={publish}>
        Nashr qilish
      </Button>
    </div>
  );
}
