'use client';

import { Button, toast } from '@akhatmirzo/ui';

export default function ToastAction() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success('Buyurtma yaratildi', {
            description: "#1042 · 1 250 000 so'm",
            action: { label: "Ko'rish", onClick: () => toast.info('Buyurtma #1042 ochildi') },
          })
        }
      >
        Amal bilan
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Mahsulot o'chirildi", {
            description: 'iPhone 15 Pro, 256 GB',
            action: {
              label: 'Qaytarish',
              onClick: () => toast.success('Mahsulot qaytarildi'),
            },
          })
        }
      >
        Bekor qilish (undo)
      </Button>
    </div>
  );
}
