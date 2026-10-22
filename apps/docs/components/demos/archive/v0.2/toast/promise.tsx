'use client';

import { Button, toast } from '@akhatmirzo/ui';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveOrder() {
  await wait(1500);
  return 1042;
}

async function failingRequest(): Promise<void> {
  await wait(1200);
  throw new Error('Server javob bermadi');
}

export default function ToastPromise() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(saveOrder, {
            loading: 'Saqlanmoqda...',
            success: (id) => `Buyurtma #${id} saqlandi`,
            error: 'Xatolik yuz berdi',
          })
        }
      >
        Muvaffaqiyatli
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast
            .promise(failingRequest, {
              loading: 'Yuborilmoqda...',
              success: 'Yuborildi',
              error: (e) => `Xatolik: ${(e as Error).message}`,
            })
            .catch(() => {})
        }
      >
        Xato bilan
      </Button>
    </div>
  );
}
